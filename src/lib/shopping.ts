import type { ExtraLine, Item, Language, Location } from '@/types';
import { statusOf } from '@/lib/stock';

export interface ListLine {
  id: string;
  name: string;
  qty: number;
  location: Location | 'other';
  reason: 'low' | 'expiring' | 'extra';
  /** Estimated cost in RM, when a last price is known. */
  estimate?: number;
}

/**
 * Salary-week suggestions (v1 rules): anything that is low, or about to expire
 * and will need replacing. Quantity is what you usually buy.
 */
export function suggestedLines(items: Item[], today: Date = new Date()): ListLine[] {
  const lines: ListLine[] = [];
  for (const item of items) {
    const status = statusOf(item, today);
    if (status === 'fine') continue;
    lines.push({
      id: item.id,
      name: item.name,
      qty: item.usualQty,
      location: item.location,
      reason: status === 'low' ? 'low' : 'expiring',
      estimate: item.price !== undefined ? item.price * item.usualQty : undefined,
    });
  }
  return lines;
}

export function extraToLine(extra: ExtraLine): ListLine {
  return { id: extra.id, name: extra.name, qty: extra.qty, location: 'other', reason: 'extra' };
}

export function estimateTotal(lines: ListLine[]): number {
  return lines.reduce((sum, line) => sum + (line.estimate ?? 0), 0);
}

const SECTION_LABELS: Record<Language, Record<Location | 'other', string>> = {
  en: { kitchen: 'Kitchen', bathroom: 'Bathroom', storeroom: 'Store room', other: 'Other' },
  ms: { kitchen: 'Dapur', bathroom: 'Bilik air', storeroom: 'Stor', other: 'Lain-lain' },
};

const ORDER: (Location | 'other')[] = ['kitchen', 'bathroom', 'storeroom', 'other'];

export function groupByLocation(lines: ListLine[]): { location: Location | 'other'; lines: ListLine[] }[] {
  return ORDER.map((location) => ({
    location,
    lines: lines.filter((line) => line.location === location),
  })).filter((group) => group.lines.length > 0);
}

/** Plain-text checklist for WhatsApp, in the user's language. */
export function buildWhatsAppMessage(lines: ListLine[], language: Language, dateLabel: string): string {
  const title = language === 'ms' ? 'Senarai beli-belah' : 'Shopping list';
  const estimateLabel = language === 'ms' ? 'Anggaran' : 'Estimate';
  const out: string[] = [`${title} (${dateLabel})`];
  for (const group of groupByLocation(lines)) {
    out.push('', SECTION_LABELS[language][group.location]);
    for (const line of group.lines) out.push(`- ${line.name} x${line.qty}`);
  }
  const total = estimateTotal(lines);
  if (total > 0) out.push('', `${estimateLabel}: RM ${Math.round(total)}`);
  return out.join('\n');
}

export function sectionLabel(location: Location | 'other', language: Language): string {
  return SECTION_LABELS[language][location];
}
