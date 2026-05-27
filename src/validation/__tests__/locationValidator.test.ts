import {validateLocation} from '../locationValidator';

describe('validateLocation', () => {
  it('returns valid for normal city names', () => {
    expect(validateLocation('London')).toEqual({valid: true, value: 'London'});
    expect(validateLocation('New York')).toEqual({
      valid: true,
      value: 'New York',
    });
    expect(validateLocation('Mont-Saint-Michel')).toEqual({
      valid: true,
      value: 'Mont-Saint-Michel',
    });
    expect(validateLocation('München')).toEqual({
      valid: true,
      value: 'München',
    });
  });

  it('accepts valid special characters', () => {
    expect(validateLocation("St. John's")).toEqual({
      valid: true,
      value: "St. John's",
    });
    expect(validateLocation('São Paulo')).toEqual({
      valid: true,
      value: 'São Paulo',
    });
    expect(validateLocation('Al-Riyadh')).toEqual({
      valid: true,
      value: 'Al-Riyadh',
    });
  });

  it('trims whitespace', () => {
    expect(validateLocation('  Paris  ')).toEqual({
      valid: true,
      value: 'Paris',
    });
  });

  it('rejects empty or whitespace-only strings', () => {
    expect(validateLocation('')).toEqual({
      valid: false,
      reason: 'Location cannot be empty',
    });
    expect(validateLocation('   ')).toEqual({
      valid: false,
      reason: 'Location cannot be empty',
    });
  });

  it('rejects strings that are too short', () => {
    expect(validateLocation('A')).toEqual({
      valid: false,
      reason: 'Location is too short',
    });
  });

  it('rejects strings that are too long', () => {
    const longString = 'a'.repeat(51);
    expect(validateLocation(longString)).toEqual({
      valid: false,
      reason: 'Location is too long',
    });
  });

  it('rejects invalid characters', () => {
    expect(validateLocation('London!')).toEqual({
      valid: false,
      reason: 'Invalid characters in location',
    });
    expect(validateLocation('Paris$')).toEqual({
      valid: false,
      reason: 'Invalid characters in location',
    });
    expect(validateLocation('City123')).toEqual({
      valid: false,
      reason: 'Invalid characters in location',
    });
  });
});
