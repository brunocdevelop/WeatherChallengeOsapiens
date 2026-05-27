export type ValidationResult =
  | {valid: true; value: string}
  | {valid: false; reason: string};

export function validateLocation(input: string): ValidationResult {
  const trimmed = input.trim().replace(/\s+/g, ' ');

  if (trimmed.length === 0)
    return {valid: false, reason: 'Location cannot be empty'};
  if (trimmed.length < 2)
    return {valid: false, reason: 'Location is too short'};
  if (trimmed.length > 50)
    return {valid: false, reason: 'Location is too long'};
  if (!/^[\p{L}\s,.\-']+$/u.test(trimmed))
    return {valid: false, reason: 'Invalid characters in location'};

  return {valid: true, value: trimmed};
}
