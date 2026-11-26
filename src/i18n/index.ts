import { en, type TKey } from '@/i18n/en';
import { ms } from '@/i18n/ms';
import type { Language } from '@/types';

export type { TKey };

const dictionaries: Record<Language, Record<TKey, string>> = { en, ms };

export type TFunction = (key: TKey, params?: Record<string, string | number>) => string;

export function makeT(language: Language): TFunction {
  const dictionary = dictionaries[language];
  return (key, params) => {
    let text: string = dictionary[key] ?? en[key];
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replace(`{${name}}`, String(value));
      }
    }
    return text;
  };
}

/** "Today", "Tomorrow", "5 days" or "Expired", in the current language. */
export function formatDays(t: TFunction, days: number): string {
  if (days < 0) return t('time.expired');
  if (days === 0) return t('time.today');
  if (days === 1) return t('time.tomorrow');
  return t('time.days', { n: days });
}

export function levelLabel(t: TFunction, level: number): string {
  if (level >= 0.9) return t('level.full');
  if (level >= 0.7) return t('level.threeQuarters');
  if (level >= 0.45) return t('level.half');
  if (level >= 0.2) return t('level.quarter');
  return t('level.almost');
}
