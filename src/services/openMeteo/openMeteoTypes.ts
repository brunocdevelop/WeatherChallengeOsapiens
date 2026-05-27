export interface OpenMeteoWeatherData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_weather_units: Currentweatherunits;
  current_weather: Currentweather;
}

interface Currentweather {
  time: string;
  interval: number;
  temperature: number;
  windspeed: number;
  winddirection: number;
  is_day: number;
  weathercode: number;
}

interface Currentweatherunits {
  time: string;
  interval: string;
  temperature: string;
  windspeed: string;
  winddirection: string;
  is_day: string;
  weathercode: string;
}

export interface OpenMeteoGeoData {
  results: Result[];
  generationtime_ms: number;
}

interface Result {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  feature_code: string;
  country_code: string;
  admin1_id: number;
  admin2_id: number;
  admin3_id?: number;
  timezone: string;
  population: number;
  postcodes?: string[];
  country_id: number;
  country: string;
  admin1: string;
  admin2: string;
  admin3?: string;
}
