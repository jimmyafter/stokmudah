import { ensureSession, supabase } from '@/lib/supabase';

/** This month's AI scan count for this install, or null when it cannot be read (offline, no key yet). */
export async function getScanUsage(): Promise<{ used: number } | null> {
  try {
    if (!(await ensureSession())) return null;
    const month = new Date().toISOString().slice(0, 7);
    const { data, error } = await supabase.from('ai_usage').select('scans').eq('month', month).maybeSingle();
    if (error) return null;
    return { used: data?.scans ?? 0 };
  } catch {
    return null;
  }
}
