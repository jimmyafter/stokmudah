import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { LevelBar } from '@/components/level-bar';
import { Pill, toneForStatus } from '@/components/pill';
import { Text } from '@/components/text';
import { formatDays } from '@/i18n';
import { daysToExpiry, statusOf, unitsLeft } from '@/lib/stock';
import { useTheme } from '@/hooks/use-theme';
import { useInventory } from '@/store/inventory';
import type { Item } from '@/types';

const AVATARS = ['blue', 'amber', 'rose', 'green'] as const;

export function Avatar({ name, index = 0, size = 44 }: { name: string; index?: number; size?: number }) {
  const theme = useTheme();
  const tone = AVATARS[index % AVATARS.length];
  const bg = tone === 'blue' ? theme.blueSoft : tone === 'amber' ? theme.amberSoft : tone === 'green' ? theme.greenSoft : theme.surfaceAlt;
  const fg = tone === 'blue' ? theme.blueText : tone === 'amber' ? theme.amberText : tone === 'green' ? theme.greenText : theme.textSoft;
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text weight={800} style={{ color: fg, fontSize: size * 0.4 }}>
        {name.trim().charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

/** Label for the pill on the right of a row: days to expiry when close, otherwise the stock status. */
export function useStatusLabel() {
  const { t } = useInventory();
  return (item: Item): { label: string; tone: ReturnType<typeof toneForStatus> } => {
    const status = statusOf(item);
    const days = daysToExpiry(item);
    if ((status === 'expiring' || status === 'expired') && days !== null) {
      return { label: formatDays(t, days), tone: toneForStatus(status) };
    }
    return { label: t(status === 'low' ? 'status.low' : 'status.fine'), tone: toneForStatus(status) };
  };
}

export function ItemRow({ item, index = 0, showBar = true }: { item: Item; index?: number; showBar?: boolean }) {
  const theme = useTheme();
  const statusLabel = useStatusLabel();
  const { label, tone } = statusLabel(item);
  const status = statusOf(item);
  const fraction = Math.min(1, unitsLeft(item) / Math.max(1, item.usualQty));

  return (
    <Link href={{ pathname: '/item/[id]', params: { id: item.id } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${label}`}
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <Avatar name={item.name} index={index} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="h3" numberOfLines={1}>
            {item.name}
          </Text>
          {showBar ? <LevelBar fraction={fraction} status={status} /> : null}
        </View>
        <Pill label={label} tone={tone} />
      </Pressable>
    </Link>
  );
}
