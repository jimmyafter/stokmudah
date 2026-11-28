import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const FREE_LIMIT = 10;
const PREMIUM_LIMIT = 150;
const MAX_IMAGE_CHARS = 2_500_000; // ~1.8MB of base64
const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-5-5";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

const EXPIRY_RULES = `Malaysian packs print dates as DD/MM/YYYY, DD MMM YYYY, "EXP", "BB", "Best before", "Guna sebelum", "Tarikh luput". Ignore manufacture or pack dates (MFG, PKD). If the year has two digits assume 20xx. If only month and year are given, use the last day of that month.`;

const PROMPTS: Record<string, string> = {
  item: `You identify one household product from a photo, for a Malaysian home stock app. The same photo may also show a printed expiry date.
Return ONLY JSON: {"name": string, "category": "fresh"|"pantry"|"household"|"toiletries", "expiry": "YYYY-MM-DD" or null, "confidence": number 0-1}.
"name" = brand + product + size as printed on the pack (e.g. "Dutch Lady Fresh Milk 1L"). "expiry" is the expiry date only if it is clearly visible, otherwise null. ${EXPIRY_RULES}
If you cannot identify a product, return {"name": "", "category": "pantry", "expiry": null, "confidence": 0}. Never guess a brand that is not visible.`,
  expiry: `You read the expiry date printed on a product in a photo. ${EXPIRY_RULES}
Return ONLY JSON: {"date": "YYYY-MM-DD" or null, "confidence": number 0-1}. If unreadable, date is null.`,
  receipt: `You read a Malaysian grocery receipt (often Jaya Grocer) or a photo of a shopping haul. Extract purchased items.
Return ONLY JSON: {"items": [{"name": string, "quantity": number, "price": number or null, "confidence": number 0-1}]}.
Expand abbreviations into readable product names where obvious. "price" is the per-unit price in RM. Skip bags, discounts, totals, tax and payment lines. Return at most 40 items.`,
};

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("no json");
  return JSON.parse(text.slice(start, end + 1));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return json({ error: "not_configured" }, 503);

  const url = Deno.env.get("SUPABASE_URL")!;
  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return json({ error: "unauthorized" }, 401);
  const userId = userData.user.id;

  let body: { mode?: string; image?: string };
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  const mode = body.mode ?? "";
  const image = body.image ?? "";
  if (!PROMPTS[mode] || !image || image.length > MAX_IMAGE_CHARS) return json({ error: "bad_request" }, 400);

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: profile } = await admin.from("profiles").select("plan").eq("user_id", userId).maybeSingle();
  const limit = profile?.plan === "premium" ? PREMIUM_LIMIT : FREE_LIMIT;
  const month = new Date().toISOString().slice(0, 7);

  const { data: used, error: rpcErr } = await admin.rpc("consume_scan", { p_user: userId, p_month: month, p_limit: limit });
  if (rpcErr) return json({ error: "server" }, 500);
  if (used === -1) return json({ error: "quota", limit }, 429);

  const refund = () => admin.rpc("refund_scan", { p_user: userId, p_month: month });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: mode === "receipt" ? 2500 : 300,
        system: PROMPTS[mode],
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
            { type: "text", text: "Respond with the JSON only." },
          ],
        }],
      }),
    });
    if (!res.ok) { await refund(); return json({ error: "ai_failed" }, 502); }
    const out = await res.json();
    const text = (out.content ?? []).map((c: { text?: string }) => c.text ?? "").join("");
    const result = extractJson(text);
    return json({ mode, result, used, limit });
  } catch {
    await refund();
    return json({ error: "ai_failed" }, 502);
  }
});
