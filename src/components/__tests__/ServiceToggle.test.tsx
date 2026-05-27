import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import ServiceToggle from '../ServiceToggle';
import type {WeatherService} from '../../services/types';

describe('ServiceToggle', () => {
  const options: ReadonlyArray<WeatherService> = [
    'Open-Meteo',
    'OpenWeatherMap',
  ];
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders all options as buttons', () => {
    const {getByText} = render(
      <ServiceToggle
        options={options}
        selected="Open-Meteo"
        onSelect={mockOnSelect}
      />,
    );

    expect(getByText('Open-Meteo')).toBeTruthy();
    expect(getByText('OpenWeatherMap')).toBeTruthy();
  });

  it('renders nothing when options is empty', () => {
    const {toJSON} = render(
      <ServiceToggle
        options={[]}
        selected="Open-Meteo"
        onSelect={mockOnSelect}
      />,
    );

    // Only the container View renders, no buttons
    const tree = toJSON() as any;
    expect(tree.children).toBeNull();
  });

  it('calls onSelect with the correct service when a button is pressed', () => {
    const {getByText} = render(
      <ServiceToggle
        options={options}
        selected="Open-Meteo"
        onSelect={mockOnSelect}
      />,
    );

    fireEvent.press(getByText('OpenWeatherMap'));

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith('OpenWeatherMap');
  });

  it('still calls onSelect when the already-selected option is pressed', () => {
    const {getByText} = render(
      <ServiceToggle
        options={options}
        selected="Open-Meteo"
        onSelect={mockOnSelect}
      />,
    );

    fireEvent.press(getByText('Open-Meteo'));

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith('Open-Meteo');
  });

  it('applies selected styles to the active label', () => {
    const {getByText} = render(
      <ServiceToggle
        options={options}
        selected="OpenWeatherMap"
        onSelect={mockOnSelect}
      />,
    );

    const selectedLabel = getByText('OpenWeatherMap');
    const unselectedLabel = getByText('Open-Meteo');

    // Selected label receives labelSelected style (white + fontWeight 600)
    expect(selectedLabel.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({color: '#FFFFFF', fontWeight: '600'}),
      ]),
    );

    // Unselected label does not receive labelSelected style
    expect(unselectedLabel.props.style).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({color: '#FFFFFF', fontWeight: '600'}),
      ]),
    );
  });
});
