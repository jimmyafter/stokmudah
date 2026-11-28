import * as ImageManipulator from 'expo-image-manipulator';

import type { Category } from '@/types';
import { ensureSession, supabase } from '@/lib/supabase';

export type ScanMode = 'item' | 'expiry' | 'receipt';

export interface ReceiptLine {
  name: string;
  quantity: number;
  price?: number;
  confidence: number;
}

export type ScanOutcome<T> =
  | { ok: true; data: T; used: number; limit: number; photo?: string }
  | { ok: false; reason: 'quota' | 'network' | 'failed' | 'notconfigured' | 'auth' };

interface Raw {
  mode: ScanMode;
  result: Record<string, unknown>;
  used: number;
  limit: number;
}

/** Shrink the photo before upload: faster, cheaper, and the model does not need more. */
async function prepare(uri: string, mode: ScanMode): Promise<string | null> {
  const width = mode === 'receipt' ? 1600 : 1024;
  const out = await ImageManipulator.manipulateAsync(uri, [{ resize: { width } }], {
    compress: 0.7,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });
  return out.base64 ?? null;
}

/** A tiny copy kept with the item so the list can show what it looks like. */
async function thumbnail(uri: string): Promise<string | undefined> {
  try {
    const out = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 192 } }], {
      compress: 0.55,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    return out.base64 ? `data:image/jpeg;base64,${out.base64}` : undefined;
  } catch {
    return undefined;
  }
}

async function run(uri: string, mode: ScanMode): Promise<ScanOutcome<Record<string, unknown>>> {
  try {
    if (!(await ensureSession())) return { ok: false, reason: 'auth' };
    const image = await prepare(uri, mode);
    if (!image) return { ok: false, reason: 'failed' };
    const photo = mode === 'item' ? await thumbnail(uri) : undefined;
    const { data, error } = await supabase.functions.invoke<Raw>('scan', { body: { mode, image } });
    if (error) {
      const status = (error as { context?: { status?: number } }).context?.status;
      if (status === 429) return { ok: false, reason: 'quota' };
      if (status === 503) return { ok: false, reason: 'notconfigured' };
      if (status === 401) return { ok: false, reason: 'auth' };
      return { ok: false, reason: error.name === 'FunctionsFetchError' ? 'network' : 'failed' };
    }
    if (!data?.result) return { ok: false, reason: 'failed' };
    return { ok: true, data: data.result, used: data.used, limit: data.limit, photo };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

const CATEGORIES: Category[] = ['fresh', 'pantry', 'household', 'toiletries'];

export async function scanItem(
  uri: string,
): Promise<ScanOutcome<{ name: string; category: Category; expiry?: string; confidence: number }>> {
  const r = await run(uri, 'item');
  if (!r.ok) return r;
  const name = typeof r.data.name === 'string' ? r.data.name.trim() : '';
  const cat = CATEGORIES.includes(r.data.category as Category) ? (r.data.category as Category) : 'pantry';
  const expiry = typeof r.data.expiry === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.data.expiry) ? r.data.expiry : undefined;
  return { ...r, data: { name, category: cat, expiry, confidence: Number(r.data.confidence) || 0 } };
}

export async function scanExpiry(uri: string): Promise<ScanOutcome<{ date?: string; confidence: number }>> {
  const r = await run(uri, 'expiry');
  if (!r.ok) return r;
  const raw = r.data.date;
  const date = typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : undefined;
  return { ...r, data: { date, confidence: Number(r.data.confidence) || 0 } };
}

export async function scanReceipt(uri: string): Promise<ScanOutcome<ReceiptLine[]>> {
  const r = await run(uri, 'receipt');
  if (!r.ok) return r;
  const list = Array.isArray(r.data.items) ? (r.data.items as Record<string, unknown>[]) : [];
  const lines: ReceiptLine[] = list
    .filter((l) => typeof l.name === 'string' && (l.name as string).trim())
    .map((l) => ({
      name: (l.name as string).trim(),
      quantity: Math.max(1, Math.round(Number(l.quantity) || 1)),
      price: typeof l.price === 'number' && l.price > 0 ? l.price : undefined,
      confidence: Number(l.confidence) || 0,
    }));
  return { ...r, data: lines };
}

/** Rough name match between a receipt line and a saved item: shared words, ignoring sizes. */
export function matchScore(a: string, b: string): number {
  const words = (s: string) =>
    new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !/^\d/.test(w)));
  const A = words(a);
  const B = words(b);
  if (!A.size || !B.size) return 0;
  let shared = 0;
  A.forEach((w) => { if (B.has(w)) shared += 1; });
  return shared / Math.min(A.size, B.size);
}
