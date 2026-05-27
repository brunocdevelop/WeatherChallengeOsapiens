import React from 'react';
import {render} from '@testing-library/react-native';
import WeatherDisplay from '../WeatherDisplay';
import type {WeatherData} from '../../services/types';

describe('WeatherDisplay', () => {
  const mockWeather: WeatherData = {
    location: 'Santander',
    temperature: 20,
    condition: 'Sunny',
    source: 'Open-Meteo',
  };

  it('renders loading indicator when loading prop is true', () => {
    const {getByText} = render(
      <WeatherDisplay weather={null} loading={true} />,
    );
    expect(getByText('Fetching weather…')).toBeTruthy();
  });

  it('renders error message when errorText is provided', () => {
    const errorMessage = 'Failed to fetch weather';
    const {getByText} = render(
      <WeatherDisplay weather={null} errorText={errorMessage} />,
    );
    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('renders empty state when no weather or error is provided', () => {
    const {getByText} = render(
      <WeatherDisplay weather={null} loading={false} />,
    );
    expect(getByText('Enter a location to see the weather.')).toBeTruthy();
  });

  it('renders weather details correctly when data is provided', () => {
    const {getByText} = render(<WeatherDisplay weather={mockWeather} />);

    expect(getByText('Santander')).toBeTruthy();
    expect(getByText('20')).toBeTruthy();
    expect(getByText('Sunny')).toBeTruthy();
    expect(getByText('via Open-Meteo')).toBeTruthy();
  });

  it('applies hot temperature color when temperature is >= 25', () => {
    const hotWeather = {...mockWeather, temperature: 30};
    const {getByText} = render(<WeatherDisplay weather={hotWeather} />);

    const tempElement = getByText('30');
    expect(tempElement.props.style).toContainEqual(
      expect.objectContaining({color: '#FF6B35'}),
    );
  });

  it('applies cold temperature color when temperature is <= 5', () => {
    const coldWeather = {...mockWeather, temperature: 2};
    const {getByText} = render(<WeatherDisplay weather={coldWeather} />);

    const tempElement = getByText('2');
    expect(tempElement.props.style).toContainEqual(
      expect.objectContaining({color: '#5B9BD5'}),
    );
  });

  it('loading state takes priority over errorText', () => {
    const {getByText, queryByText} = render(
      <WeatherDisplay weather={null} loading={true} errorText="Some error" />,
    );
    expect(getByText('Fetching weather…')).toBeTruthy();
    expect(queryByText('Some error')).toBeNull();
  });
});
