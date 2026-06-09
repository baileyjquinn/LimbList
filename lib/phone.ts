/**
 * Formats a US phone number as the user types: 6628822299 -> (662) 882-2299.
 * Strips a leading country-code "1" and ignores extra digits. Reformatting from
 * the raw digits each keystroke keeps backspace behaviour predictable.
 */
export function formatPhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);

  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
