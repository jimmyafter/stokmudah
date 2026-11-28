/** Format a Date as YYYY-MM-DD in local time. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse YYYY-MM-DD as a local-midnight Date. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

/** Whole days from `from` to the ISO date (negative when it is in the past). */
export function daysUntil(iso: string, from: Date = new Date()): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const end = parseISODate(iso).getTime();
  return Math.round((end - start) / 86_400_000);
}

/** Keep only digits and add slashes as the person types: 28112026 becomes 28/11/2026. */
export function maskDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Parse DD/MM/YYYY (the order used in Malaysia) into an ISO date, or null when it is not a real date. */
export function parseUserDate(text: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (year < 2000 || year > 2100) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return toISODate(date);
}

/** ISO date to DD/MM/YYYY for the text box. */
export function formatUserDate(iso: string | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
