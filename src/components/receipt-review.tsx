import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { useTheme } from '@/hooks/use-theme';
import { matchScore, type ReceiptLine } from '@/lib/ai-scan';
import { useInventory } from '@/store/inventory';

interface Props {
  lines: ReceiptLine[];
  onDone: () => void;
  onRetry: () => void;
}

/** Shows what the AI read from a receipt. Nothing changes stock until the person confirms. */
export function ReceiptReview({ lines, onDone, onRetry }: Props) {
  const theme = useTheme();
  const { t, items, addPurchase, freeSlotsLeft } = useInventory();

  const rows = useMemo(
    () =>
      lines.map((line) => {
        let best: (typeof items)[number] | undefined;
        let score = 0;
        for (const item of items) {
          const s = matchScore(line.name, item.name);
          if (s > score) { score = s; best = item; }
        }
        return { line, match: score >= 0.5 ? best : undefined };
      }),
    [lines, items],
  );

  // Low-confidence lines start unticked so a bad read is never added silently.
  const [on, setOn] = useState<boolean[]>(() => lines.map((l) => l.confidence >= 0.6));
  const count = on.filter(Boolean).length;

  function confirm() {
    let slots = freeSlotsLeft;
    let blocked = false;
    rows.forEach(({ line, match }, i) => {
      if (!on[i]) return;
      // A line that matches an item you track never counts against the free limit.
      if (!match) {
        if (slots <= 0) {
          blocked = true;
          return;
        }
        slots -= 1;
      }
      addPurchase({
        name: match?.name ?? line.name,
        barcode: match?.barcode,
        category: match?.category ?? 'pantry',
        location: match?.location ?? 'kitchen',
        packs: line.quantity,
        level: 1,
        price: line.price,
      });
    });
    if (blocked) {
      onDone();
      router.push({ pathname: '/paywall', params: { reason: 'items' } });
      return;
    }
    onDone();
  }

  return (
    <Screen
      insetBottom
      footer={
        lines.length ? (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button label={t('receipt.another')} variant="secondary" style={{ flex: 1 }} onPress={onRetry} />
            <Button label={t('receipt.add', { n: count })} style={{ flex: 2 }} disabled={count === 0} onPress={confirm} />
          </View>
        ) : (
          <Button label={t('receipt.another')} onPress={onRetry} />
        )
      }>
      <Text variant="title">{t('receipt.title')}</Text>
      <Text variant="body" color="textMuted">
        {lines.length ? t('receipt.note') : t('receipt.empty')}
      </Text>
      {rows.map(({ line, match }, i) => (
        <Pressable
          key={i}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: on[i] }}
          onPress={() => setOn((prev) => prev.map((v, j) => (j === i ? !v : v)))}
          style={{
            minHeight: 60,
            padding: 12,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: on[i] ? (match ? theme.primary : theme.amber) : theme.border,
            backgroundColor: theme.surface,
            opacity: on[i] ? 1 : 0.55,
            gap: 2,
          }}>
          <Text variant="body" weight={700}>
            {line.quantity} × {line.name}
            {line.price ? `  · RM ${line.price.toFixed(2)}` : ''}
          </Text>
          <Text variant="tiny" color={match ? 'primaryDark' : 'textMuted'}>
            {match ? t('receipt.match', { name: match.name }) : t('receipt.new')}
          </Text>
        </Pressable>
      ))}
    </Screen>
  );
}
