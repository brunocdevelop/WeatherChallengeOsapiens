import type {IWeatherService} from '../IWeatherService';
import {Location, WeatherData, WeatherServiceError} from '../types';
import type {OpenMeteoGeoData, OpenMeteoWeatherData} from './openMeteoTypes';

export class OpenMeteoService implements IWeatherService {
  readonly name = 'Open-Meteo';

  async fetchWeather(location: Location): Promise<WeatherData> {
    let lat = location.lat;
    let lon = location.lon;
    let displayName = location.query;

    try {
      if (lat === undefined || lon === undefined) {
        if (!location.query || location.query.trim() === '') {
          throw new WeatherServiceError(
            'Location query cannot be empty when coordinates are missing.',
            'NOT_FOUND',
          );
        }

        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          location.query,
        )}&count=1&language=en&format=json`;
        const geoResponse = await fetch(geocodeUrl);

        if (!geoResponse.ok) {
          throw new WeatherServiceError(
            `Geocoding service unavailable (Status: ${geoResponse.status})`,
            'SERVICE_UNAVAILABLE',
          );
        }

        const geoData: OpenMeteoGeoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
          throw new WeatherServiceError(
            `Could not find coordinates for location: "${location.query}"`,
            'NOT_FOUND',
          );
        }

        const result = geoData.results[0];
        lat = result.latitude;
        lon = result.longitude;

        displayName = [result.name, result.admin1, result.country]
          .filter(Boolean)
          .join(', ');
      }

      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
      const forecastResponse = await fetch(forecastUrl);

      if (!forecastResponse.ok) {
        throw new WeatherServiceError(
          `Forecast service unavailable (Status: ${forecastResponse.status})`,
          'SERVICE_UNAVAILABLE',
        );
      }

      const forecastData: OpenMeteoWeatherData = await forecastResponse.json();
      const current = forecastData.current_weather;

      if (!current) {
        throw new WeatherServiceError(
          'Failed to parse current weather data from Open-Meteo.',
          'UNKNOWN',
        );
      }

      return {
        location: displayName,
        temperature: current.temperature,
        condition: this.mapWeatherCode(current.weathercode),
        humidity: undefined,
        windSpeed: current.windspeed,
        source: this.name,
      };
    } catch (error) {
      // If the error is already our custom WeatherServiceError, re-throw it directly
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

  /**
   * Helper to map WMO Weather Interpretation Codes (WW) to human-readable strings.
   * https://open-meteo.com/en/docs
   */
  private mapWeatherCode(code: number): string {
    if (code === 0) return 'Clear sky';
    if (code >= 1 && code <= 3)
      return 'Mainly clear, partly cloudy, or overcast';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 61 && code <= 65) return 'Rain';
    if (code >= 66 && code <= 67) return 'Freezing Rain';
    if (code >= 71 && code <= 75) return 'Snow fall';
    if (code === 77) return 'Snow grains';
    if (code >= 80 && code <= 82) return 'Rain showers';
    if (code >= 85 && code <= 86) return 'Snow showers';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Unknown conditions';
  }
}
