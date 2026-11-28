import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { useStatusLabel } from '@/components/item-row';
import { PhotoTile } from '@/components/photo-tile';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { DateInput } from '@/components/date-input';
import { Stepper } from '@/components/stepper';
import { Icon } from '@/components/icons';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { fontFor, Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDays, levelLabel } from '@/i18n';
import { daysUntil, formatUserDate, parseISODate, parseUserDate } from '@/lib/dates';
import { unitsLeft } from '@/lib/stock';
import { useInventory } from '@/store/inventory';
import type { Category, Location } from '@/types';

const CATEGORIES: Category[] = ['fresh', 'pantry', 'household', 'toiletries'];
const LOCATIONS: Location[] = ['kitchen', 'bathroom', 'storeroom'];

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { items, t, language, removePack, deleteItem, excluded, toggleExcluded, updateItem } = useInventory();
  const statusLabel = useStatusLabel();
  const item = items.find((candidate) => candidate.id === id);
  const [editing, setEditing] = useState(false);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchQty, setBatchQty] = useState(1);
  const [batchDate, setBatchDate] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('pantry');
  const [location, setLocation] = useState<Location>('kitchen');

  if (!item) {
    return (
      <Screen insetTop={false} contentStyle={{ paddingTop: 28 }}>
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
      insetTop={false}
      contentStyle={{ paddingTop: 28 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <PhotoTile name={item.name} photo={item.photo} size={64} onChange={(photo) => updateItem(item.id, { photo })} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text variant="title" style={{ fontSize: 24, lineHeight: 30 }}>
            {item.name}
          </Text>
          <Text variant="small" color="textMuted">
            {t(`cat.${item.category}` as const)} · {t(`loc.${item.location}` as const)}
          </Text>
          <Pill label={label} tone={tone} />
        </View>
        {!editing ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('item.edit')}
            onPress={() => {
              setName(item.name);
              setCategory(item.category);
              setLocation(item.location);
              setEditing(true);
            }}
            style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.card }}>
            <Icon name="edit" color={theme.text} size={20} />
          </Pressable>
        ) : null}
      </View>

      {editing ? (
        <View style={{ gap: 12 }}>
          <Text variant="label" color="textMuted">
            {t('add.name')}
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            accessibilityLabel={t('add.name')}
            style={{
              minHeight: 52,
              paddingHorizontal: 14,
              borderRadius: 20,
              backgroundColor: theme.surface,
              color: theme.text,
              fontFamily: fontFor(700),
              fontSize: 16,
            }}
          />
          <Text variant="label" color="textMuted">
            {t('add.category')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={t(`cat.${c}` as const)} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
          <Text variant="label" color="textMuted">
            {t('add.location')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {LOCATIONS.map((l) => (
              <Chip key={l} label={t(`loc.${l}` as const)} selected={location === l} onPress={() => setLocation(l)} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
            <Button label={t('common.cancel')} variant="secondary" style={{ flex: 1 }} onPress={() => setEditing(false)} />
            <Button
              label={t('common.save')}
              style={{ flex: 1 }}
              disabled={!name.trim()}
              onPress={() => {
                updateItem(item.id, { name: name.trim(), category, location });
                setEditing(false);
              }}
            />
          </View>
        </View>
      ) : batchId ? (
        <View style={{ gap: 12 }}>
          <Text variant="h2">{t('batch.edit')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="h3">{t('item.packs')}</Text>
            <Stepper
              value={batchQty}
              min={1}
              onChange={setBatchQty}
              decreaseLabel={`${t('item.packs')} −`}
              increaseLabel={`${t('item.packs')} +`}
            />
          </View>
          <Text variant="label" color="textMuted">
            {t('add.expiry')}
          </Text>
          <DateInput text={batchDate} label={t('add.expiry')} onChangeText={setBatchDate} />
          <Chip label={t('batch.expiryNone')} selected={batchDate === ''} onPress={() => setBatchDate('')} />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
            <Button label={t('common.cancel')} variant="secondary" style={{ flex: 1 }} onPress={() => setBatchId(null)} />
            <Button
              label={t('common.save')}
              style={{ flex: 1 }}
              disabled={batchDate !== '' && parseUserDate(batchDate) === null}
              onPress={() => {
                const expiry = batchDate === '' ? undefined : (parseUserDate(batchDate) ?? undefined);
                const old = item.batches.find((b) => b.id === batchId);
                if (!old) return setBatchId(null);
                updateItem(item.id, {
                  batches: item.batches.map((b) => (b.id === batchId ? { ...b, quantity: batchQty, expiry } : b)),
                  quantity: Math.max(0, item.quantity - old.quantity + batchQty),
                });
                setBatchId(null);
              }}
            />
          </View>
          <Button
            label={t('batch.remove')}
            variant="danger"
            small
            onPress={() => {
              const old = item.batches.find((b) => b.id === batchId);
              if (!old) return setBatchId(null);
              updateItem(item.id, {
                batches: item.batches.filter((b) => b.id !== batchId),
                quantity: Math.max(0, item.quantity - old.quantity),
              });
              setBatchId(null);
            }}
          />
        </View>
      ) : (
        <>

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

      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            label={t('item.countNow')}
            style={{ flex: 1 }}
            onPress={() => router.push({ pathname: '/count', params: { id: item.id } })}
          />
          <Button
            label={onList ? t('item.addedToList') : t('item.addToList')}
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => toggleExcluded(item.id)}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            label={t('item.markUsed')}
            variant="secondary"
            style={{ flex: 1 }}
            disabled={item.quantity <= 0}
            onPress={() => removePack(item.id)}
          />
          <Button
            label={t('item.throwAway')}
            variant="danger"
            style={{ flex: 1 }}
            disabled={item.quantity <= 0}
            onPress={() => removePack(item.id)}
          />
        </View>
      </View>

      <Text variant="h2" style={{ marginTop: 6 }}>
        {t('item.batches')}
      </Text>
      <Text variant="tiny" color="textMuted" style={{ marginTop: -6 }}>
        {t('batch.hint')}
      </Text>
      <View style={{ gap: 8 }}>
        {batches.map((batch) => {
          const days = batch.expiry ? daysUntil(batch.expiry) : null;
          return (
            <Pressable
              key={batch.id}
              accessibilityRole="button"
              accessibilityLabel={t('batch.edit')}
              onPress={() => {
                setBatchId(batch.id);
                setBatchQty(batch.quantity);
                setBatchDate(formatUserDate(batch.expiry));
              }}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
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
            </Pressable>
          );
        })}
      </View>

      {item.price !== undefined ? (
        <Text variant="small" color="textMuted">
          {t('item.lastBought', { price: item.price.toFixed(2) })}
          {item.store ? ` · ${item.store}` : ''}
        </Text>
      ) : null}

      <Button
        label={t('item.delete')}
        small
        variant="ghost"
        onPress={() => {
          deleteItem(item.id);
          router.back();
        }}
      />
        </>
      )}
    </Screen>
  );
}
