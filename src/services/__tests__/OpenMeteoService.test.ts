import {OpenMeteoService} from '../openMeteo/OpenMeteoService';
import {WeatherServiceError} from '../types';

const mockGeoResponse = {
  results: [
    {
      id: 1,
      name: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
      elevation: 11,
      feature_code: 'PPLC',
      country_code: 'GB',
      admin1_id: 1,
      admin2_id: 2,
      timezone: 'Europe/London',
      population: 8982000,
      country_id: 1,
      country: 'United Kingdom',
      admin1: 'England',
      admin2: 'Greater London',
    },
  ],
  generationtime_ms: 1.23,
};

const mockForecastResponse = {
  latitude: 51.5074,
  longitude: -0.1278,
  generationtime_ms: 1.23,
  utc_offset_seconds: 0,
  timezone: 'Europe/London',
  timezone_abbreviation: 'GMT',
  elevation: 11,
  current_weather_units: {
    time: 'iso8601',
    interval: 'seconds',
    temperature: '°C',
    windspeed: 'km/h',
    winddirection: '°',
    is_day: '',
    weathercode: 'wmo code',
  },
  current_weather: {
    time: '2024-01-01T12:00',
    interval: 900,
    temperature: 12.5,
    windspeed: 15.2,
    winddirection: 180,
    is_day: 1,
    weathercode: 0,
  },
};

// Helper to mock two sequential fetch calls using jest.spyOn
const mockFetchSequence = (responses: {ok: boolean; data: any}[]) => {
  let callCount = 0;
  // Use globalThis instead of global
  jest.spyOn(globalThis, 'fetch').mockImplementation(() => {
    const response = responses[callCount++];
    return Promise.resolve({
      ok: response.ok,
      status: response.ok ? 200 : 500,
      json: () => Promise.resolve(response.data),
    } as Response);
  });
};

describe('OpenMeteoService', () => {
  let service: OpenMeteoService;

  beforeEach(() => {
    service = new OpenMeteoService();
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Completely restore fetch to its native state after the suite runs
    jest.restoreAllMocks();
  });

  describe('fetchWeather — happy path', () => {
    it('returns mapped WeatherData for a valid text query', async () => {
      mockFetchSequence([
        {ok: true, data: mockGeoResponse},
        {ok: true, data: mockForecastResponse},
      ]);

      const result = await service.fetchWeather({query: 'London'});

      expect(result).toEqual({
        location: 'London, England, United Kingdom',
        temperature: 12.5,
        condition: 'Clear sky',
        humidity: undefined,
        windSpeed: 15.2,
        source: 'Open-Meteo',
      });
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it('skips geocoding when lat/lon are provided', async () => {
      jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockForecastResponse),
      } as Response);

      const result = await service.fetchWeather({
        query: 'London',
        lat: 51.5074,
        lon: -0.1278,
      });

      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      expect(result.temperature).toBe(12.5);
      // Added assertion to verify fallback location string
      expect(result.location).toBe('London');
    });

    it('builds displayName correctly when admin1 is missing', async () => {
      const geoWithoutAdmin1 = {
        ...mockGeoResponse,
        results: [{...mockGeoResponse.results[0], admin1: undefined}],
      };
      mockFetchSequence([
        {ok: true, data: geoWithoutAdmin1},
        {ok: true, data: mockForecastResponse},
      ]);

      const result = await service.fetchWeather({query: 'London'});
      expect(result.location).toBe('London, United Kingdom');
    });
  });

  describe('fetchWeather — validation errors', () => {
    it('throws NOT_FOUND for empty query', async () => {
      await expect(service.fetchWeather({query: '   '})).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });
  });

  describe('fetchWeather — geocoding errors', () => {
    it('throws NOT_FOUND when geocoding returns no results', async () => {
      jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({results: [], generationtime_ms: 1}),
      } as Response);

      await expect(
        service.fetchWeather({query: 'Xyzabc123'}),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('throws SERVICE_UNAVAILABLE when geocoding request fails', async () => {
      jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({ok: false, status: 500} as Response);

      await expect(
        service.fetchWeather({query: 'London'}),
      ).rejects.toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
      });
    });
  });

  describe('fetchWeather — forecast errors', () => {
    it('throws SERVICE_UNAVAILABLE when forecast request fails', async () => {
      mockFetchSequence([
        {ok: true, data: mockGeoResponse},
        {ok: false, data: {}},
      ]);

      await expect(
        service.fetchWeather({query: 'London'}),
      ).rejects.toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
      });
    });

    it('throws UNKNOWN when current_weather is missing from response', async () => {
      const forecastWithoutCurrent = {
        ...mockForecastResponse,
        current_weather: undefined,
      };
      mockFetchSequence([
        {ok: true, data: mockGeoResponse},
        {ok: true, data: forecastWithoutCurrent},
      ]);

      await expect(
        service.fetchWeather({query: 'London'}),
      ).rejects.toMatchObject({
        code: 'UNKNOWN',
      });
    });

    it('throws NETWORK on fetch network failure', async () => {
      jest
        .spyOn(globalThis, 'fetch')
        .mockRejectedValueOnce(new Error('Network request failed'));

      await expect(
        service.fetchWeather({query: 'London'}),
      ).rejects.toMatchObject({
        code: 'NETWORK',
      });
    });
  });

  describe('mapWeatherCode — via fetchWeather', () => {
    const fetchWithCode = async (
      serviceForTest: OpenMeteoService,
      code: number,
    ) => {
      const forecast = {
        ...mockForecastResponse,
        current_weather: {
          ...mockForecastResponse.current_weather,
          weathercode: code,
        },
      };
      mockFetchSequence([
        {ok: true, data: mockGeoResponse},
        {ok: true, data: forecast},
      ]);
      return serviceForTest.fetchWeather({query: 'London'});
    };

    it.each([
      [0, 'Clear sky'],
      [1, 'Mainly clear, partly cloudy, or overcast'],
      [45, 'Foggy'],
      [61, 'Rain'],
      [95, 'Thunderstorm'],
      [99, 'Thunderstorm'],
      [999, 'Unknown conditions'],
    ])('weathercode %i maps to "%s"', async (code, expected) => {
      const result = await fetchWithCode(service, code);
      expect(result.condition).toBe(expected);
    });
  });

  it('all thrown errors are instances of WeatherServiceError', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('offline'));
    await expect(
      service.fetchWeather({query: 'London'}),
    ).rejects.toBeInstanceOf(WeatherServiceError);
  });
});
