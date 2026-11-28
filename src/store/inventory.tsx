import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { defaultSettings, FREE_ITEM_LIMIT, MAX_RECIPIENTS, sampleItems } from '@/data/sample';
import { makeT, type TFunction } from '@/i18n';
import { syncNotifications } from '@/lib/notifications';
import type { Category, ExtraLine, Item, Language, Location, Reminders, Settings } from '@/types';

const STORAGE_KEY = 'stokmudah:v1';

interface Persisted {
  items: Item[];
  settings: Settings;
  extras: ExtraLine[];
  excluded: Record<string, boolean>;
  /** False until the first-run screens are finished. */
  onboarded: boolean;
  plan: 'free' | 'premium';
}

/** What the add-item form produces. Merged into an existing item when it matches. */
export interface NewPurchase {
  name: string;
  barcode?: string;
  category: Category;
  location: Location;
  packs: number;
  level: number;
  expiry?: string;
  price?: number;
  photo?: string;
}

interface InventoryValue {
  ready: boolean;
  items: Item[];
  settings: Settings;
  extras: ExtraLine[];
  excluded: Record<string, boolean>;
  language: Language;
  t: TFunction;
  addPurchase: (purchase: NewPurchase) => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  /** Take one pack out of stock (used up or thrown away), earliest expiry first. */
  removePack: (id: string) => void;
  setLanguage: (language: Language) => void;
  setPayday: (day: number) => void;
  setReminder: (key: keyof Reminders, value: boolean) => void;
  addRecipient: (name: string, phone: string) => boolean;
  removeRecipient: (id: string) => void;
  addExtra: (name: string, qty?: number) => void;
  removeExtra: (id: string) => void;
  toggleExcluded: (id: string) => void;
  resetDemo: () => void;
  onboarded: boolean;
  plan: 'free' | 'premium';
  /** How many more new items the free plan allows (Infinity on Premium). */
  freeSlotsLeft: number;
  /** True when saving this purchase would create a new item beyond the free limit. */
  wouldExceedLimit: (purchase: { name: string; barcode?: string }) => boolean;
  setPlan: (plan: 'free' | 'premium') => void;
  completeOnboarding: (options: { language: Language; paydayDay: number; withDemo: boolean }) => void;
  clearAll: () => void;
}

const InventoryContext = createContext<InventoryValue | null>(null);

