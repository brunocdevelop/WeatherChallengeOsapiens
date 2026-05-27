export interface Location {
  query: string;
  lon?: number;
  lat?: number;
}

export interface WeatherData {
  /** Temperature in degrees Celsius. */
  temperature: number;
  /** Short textual description of conditions (e.g. "Clear", "Cloudy"). */
  condition: string;
  /** Location label as resolved by the service (may differ from query). */
  location: string;
  /** Name of the service that produced this data — useful for the UI. */
  source: string;
  humidity?: number;
  feelsLike?: number;
  windSpeed?: number;
}

/**
 * Error thrown by service implementations. Use (or replace with) something
 * that lets the UI distinguish user-fixable errors (bad location) from
 * service errors (provider down, network issue).
 */
export class WeatherServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'NOT_FOUND'
      | 'NETWORK'
      | 'SERVICE_UNAVAILABLE'
      | 'UNKNOWN',
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

export type WeatherService = 'Open-Meteo' | 'OpenWeatherMap';
