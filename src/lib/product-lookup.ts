export type LookupResult =
  | { status: 'found'; name: string }
  | { status: 'notfound' }
  | { status: 'error' };

/** Open Food Facts and its sister databases share one API. Toiletries and household goods are in the other two. */
const SOURCES = [
  'world.openfoodfacts.org',
  'world.openbeautyfacts.org',
  'world.openproductsfacts.org',
];

/** 12-digit UPC-A codes are stored as 13-digit EAN codes with a leading zero. */
function normalizeBarcode(code: string): string {
  const digits = code.replace(/\D/g, '');
  return digits.length === 12 ? `0${digits}` : digits;
}

interface ProductResponse {
  status?: number;
  product?: { product_name?: string; brands?: string; quantity?: string };
}

async function lookupIn(host: string, code: string, timeoutMs: number): Promise<ProductResponse | 'error'> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(
      `https://${host}/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,brands,quantity`,
      { signal: controller.signal, headers: { 'User-Agent': 'StokMudah/1.0 (home stock app)' } },
    );
    // A 404 is how these databases say "no such product", not a failure.
    if (response.status === 404) return {};
    if (!response.ok) return 'error';
    return (await response.json()) as ProductResponse;
  } catch {
    return 'error';
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Look a barcode up. Distinguishes "not in the database" from "could not reach it",
 * because local Malaysian products are often missing and the user should know which happened.
 */
export async function lookupBarcode(rawCode: string, timeoutMs = 6000): Promise<LookupResult> {
  const code = normalizeBarcode(rawCode);
  let reached = 0;
  for (const host of SOURCES) {
    const result = await lookupIn(host, code, timeoutMs);
    if (result === 'error') continue;
    reached += 1;
    const product = result.product;
    if (result.status === 1 && product?.product_name) {
      const brand = product.brands?.split(',')[0]?.trim();
      const parts = [brand, product.product_name.trim(), product.quantity?.trim()].filter(Boolean);
      return { status: 'found', name: parts.join(' ') };
    }
  }
  return reached === 0 ? { status: 'error' } : { status: 'notfound' };
}
