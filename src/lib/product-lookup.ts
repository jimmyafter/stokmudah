export interface ProductInfo {
  name: string;
}

/**
 * Look a barcode up on Open Food Facts. Returns null when the product is unknown,
 * the network fails, or it takes longer than a few seconds. Local products are often missing.
 */
export async function lookupBarcode(code: string, timeoutMs = 6000): Promise<ProductInfo | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,brands,quantity`,
      { signal: controller.signal },
    );
    if (!response.ok) return null;
    const json = (await response.json()) as {
      status?: number;
      product?: { product_name?: string; brands?: string; quantity?: string };
    };
    if (json.status !== 1 || !json.product?.product_name) return null;
    const brand = json.product.brands?.split(',')[0]?.trim();
    const parts = [brand, json.product.product_name.trim(), json.product.quantity?.trim()].filter(Boolean);
    return { name: parts.join(' ') };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
