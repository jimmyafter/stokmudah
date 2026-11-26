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

- AI photo recognition, expiry-date photos and receipt matching (needs the backend, below).
- Push notifications (the reminder switches are saved but nothing is sent yet).
- Free and Premium limits, the paywall, and sign-in.
- Sync across devices.

## Backend plan

`supabase/migrations/0001_init.sql` holds the planned database schema with row-level security. It has not been applied to any Supabase project. AI calls will go through a server function so no API key ships in the app.

## Project layout

```
src/app          routes only (tabs, camera, count, settings, item/[id])
src/components   shared UI
src/lib          pure logic: stock status, shopping list, WhatsApp links, dates
src/store        app state and storage
src/i18n         English and Bahasa Melayu strings
src/data         demo data
supabase         planned database schema
```

## Before a store release

- Replace the default Expo app icon and splash image in `assets/`.
- Set `ios.bundleIdentifier` and `android.package` in `app.json`.
- Choose a licence for the repository.
