import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import ServiceToggleSwitch from '../ServiceToggleSwitch';
import type {WeatherService} from '../../services/types';

describe('ServiceToggleSwitch', () => {
  const options: ReadonlyArray<WeatherService> = [
    'Open-Meteo',
    'OpenWeatherMap',
  ];
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders both options correctly', () => {
    const {getByText} = render(
      <ServiceToggleSwitch
        options={options}
        selected="Open-Meteo"
        onSelect={mockOnSelect}
      />,
    );

    expect(getByText('Open-Meteo')).toBeTruthy();
    expect(getByText('OpenWeatherMap')).toBeTruthy();
  });

  it('calls onSelect with the second option when toggled on', () => {
    const {getByRole} = render(
      <ServiceToggleSwitch
        options={options}
        selected="Open-Meteo"
        onSelect={mockOnSelect}
      />,
    );

    const switchComponent = getByRole('switch');

    fireEvent(switchComponent, 'valueChange', true);
    expect(mockOnSelect).toHaveBeenCalledWith('OpenWeatherMap');
  });

  it('calls onSelect with the first option when toggled off', () => {
    const {getByRole} = render(
      <ServiceToggleSwitch
        options={options}
        selected="OpenWeatherMap"
        onSelect={mockOnSelect}
      />,
    );

    const switchComponent = getByRole('switch');

    fireEvent(switchComponent, 'valueChange', false);
    expect(mockOnSelect).toHaveBeenCalledWith('Open-Meteo');
  });

  it('applies styles based on the selected prop', () => {
    const {getByText} = render(
      <ServiceToggleSwitch
        options={options}
        selected="OpenWeatherMap"
        onSelect={mockOnSelect}
      />,
    );

    const activeLabel = getByText('OpenWeatherMap');
    const inactiveLabel = getByText('Open-Meteo');

    expect(activeLabel.props.style).toContainEqual(
      expect.objectContaining({opacity: 1}),
    );
    expect(inactiveLabel.props.style).toContainEqual(
      expect.objectContaining({opacity: 0.45}),
    );
  });
});
