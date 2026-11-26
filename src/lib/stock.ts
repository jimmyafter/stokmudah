import type { Item, Status } from '@/types';
import { daysUntil } from '@/lib/dates';

/** The five levels the slider snaps to. */
export const LEVELS = [0.1, 0.25, 0.5, 0.75, 1] as const;

export function levelIndex(level: number): number {
  let best = 0;
  LEVELS.forEach((value, i) => {
    if (Math.abs(value - level) < Math.abs(LEVELS[best] - level)) best = i;
  });
  return best;
}

/** Sealed packs plus the fraction left in the open one. */
export function unitsLeft(item: Item): number {
  if (item.quantity <= 0) return 0;
  return Math.max(0, item.quantity - 1) + item.level;
}

/** Days until the earliest batch that still has stock expires, or null if nothing expires. */
export function daysToExpiry(item: Item, today: Date = new Date()): number | null {
  let soonest: number | null = null;
  for (const batch of item.batches) {
    if (batch.quantity <= 0 || !batch.expiry) continue;
    const days = daysUntil(batch.expiry, today);
    if (soonest === null || days < soonest) soonest = days;
  }
  return soonest;
}

export function statusOf(item: Item, today: Date = new Date()): Status {
  const days = daysToExpiry(item, today);
  if (days !== null && days < 0) return 'expired';
  if (days !== null && days <= item.warnDays) return 'expiring';
  if (unitsLeft(item) <= item.minStock) return 'low';
  return 'fine';
}

export interface HealthCounts {
  fine: number;
  low: number;
  expiring: number;
  total: number;
}

/** Expired items count as expiring for the dashboard ring. */
export function healthCounts(items: Item[], today: Date = new Date()): HealthCounts {
  const counts: HealthCounts = { fine: 0, low: 0, expiring: 0, total: items.length };
  for (const item of items) {
    const status = statusOf(item, today);
    if (status === 'fine') counts.fine += 1;
    else if (status === 'low') counts.low += 1;
    else counts.expiring += 1;
  }
  return counts;
}

/** Items that expire soonest, for the "Use first" list. */
export function useFirst(items: Item[], limit: number, today: Date = new Date()): Item[] {
  return items
    .map((item) => ({ item, days: daysToExpiry(item, today) }))
    .filter((entry): entry is { item: Item; days: number } => entry.days !== null && entry.days <= 14)
    .sort((a, b) => a.days - b.days)
    .slice(0, limit)
    .map((entry) => entry.item);
}

/** A rough estimate of days of stock left, from the number of units and a daily rate. */
export function daysOfStock(item: Item, unitsPerDay: number): number | null {
  if (unitsPerDay <= 0) return null;
  return Math.round(unitsLeft(item) / unitsPerDay);
}

/** Inverse of `unitsLeft`: turn a number of packs (like 1.5) into whole packs plus an open-pack level. */
export function fromUnits(units: number): { quantity: number; level: number } {
  const safe = Math.max(0, units);
  const whole = Math.floor(safe);
  const fraction = safe - whole;
  if (fraction < 0.05) return { quantity: whole, level: 1 };
  return { quantity: whole + 1, level: LEVELS[levelIndex(fraction)] };
}
