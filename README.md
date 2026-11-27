# StokMudah

Home stock tracking for Malaysian households: what you have, how much is left, what expires soon, and what to buy next payday. English and Bahasa Melayu.

Built with Expo (SDK 58) and Expo Router.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` for an emulator. Check types with `npm run typecheck`.

## What works today

- **Home:** stock health ring, "use first" list, quick actions.
- **Stock:** search, filter by place, item detail with batches and expiry dates.
- **Add item (centre camera button):** scans a barcode, looks it up on Open Food Facts, then you confirm packs, how full it is, category, place, expiry and price. If the barcode is unknown you type the name once. Adding the same item again creates a new batch.
- **Count stock:** blind count, level slider, or exact number, one item at a time, with a summary of items used faster than expected.
- **Shopping list:** built from items that are low or about to expire, plus anything you add. Send it on WhatsApp to up to 3 saved contacts, or to a group through the WhatsApp picker.
- **Settings:** language, payday, WhatsApp contacts, reminder switches.
- **Insights:** spending charts using **sample figures** (real spending needs receipt scanning).

Data is stored on the device with AsyncStorage. A fresh install starts with **demo items**; clear them in Settings.

## Not built yet

- Push notifications (the reminder switches are saved but nothing is sent yet).
- Free and Premium limits, the paywall, and sign-in.
- Sync across devices.

## AI photo scan

The camera has four modes: **Barcode**, **Item** (photo of the product), **Expiry** (photo of the date) and **Receipt** (receipt or shopping haul). Photos are shrunk on the phone, sent to the `scan` Supabase Edge Function, which calls an Anthropic vision model and returns JSON. Receipt results open a review list; nothing changes stock until you confirm, and low-confidence lines start unticked.

Limits are enforced on the server: 10 scans a month on the free plan, 150 on premium (`profiles.plan`). A failed AI call refunds the scan.

One-time setup in the Supabase project `fywgvppbvisvchwbyffz`:

1. Authentication, Sign In / Providers: switch on **Anonymous sign-ins**.
2. Edge Functions, Secrets: add `ANTHROPIC_API_KEY`. Optionally add `ANTHROPIC_MODEL` to change the model (default `claude-sonnet-5-5`).

The app reads the project URL and publishable key from `.env` (public values only). The Anthropic key never goes in the app.

Applied schema: `supabase/migrations/0002_ai_scan.sql` (usage counter and profiles). `0001_init.sql` is the planned sync schema and is not applied.

## Project layout

```
src/app          routes only (tabs, camera, count, settings, item/[id])
src/components   shared UI
src/lib          pure logic: stock status, shopping list, WhatsApp links, dates
src/store        app state and storage
src/i18n         English and Bahasa Melayu strings
src/data         demo data
supabase         migrations (the scan edge function is deployed in Supabase)
```

## Before a store release

- Replace the default Expo app icon and splash image in `assets/`.
- Set `ios.bundleIdentifier` and `android.package` in `app.json`.
- Choose a licence for the repository.
