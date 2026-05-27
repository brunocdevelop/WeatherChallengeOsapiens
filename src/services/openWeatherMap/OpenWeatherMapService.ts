import {OPENWEATHERMAP_API_KEY} from '@env';
import type {IWeatherService} from '../IWeatherService';
import {type Location, type WeatherData, WeatherServiceError} from '../types';
import type {OpenWeatherMapData} from './openWeatherMapTypes';

export class OpenWeatherMapService implements IWeatherService {
  readonly name = 'OpenWeatherMap';
  private apiKey: string;

  // Dependency Injection: Defaults to your env variable, but allows test overrides
  constructor(apiKey: string = OPENWEATHERMAP_API_KEY) {
    this.apiKey = apiKey;
  }

  async fetchWeather(location: Location): Promise<WeatherData> {

    if (!this.apiKey) {
      throw new WeatherServiceError(
        'OpenWeatherMapService: OPENWEATHERMAP_API_KEY is missing from environment variables.',
        'SERVICE_UNAVAILABLE',
      );
    }

    try {
      let queryParams = '';

      if (location.lat !== undefined && location.lon !== undefined) {
        queryParams = `lat=${location.lat}&lon=${location.lon}`;
      } else {
        if (!location.query || location.query.trim() === '') {
          throw new WeatherServiceError(
            'Location query cannot be empty when coordinates are missing.',
            'NOT_FOUND',
          );
        }
        queryParams = `q=${encodeURIComponent(location.query)}`;
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?${queryParams}&units=metric&appid=${this.apiKey}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorCode =
          response.status === 404 ? 'NOT_FOUND' : 'SERVICE_UNAVAILABLE';

        let errorMsg = `Request failed with status ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.message) errorMsg += ` - ${errData.message}`;
        } catch {
          // Fallback if response isn't JSON
        }
        throw new WeatherServiceError(
          `OpenWeatherMapService: ${errorMsg}`,
          errorCode,
        );
      }

      const data: OpenWeatherMapData = await response.json();

      const countryCode = data.sys?.country ? `, ${data.sys.country}` : '';
      const displayName = data.name
        ? `${data.name}${countryCode}`
        : location.query;

      return {
        location: displayName,
        temperature: data.main?.temp,
        condition: data.weather?.[0]?.description
          ? data.weather[0].description.charAt(0).toUpperCase() +
            data.weather[0].description.slice(1)
          : 'Unknown',
        feelsLike: data.main?.feels_like,
        humidity: data.main?.humidity,
        windSpeed: data.wind?.speed,
        source: this.name,
      };
    } catch (error) {
      if (error instanceof WeatherServiceError) {
        throw error;
      }

      throw new WeatherServiceError(
        error instanceof Error
          ? error.message
          : 'A network error occurred while fetching weather data.',
        'NETWORK',
      );
    }
  }
}
