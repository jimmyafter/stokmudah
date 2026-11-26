/**
 * Turn a number the user typed into digits for a wa.me link.
 * A leading 0 is treated as a Malaysian number (+60).
 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('0')) return `60${digits.slice(1)}`;
  return digits;
}

export function isPlausiblePhone(input: string): boolean {
  const digits = normalizePhone(input);
  return digits.length >= 9 && digits.length <= 15;
}

/** Opens WhatsApp with the text pre-filled for one recipient. */
export function whatsappUrl(phone: string, text: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(text)}`;
}

/** Opens the WhatsApp contact picker (no recipient), used for groups. */
export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
