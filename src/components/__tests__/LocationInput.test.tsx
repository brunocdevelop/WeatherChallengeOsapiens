import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import LocationInput from '../LocationInput';

describe('LocationInput', () => {
  const mockOnChangeText = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const {getByPlaceholderText} = render(
      <LocationInput value="" onChangeText={mockOnChangeText} />,
    );
    expect(getByPlaceholderText('Enter a location')).toBeTruthy();
  });

  it('calls onChangeText when the user types', () => {
    const {getByPlaceholderText} = render(
      <LocationInput value="" onChangeText={mockOnChangeText} />,
    );
    const input = getByPlaceholderText('Enter a location');

    fireEvent.changeText(input, 'London');
    expect(mockOnChangeText).toHaveBeenCalledWith('London');
  });

  it('calls onSubmit when the user submits the form', () => {
    const {getByPlaceholderText} = render(
      <LocationInput
        value="London"
        onChangeText={mockOnChangeText}
        onSubmit={mockOnSubmit}
      />,
    );
    const input = getByPlaceholderText('Enter a location');

    fireEvent(input, 'submitEditing');
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not crash on submit when onSubmit is not provided', () => {
    const {getByPlaceholderText} = render(
      <LocationInput value="London" onChangeText={mockOnChangeText} />,
    );
    const input = getByPlaceholderText('Enter a location');

    expect(() => fireEvent(input, 'submitEditing')).not.toThrow();
  });

  it('displays an error message when errorText prop is provided', () => {
    const errorMessage = 'Invalid location';
    const {getByText} = render(
      <LocationInput
        value=""
        onChangeText={mockOnChangeText}
        errorText={errorMessage}
      />,
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('does not display an error message when errorText is undefined', () => {
    const {queryByText} = render(
      <LocationInput value="" onChangeText={mockOnChangeText} />,
    );

    expect(queryByText('Invalid location')).toBeNull();
  });
});
