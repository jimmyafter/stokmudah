export type Language = 'en' | 'ms';

export type Category = 'fresh' | 'pantry' | 'household' | 'toiletries';
export type Location = 'kitchen' | 'bathroom' | 'storeroom';

/** One purchase of an item. Each batch has its own expiry date. */
export interface Batch {
  id: string;
  /** Number of packs in this batch. */
  quantity: number;
  /** ISO date (YYYY-MM-DD). Undefined for items that do not expire. */
  expiry?: string;
  price?: number;
  store?: string;
}

export interface Item {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  category: Category;
  location: Location;
  /** Total sealed and open packs on hand. */
  quantity: number;
  /** How full the open pack is: 0.1, 0.25, 0.5, 0.75 or 1. */
  level: number;
  /** Alert when the units left drop to this value. */
  minStock: number;
  /** Packs usually bought in one shop. */
  usualQty: number;
  /** Days before expiry to start warning. */
  warnDays: number;
  batches: Batch[];
  /** Last price paid per pack, in RM. */
  price?: number;
  store?: string;
}

export interface Recipient {
  id: string;
  name: string;
  /** WhatsApp number as typed by the user. */
  phone: string;
}

export interface Reminders {
  expiry: boolean;
  low: boolean;
  weekly: boolean;
}

export interface Settings {
  language: Language;
  /** Day of the month salary arrives (1 to 31). */
  paydayDay: number;
  recipients: Recipient[];
  reminders: Reminders;
}

export interface ExtraLine {
  id: string;
  name: string;
  qty: number;
}

export type Status = 'expired' | 'expiring' | 'low' | 'fine';
