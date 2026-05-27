import {OpenWeatherMapService} from '../openWeatherMap/OpenWeatherMapService';
import {WeatherServiceError} from '../types';

const mockWeatherResponse = {
  coord: {lon: -0.1278, lat: 51.5074},
  weather: [{id: 800, main: 'Clear', description: 'clear sky', icon: '01d'}],
  base: 'stations',
  main: {
    temp: 15.3,
    feels_like: 14.1,
    temp_min: 13.0,
    temp_max: 17.0,
    pressure: 1013,
    humidity: 72,
    sea_level: 1013,
    grnd_level: 1010,
  },
  visibility: 10000,
  wind: {speed: 5.1, deg: 220},
  clouds: {all: 0},
  dt: 1704067200,
  sys: {
    type: 2,
    id: 2075535,
    country: 'GB',
    sunrise: 1704006000,
    sunset: 1704034800,
  },
  timezone: 0,
  id: 2643743,
  name: 'London',
  cod: 200,
};

describe('OpenWeatherMapService', () => {
  let service: OpenWeatherMapService;

  beforeEach(() => {
    // Inject a dummy key to guarantee we never hit the real API
    service = new OpenWeatherMapService('test-api-key');
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('fetchWeather — happy path', () => {
    it('returns mapped WeatherData for a valid text query', async () => {
      jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWeatherResponse),
      } as Response);

      const result = await service.fetchWeather({query: 'London'});

      expect(result).toEqual({
        location: 'London, GB',
        temperature: 15.3,
        condition: 'Clear sky',
        feelsLike: 14.1,
        humidity: 72,
        windSpeed: 5.1,
        source: 'OpenWeatherMap',
      });
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('uses lat/lon query params when coordinates are provided', async () => {
      jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWeatherResponse),
      } as Response);

      await service.fetchWeather({query: 'London', lat: 51.5074, lon: -0.1278});

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('lat=51.5074&lon=-0.1278'),
      );
    });

    it('capitalizes condition correctly', async () => {
      const response = {
        ...mockWeatherResponse,
        weather: [
          {...mockWeatherResponse.weather[0], description: 'scattered clouds'},
        ],
      };
      jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(response),
      } as Response);

      const result = await service.fetchWeather({query: 'London'});
      expect(result.condition).toBe('Scattered clouds');
    });

    it('falls back to location.query when response name is missing', async () => {
      const response = {...mockWeatherResponse, name: ''};
      jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(response),
      } as Response);

      const result = await service.fetchWeather({query: 'London'});
      expect(result.location).toBe('London');
    });

    it('omits country code when sys.country is missing', async () => {
      const response = {
        ...mockWeatherResponse,
        sys: {...mockWeatherResponse.sys, country: ''},
      };
      jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(response),
      } as Response);

      const result = await service.fetchWeather({query: 'London'});
      expect(result.location).toBe('London');
    });
  });

  describe('fetchWeather — validation errors', () => {
    it('throws NOT_FOUND for empty text query', async () => {
      await expect(service.fetchWeather({query: '   '})).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });
  });

  describe('fetchWeather — API errors', () => {
    it('throws NOT_FOUND on 404 response', async () => {
      jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({message: 'city not found'}),
      } as Response);

      await expect(
        service.fetchWeather({query: 'Xyzabc123'}),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('throws SERVICE_UNAVAILABLE on 500 response', async () => {
      jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      } as Response);

      await expect(
        service.fetchWeather({query: 'London'}),
      ).rejects.toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
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

    it('all thrown errors are instances of WeatherServiceError', async () => {
      jest
        .spyOn(globalThis, 'fetch')
        .mockRejectedValueOnce(new Error('offline'));
      await expect(
        service.fetchWeather({query: 'London'}),
      ).rejects.toBeInstanceOf(WeatherServiceError);
    });
  });

  describe('fetchWeather — missing API key', () => {
    it('throws SERVICE_UNAVAILABLE when API key is missing', async () => {
      const serviceWithoutKey = new OpenWeatherMapService('');

      await expect(
        serviceWithoutKey.fetchWeather({query: 'London'}),
      ).rejects.toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
      });
      expect(globalThis.fetch).not.toHaveBeenCalled(); // ← add this
    });
  });
});
