import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import WeatherScreen from '../WeatherScreen';

jest.mock('../../services/openMeteo/OpenMeteoService', () => ({
  OpenMeteoService: jest.fn().mockImplementation(() => ({
    name: 'Open-Meteo',
    fetchWeather: jest.fn().mockResolvedValue({
      location: 'London',
      temperature: 15,
      condition: 'Cloudy',
      source: 'Open-Meteo',
    }),
  })),
}));

jest.mock('../../services/openWeatherMap/OpenWeatherMapService', () => ({
  OpenWeatherMapService: jest.fn().mockImplementation(() => ({
    name: 'OpenWeatherMap',
    fetchWeather: jest.fn().mockResolvedValue({
      location: 'London',
      temperature: 18,
      condition: 'Sunny',
      source: 'OpenWeatherMap',
    }),
  })),
}));

jest.mock('../../validation/locationValidator', () => ({
  validateLocation: jest.fn(query =>
    query.length > 2
      ? {valid: true, value: query}
      : {valid: false, reason: 'Too short'},
  ),
}));

// Bypass the 500ms debounce so tests run synchronously
jest.mock('../../hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

describe('WeatherScreen', () => {
  it('updates weather when a valid location is typed', async () => {
    const {getByPlaceholderText, getByText} = render(<WeatherScreen />);

    const input = getByPlaceholderText(/enter a location/i);
    fireEvent.changeText(input, 'London');

    await waitFor(() => {
      expect(getByText('London')).toBeTruthy();
      expect(getByText('15')).toBeTruthy();
    });
  });

  it('shows error message for invalid input', async () => {
    const {getByPlaceholderText, getAllByText} = render(<WeatherScreen />);

    const input = getByPlaceholderText(/enter a location/i);
    fireEvent.changeText(input, 'Lo');

    await waitFor(() => {
      const errors = getAllByText('Too short');
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('re-fetches when the service toggle is switched', async () => {
    const {getByPlaceholderText, getByRole, getByText} = render(
      <WeatherScreen />,
    );

    const input = getByPlaceholderText(/enter a location/i);
    fireEvent.changeText(input, 'London');

    await waitFor(() => {
      expect(getByText('via Open-Meteo')).toBeTruthy();
    });

    const toggle = getByRole('switch');
    fireEvent(toggle, 'valueChange', true);

    await waitFor(() => {
      expect(getByText('via OpenWeatherMap')).toBeTruthy();
    });
  });
});
