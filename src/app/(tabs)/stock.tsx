import { useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';

import { Chip } from '@/components/chip';
import { Icon } from '@/components/icons';
import { ItemRow } from '@/components/item-row';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { fontFor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { statusOf } from '@/lib/stock';
import { useInventory } from '@/store/inventory';
import type { Location } from '@/types';

type Filter = 'all' | Location | 'low';

const LOCATIONS: Location[] = ['kitchen', 'bathroom', 'storeroom'];

export default function StockScreen() {
  const theme = useTheme();
  const { items, t } = useInventory();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (needle && !item.name.toLowerCase().includes(needle)) return false;
      if (filter === 'all') return true;
      if (filter === 'low') return statusOf(item) !== 'fine';
      return item.location === filter;
    });
  }, [items, query, filter]);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text variant="title">{t('stock.title')}</Text>
        <Text variant="small" weight={600} color="textMuted">
          {t('stock.count', { n: items.length })}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          minHeight: 48,
          paddingHorizontal: 14,
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 14,
        }}>
        <Icon name="search" color={theme.textMuted} size={20} strokeWidth={2} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('stock.search')}
          placeholderTextColor={theme.textMuted}
          accessibilityLabel={t('stock.search')}
          autoCorrect={false}
          style={{ flex: 1, fontFamily: fontFor(500), fontSize: 15, color: theme.text, paddingVertical: 12 }}
        />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Chip label={t('stock.all')} selected={filter === 'all'} onPress={() => setFilter('all')} />
        {LOCATIONS.map((location) => (
          <Chip
            key={location}
            label={t(`loc.${location}` as const)}
            selected={filter === location}
            onPress={() => setFilter(location)}
          />
        ))}
        <Chip label={t('stock.low')} selected={filter === 'low'} onPress={() => setFilter('low')} />
      </View>

      {visible.length === 0 ? (
        <Text variant="body" color="textMuted" style={{ marginTop: 12 }}>
          {t('stock.noResults')}
        </Text>
      ) : (
        <View style={{ gap: 8 }}>
          {visible.map((item, i) => (
            <ItemRow key={item.id} item={item} index={i} />
          ))}
        </View>
      )}
    </Screen>
  );
}
