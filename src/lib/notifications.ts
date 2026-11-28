import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { TFunction } from '@/i18n';
import { addDays } from '@/lib/dates';
import { daysToExpiry, statusOf } from '@/lib/stock';
import type { Item, Reminders } from '@/types';

const CHANNEL = 'reminders';
const DAYS_AHEAD = 14;
const MAX_NAMES = 3;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

function list(names: string[]): string {
  const shown = names.slice(0, MAX_NAMES).join(', ');
  return names.length > MAX_NAMES ? `${shown} +${names.length - MAX_NAMES}` : shown;
}

function at(day: Date, hour: number): Date {
  const d = new Date(day);
  d.setHours(hour, 0, 0, 0);
  return d;
}

/**
 * Rebuild every scheduled reminder from the current stock. Called whenever stock or the
 * reminder switches change, so the messages always match what is on the shelf.
 * - Near expiry: one message on each of the next 14 mornings that has something to use first.
 * - Running low: one evening message, repeating daily, listing what is low right now.
 * - Weekly count: Sunday morning.
 */
export async function syncNotifications(items: Item[], reminders: Reminders, t: TFunction): Promise<void> {
  try {
    const anyOn = reminders.expiry || reminders.low || reminders.weekly;
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!anyOn) return;
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;

    const channelId = Platform.OS === 'android' ? CHANNEL : undefined;
    const now = new Date();

    if (reminders.expiry) {
      for (let i = 0; i < DAYS_AHEAD; i += 1) {
        const day = addDays(now, i);
        const when = at(day, 9);
        if (when.getTime() <= now.getTime()) continue;
        const due = items.filter((item) => {
          const days = daysToExpiry(item, day);
          return days !== null && days >= 0 && days <= Math.min(item.warnDays, 3);
        });
        if (!due.length) continue;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: t('notify.expiryTitle'),
            body: t('notify.expiryBody', { names: list(due.map((d) => d.name)) }),
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId },
        });
      }
    }

    if (reminders.low) {
      const low = items.filter((item) => statusOf(item, now) === 'low');
      if (low.length) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: t('notify.lowTitle'),
            body: t('notify.lowBody', { names: list(low.map((l) => l.name)) }),
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 18, minute: 0, channelId },
        });
      }
    }

    if (reminders.weekly) {
      await Notifications.scheduleNotificationAsync({
        content: { title: t('notify.weeklyTitle'), body: t('notify.weeklyBody') },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: 1, // Sunday
          hour: 10,
          minute: 0,
          channelId,
        },
      });
    }
  } catch {
    // Reminders are a convenience. Never let them break the app.
  }
}
