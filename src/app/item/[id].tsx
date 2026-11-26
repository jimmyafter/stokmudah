import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Avatar, useStatusLabel } from '@/components/item-row';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Header } from '@/components/header';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { formatDays, levelLabel } from '@/i18n';
import { daysUntil, parseISODate } from '@/lib/dates';
import { unitsLeft } from '@/lib/stock';
import { useInventory } from '@/store/inventory';

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, t, language, removePack, deleteItem, excluded, toggleExcluded } = useInventory();
  const statusLabel = useStatusLabel();
  const item = items.find((candidate) => candidate.id === id);

  if (!item) {
    return (
      <Screen>
        <Header title="" />
        <Text variant="body" color="textMuted">
          {t('item.notFound')}
        </Text>
      </Screen>
    );
  }

  const { label, tone } = statusLabel(item);
  const onList = excluded[item.id] === false;
  const batches = [...item.batches].sort((a, b) =>
    (a.expiry ?? '9999-12-31').localeCompare(b.expiry ?? '9999-12-31'),
  );
  const locale = language === 'ms' ? 'ms-MY' : 'en-MY';

  return (
    <Screen
      insetBottom
      footer={
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button
            label={onList ? t('item.addedToList') : t('item.addToList')}
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => toggleExcluded(item.id)}
          />
          <Button
            label={t('item.countNow')}
            style={{ flex: 1 }}
            onPress={() => router.push({ pathname: '/count', params: { id: item.id } })}
          />
        </View>
      }>
      <Header title="" />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar name={item.name} size={64} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text variant="title" style={{ fontSize: 24, lineHeight: 30 }}>
            {item.name}
          </Text>
          <Text variant="small" color="textMuted">
            {t(`cat.${item.category}` as const)} · {t(`loc.${item.location}` as const)}
          </Text>
        </View>
        <Pill label={label} tone={tone} />
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Card style={{ flex: 1, padding: 12, gap: 2 }}>
          <Text variant="tiny" color="textMuted">
            {t('item.open')}
          </Text>
          <Text weight={800} style={{ fontSize: 18 }}>
            {levelLabel(t, item.level)}
          </Text>
        </Card>
        <Card style={{ flex: 1, padding: 12, gap: 2 }}>
          <Text variant="tiny" color="textMuted">
            {t('item.packs')}
          </Text>
          <Text weight={800} style={{ fontSize: 18 }}>
            {item.quantity}
          </Text>
        </Card>
        <Card style={{ flex: 1, padding: 12, gap: 2 }}>
          <Text variant="tiny" color="textMuted">
            {t('item.unitsLeft')}
          </Text>
          <Text weight={800} style={{ fontSize: 18 }}>
            {unitsLeft(item).toFixed(1)}
          </Text>
        </Card>
      </View>

      <Text variant="h2" style={{ marginTop: 6 }}>
        {t('item.batches')}
      </Text>
      <View style={{ gap: 8 }}>
        {batches.map((batch) => {
          const days = batch.expiry ? daysUntil(batch.expiry) : null;
          return (
            <Card key={batch.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
              <View style={{ flex: 1 }}>
                <Text variant="h3">
                  {batch.quantity} × {t('item.packs')}
                </Text>
                <Text variant="small" color="textMuted">
                  {batch.expiry
                    ? t('item.expires', {
                        date: parseISODate(batch.expiry).toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
                      })
                    : t('item.noExpiry')}
                </Text>
              </View>
              {days !== null ? (
                <Pill label={formatDays(t, days)} tone={days < 0 ? 'red' : days <= item.warnDays ? 'red' : 'green'} />
              ) : null}
            </Card>
          );
        })}
      </View>

      {item.price !== undefined ? (
        <Text variant="small" color="textMuted">
          {t('item.lastBought', { price: item.price.toFixed(2) })}
          {item.store ? ` · ${item.store}` : ''}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
        <Button
          label={t('item.markUsed')}
          small
          style={{ flex: 1, backgroundColor: undefined }}
          variant="secondary"
          disabled={item.quantity <= 0}
          onPress={() => removePack(item.id)}
        />
        <Button
          label={t('item.throwAway')}
          small
          variant="danger"
          style={{ flex: 1 }}
          disabled={item.quantity <= 0}
          onPress={() => removePack(item.id)}
        />
      </View>
      <Button
        label={t('item.delete')}
        small
        variant="ghost"
        onPress={() => {
          deleteItem(item.id);
          router.back();
        }}
      />
    </Screen>
  );
}
