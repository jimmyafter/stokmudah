import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { Header } from '@/components/header';
import { LevelSlider } from '@/components/level-slider';
import { Screen } from '@/components/screen';
import { Stepper } from '@/components/stepper';
import { Text } from '@/components/text';
import { fontFor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { levelLabel } from '@/i18n';
import { fromUnits, unitsLeft } from '@/lib/stock';
import { useInventory } from '@/store/inventory';
import type { Item } from '@/types';

type Method = 'blind' | 'level' | 'number';

interface Difference {
  name: string;
  estimate: number;
  counted: number;
}

export default function CountScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { items, t, updateItem } = useInventory();

  const queue = useMemo<Item[]>(() => {
    if (id) return items.filter((item) => item.id === id);
    return [...items].sort((a, b) => a.location.localeCompare(b.location));
    // The queue is fixed when the screen opens, so edits made while counting do not reorder it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const [index, setIndex] = useState(0);
  const [method, setMethod] = useState<Method>('level');
  const [quantity, setQuantity] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [guess, setGuess] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [differences, setDifferences] = useState<Difference[]>([]);
  const [updated, setUpdated] = useState(0);

  const current = queue[index];
  const finished = index >= queue.length;

  if (queue.length === 0) {
    return (
      <Screen insetBottom>
        <Header title={t('count.title')} />
        <Text variant="body" color="textMuted">
          {t('count.nothing')}
        </Text>
      </Screen>
    );
  }

  if (finished) {
    return (
      <Screen
        insetBottom
        footer={<Button label={t('count.finish')} onPress={() => router.back()} />}>
        <Header title={t('count.summaryTitle')} />
        <Text variant="body" color="textMuted">
          {t('count.summaryBody', { n: updated })}
        </Text>
        {differences.length > 0 ? (
          <>
            <Text variant="h2" style={{ marginTop: 8 }}>
              {t('count.differences')}
            </Text>
            {differences.map((d) => (
              <Card key={d.name} style={{ paddingVertical: 10 }}>
                <Text variant="h3">{d.name}</Text>
                <Text variant="small" color="textMuted">
                  {d.estimate.toFixed(1)} → {d.counted.toFixed(1)}
                </Text>
              </Card>
            ))}
          </>
        ) : null}
      </Screen>
    );
  }

  const shownQuantity = quantity ?? current.quantity;
  const shownLevel = level ?? current.level;
  const estimate = unitsLeft(current);

  function advance() {
    setIndex((i) => i + 1);
    setQuantity(null);
    setLevel(null);
    setGuess('');
    setRevealed(false);
  }

  function apply() {
    let next: { quantity: number; level: number };
    if (method === 'blind') {
      const parsed = parseFloat(guess.replace(',', '.'));
      if (!Number.isFinite(parsed)) return;
      next = fromUnits(parsed);
    } else if (method === 'number') {
      next = { quantity: shownQuantity, level: current.level };
    } else {
      next = { quantity: shownQuantity, level: shownLevel };
    }
    updateItem(current.id, next);
    setUpdated((n) => n + 1);
    const counted = next.quantity <= 0 ? 0 : Math.max(0, next.quantity - 1) + next.level;
    if (estimate - counted > 0.5) {
      setDifferences((list) => [...list, { name: current.name, estimate, counted }]);
    }
    advance();
  }

  const blindReady = guess.trim().length > 0 && Number.isFinite(parseFloat(guess.replace(',', '.')));

  return (
    <Screen
      insetBottom
      footer={
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button label={t('common.skip')} variant="secondary" style={{ flex: 1 }} onPress={advance} />
          {method === 'blind' && !revealed ? (
            <Button label={t('common.done')} style={{ flex: 2 }} disabled={!blindReady} onPress={() => setRevealed(true)} />
          ) : (
            <Button label={t('common.next')} style={{ flex: 2 }} disabled={method === 'blind' && !blindReady} onPress={apply} />
          )}
        </View>
      }>
      <Header title={t('count.title')} />
      <Text variant="small" weight={700} color="textMuted">
        {t('count.progress', { current: index + 1, total: queue.length })} · {t(`loc.${current.location}` as const)}
      </Text>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.track }}>
        <View
          style={{
            width: `${Math.round(((index + 1) / queue.length) * 100)}%`,
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.primary,
          }}
        />
      </View>

      <Card style={{ alignItems: 'center', gap: 6, paddingVertical: 20 }}>
        <Text variant="title" style={{ fontSize: 22, textAlign: 'center' }}>
          {current.name}
        </Text>
        <Text variant="small" color="textMuted">
          {method === 'level' ? t('count.howMuch') : t('count.howMany')}
        </Text>
        {method !== 'blind' ? (
          <Text weight={800} style={{ fontSize: 28, marginTop: 6 }}>
            {method === 'level' ? levelLabel(t, shownLevel) : shownQuantity}
          </Text>
        ) : null}
      </Card>

      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Chip label={t('count.blind')} selected={method === 'blind'} onPress={() => { setMethod('blind'); setRevealed(false); }} />
        <Chip label={t('count.level')} selected={method === 'level'} onPress={() => setMethod('level')} />
        <Chip label={t('count.number')} selected={method === 'number'} onPress={() => setMethod('number')} />
      </View>

      {method === 'level' ? (
        <View style={{ gap: 12 }}>
          <LevelSlider level={shownLevel} onChange={setLevel} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="h3">{t('count.howMany')}</Text>
            <Stepper value={shownQuantity} onChange={setQuantity} decreaseLabel={`${t('item.packs')} −`} increaseLabel={`${t('item.packs')} +`} />
          </View>
        </View>
      ) : null}

      {method === 'number' ? (
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Stepper value={shownQuantity} onChange={setQuantity} decreaseLabel={`${t('item.packs')} −`} increaseLabel={`${t('item.packs')} +`} />
        </View>
      ) : null}

      {method === 'blind' ? (
        <View style={{ gap: 10 }}>
          <Text variant="small" color="textSoft">
            {t('count.blindPrompt')}
          </Text>
          <TextInput
            value={guess}
            onChangeText={setGuess}
            keyboardType="decimal-pad"
            placeholder="1.5"
            placeholderTextColor={theme.textMuted}
            accessibilityLabel={t('count.howMany')}
            style={{
              minHeight: 56,
              paddingHorizontal: 14,
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: theme.border,
              backgroundColor: theme.surface,
              color: theme.text,
              fontFamily: fontFor(800),
              fontSize: 22,
              textAlign: 'center',
            }}
          />
          {revealed ? (
            <Card tone="soft" style={{ alignItems: 'center' }}>
              <Text variant="h3" color="primaryDark">
                {t('count.estimate', { n: estimate.toFixed(1) })}
              </Text>
            </Card>
          ) : (
            <Text variant="tiny" color="textMuted">
              {t('count.blindNote')}
            </Text>
          )}
        </View>
      ) : null}
    </Screen>
  );
}