function makeId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function seed(): Persisted {
  return { items: sampleItems(), settings: defaultSettings, extras: [], excluded: {}, onboarded: false, plan: 'free' };
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<Persisted>(seed);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const saved = JSON.parse(raw) as Persisted;
          setState({
            items: saved.items ?? [],
            settings: { ...defaultSettings, ...saved.settings },
            extras: saved.extras ?? [],
            excluded: saved.excluded ?? {},
            // People who already used the app before onboarding existed skip it.
            onboarded: saved.onboarded ?? true,
            plan: saved.plan ?? 'free',
          });
        }
      } catch {
        // Storage can fail or hold bad data. Fall back to the demo data.
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [ready, state]);

  // Keep scheduled reminders in step with the stock and the switches.
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      syncNotifications(state.items, state.settings.reminders, makeT(state.settings.language));
    }, 800);
    return () => clearTimeout(timer);
  }, [ready, state.items, state.settings.reminders, state.settings.language]);

  const patch = useCallback((fn: (current: Persisted) => Persisted) => setState(fn), []);

  const addPurchase = useCallback(
    (purchase: NewPurchase): void => {
      const newId = makeId();
      patch((current) => {
        const wanted = purchase.name.trim().toLowerCase();
        const match = current.items.find(
          (item) =>
            (purchase.barcode && item.barcode === purchase.barcode) ||
            item.name.trim().toLowerCase() === wanted,
        );
        const batch = {
          id: makeId(),
          quantity: purchase.packs,
          expiry: purchase.expiry,
          price: purchase.price,
        };
        if (match) {
          return {
            ...current,
            items: current.items.map((item) =>
              item.id === match.id
                ? {
                    ...item,
                    quantity: item.quantity + purchase.packs,
                    level: item.quantity > 0 ? item.level : purchase.level,
                    price: purchase.price ?? item.price,
                    photo: item.photo ?? purchase.photo,
                    batches: [...item.batches, batch],
                  }
                : item,
            ),
          };
        }
        const created: Item = {
          id: newId,
          name: purchase.name.trim(),
          barcode: purchase.barcode,
          category: purchase.category,
          location: purchase.location,
          quantity: purchase.packs,
          level: purchase.level,
          minStock: 0.3,
          usualQty: Math.max(1, purchase.packs),
          warnDays: purchase.category === 'fresh' ? 3 : 30,
          price: purchase.price,
          photo: purchase.photo,
          batches: [batch],
        };
        return { ...current, items: [created, ...current.items] };
      });
    },
    [patch],
  );

  const updateItem = useCallback(
    (id: string, changes: Partial<Item>) =>
      patch((current) => ({
        ...current,
        items: current.items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
      })),
    [patch],
  );

  const deleteItem = useCallback(
    (id: string) =>
      patch((current) => ({ ...current, items: current.items.filter((item) => item.id !== id) })),
    [patch],
  );

  const removePack = useCallback(
    (id: string) =>
      patch((current) => ({
        ...current,
        items: current.items.map((item) => {
          if (item.id !== id || item.quantity <= 0) return item;
          const order = [...item.batches]
            .filter((b) => b.quantity > 0)
            .sort((a, b) => (a.expiry ?? '9999-12-31').localeCompare(b.expiry ?? '9999-12-31'));
          const target = order[0];
          const batches = item.batches
            .map((b) => (target && b.id === target.id ? { ...b, quantity: b.quantity - 1 } : b))
            .filter((b) => b.quantity > 0);
          const quantity = item.quantity - 1;
          return { ...item, quantity, level: quantity > 0 ? 1 : item.level, batches };
        }),
      })),
    [patch],
  );

  const setLanguage = useCallback(
    (language: Language) => patch((c) => ({ ...c, settings: { ...c.settings, language } })),
    [patch],
  );

  const setPayday = useCallback(
    (day: number) =>
      patch((c) => ({ ...c, settings: { ...c.settings, paydayDay: Math.min(31, Math.max(1, day)) } })),
    [patch],
  );

  const setReminder = useCallback(
    (key: keyof Reminders, value: boolean) =>
      patch((c) => ({
        ...c,
        settings: { ...c.settings, reminders: { ...c.settings.reminders, [key]: value } },
      })),
    [patch],
  );

  const addRecipient = useCallback(
    (name: string, phone: string): boolean => {
      if (state.settings.recipients.length >= MAX_RECIPIENTS) return false;
      patch((c) => {
        if (c.settings.recipients.length >= MAX_RECIPIENTS) return c;
        return {
          ...c,
          settings: {
            ...c.settings,
            recipients: [...c.settings.recipients, { id: makeId(), name: name.trim(), phone: phone.trim() }],
          },
        };
      });
      return true;
    },
    [patch, state.settings.recipients.length],
  );

  const removeRecipient = useCallback(
    (id: string) =>
      patch((c) => ({
        ...c,
        settings: { ...c.settings, recipients: c.settings.recipients.filter((r) => r.id !== id) },
      })),
    [patch],
  );

  const addExtra = useCallback(
    (name: string, qty = 1) =>
      patch((c) => ({ ...c, extras: [...c.extras, { id: makeId(), name: name.trim(), qty }] })),
    [patch],
  );

  const removeExtra = useCallback(
    (id: string) => patch((c) => ({ ...c, extras: c.extras.filter((e) => e.id !== id) })),
    [patch],
  );

  const toggleExcluded = useCallback(
    (id: string) =>
      patch((c) => ({ ...c, excluded: { ...c.excluded, [id]: !c.excluded[id] } })),
    [patch],
  );

  const resetDemo = useCallback(
    () => patch((c) => ({ ...c, items: sampleItems(), extras: [], excluded: {} })),
    [patch],
  );

  const clearAll = useCallback(
    () => patch((c) => ({ ...c, items: [], extras: [], excluded: {} })),
    [patch],
  );

  const setPlan = useCallback((plan: 'free' | 'premium') => patch((c) => ({ ...c, plan })), [patch]);

  const completeOnboarding = useCallback(
    (options: { language: Language; paydayDay: number; withDemo: boolean }) =>
      patch((c) => ({
        ...c,
        onboarded: true,
        items: options.withDemo ? sampleItems() : [],
        extras: [],
        excluded: {},
        settings: {
          ...c.settings,
          language: options.language,
          paydayDay: options.paydayDay,
          recipients: options.withDemo ? c.settings.recipients : [],
        },
      })),
    [patch],
  );

  const freeSlotsLeft = state.plan === 'premium' ? Infinity : Math.max(0, FREE_ITEM_LIMIT - state.items.length);
  const wouldExceedLimit = useCallback(
    (purchase: { name: string; barcode?: string }) => {
      if (state.plan === 'premium' || state.items.length < FREE_ITEM_LIMIT) return false;
      const wanted = purchase.name.trim().toLowerCase();
      const known = state.items.some(
        (item) => (purchase.barcode && item.barcode === purchase.barcode) || item.name.trim().toLowerCase() === wanted,
      );
      return !known;
    },
    [state.plan, state.items],
  );

  const language = state.settings.language;
  const t = useMemo(() => makeT(language), [language]);

  const value = useMemo<InventoryValue>(
    () => ({
      ready,
      items: state.items,
      settings: state.settings,
      extras: state.extras,
      excluded: state.excluded,
      language,
      t,
      addPurchase,
      updateItem,
      deleteItem,
      removePack,
      setLanguage,
      setPayday,
      setReminder,
      addRecipient,
      removeRecipient,
      addExtra,
      removeExtra,
      toggleExcluded,
      resetDemo,
      clearAll,
      onboarded: state.onboarded,
      plan: state.plan,
      freeSlotsLeft,
      wouldExceedLimit,
      setPlan,
      completeOnboarding,
    }),
    [
      ready, state, language, t, addPurchase, updateItem, deleteItem, removePack, setLanguage,
      setPayday, setReminder, addRecipient, removeRecipient, addExtra, removeExtra,
      toggleExcluded, resetDemo, clearAll, freeSlotsLeft, wouldExceedLimit, setPlan, completeOnboarding,
    ],
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory(): InventoryValue {
  const value = useContext(InventoryContext);
  if (!value) throw new Error('useInventory must be used inside InventoryProvider');
  return value;
}
