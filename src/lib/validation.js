/**
 * Validates a phone number in international format.
 * Must start with "+" followed by 10-13 digits.
 */
export function isValidPhone(number) {
  return /^\+\d{10,13}$/.test(number?.trim());
}

/**
 * Formats a phone number for display (adds space after country code).
 */
export function formatPhone(number) {
  if (!number) return "";
  const clean = number.trim();
  if (clean.startsWith("+91") && clean.length === 13) {
    return `+91 ${clean.slice(3, 8)} ${clean.slice(8)}`;
  }
  return clean;
}
