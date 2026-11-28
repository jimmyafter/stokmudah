import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Icon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { FREE_ITEM_LIMIT, FREE_SCAN_LIMIT, PREMIUM_SCAN_LIMIT } from '@/data/sample';
import { useTheme } from '@/hooks/use-theme';
import { useInventory } from '@/store/inventory';

export default function Paywall() {
  const theme = useTheme();
  const { t, setPlan, plan } = useInventory();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const [choice, setChoice] = useState<'yearly' | 'monthly'>('yearly');

  const Row = ({ label, free, premium }: { label: string; free: string; premium: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: theme.track }}>
      <Text variant="small" weight={700} style={{ flex: 1.3 }}>
        {label}
      </Text>
      <Text variant="small" color="textSoft" style={{ flex: 1, textAlign: 'center' }}>
        {free}
      </Text>
      <Text variant="small" weight={800} color="primaryDark" style={{ flex: 1, textAlign: 'center' }}>
        {premium}
      </Text>
    </View>
  );

  const Plan = ({ id, name, price, note, badge }: { id: 'yearly' | 'monthly'; name: string; price: string; note: string; badge?: string }) => {
    const selected = choice === id;
    return (
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        onPress={() => setChoice(id)}
        style={{
          flex: 1,
          padding: 14,
          borderRadius: 24,
          borderWidth: 2,
          borderColor: selected ? theme.primary : 'transparent',
          backgroundColor: selected ? theme.primarySoft : theme.surface,
          gap: 2,
        }}>
        {badge ? (
          <View style={{ position: 'absolute', top: -11, left: 12, backgroundColor: theme.primary, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
            <Text variant="tiny" weight={800} style={{ color: theme.onPrimary }}>
              {badge}
            </Text>
          </View>
        ) : null}
        <Text variant="small" weight={700} color="textSoft">
          {name}
        </Text>
        <Text weight={800} style={{ fontSize: 22 }}>
          {price}
        </Text>
        <Text variant="tiny" color="textSoft">
          {note}
        </Text>
      </Pressable>
    );
  };

  return (
    <Screen
      insetBottom
      footer={
        <>
          <Button
            label={t('paywall.cta')}
            onPress={() => Alert.alert(t('paywall.notReady'))}
          />
          {__DEV__ ? (
            <Button
              label={plan === 'premium' ? t('settings.freePlan') : t('paywall.preview')}
              variant="ghost"
              small
              onPress={() => {
                setPlan(plan === 'premium' ? 'free' : 'premium');
                router.back();
              }}
            />
          ) : null}
          <Text variant="tiny" color="textMuted" style={{ textAlign: 'center' }}>
            {t('paywall.fine')}
          </Text>
        </>
      }>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={() => router.back()}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}>
          <Icon name="close" color={theme.text} size={24} strokeWidth={2} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => Alert.alert(t('paywall.notReady'))} hitSlop={10}>
          <Text variant="small" weight={700} color="primaryDark">
            {t('paywall.restore')}
          </Text>
        </Pressable>
      </View>

      <Text variant="title">{t('paywall.title')}</Text>
      <Text variant="body" color="textSoft">
        {t('paywall.body')}
      </Text>
      {reason === 'items' || reason === 'scans' ? (
        <Card tone="amber" style={{ paddingVertical: 10 }}>
          <Text variant="small" weight={700} color="amberText">
            {reason === 'items' ? t('paywall.reasonItems', { max: FREE_ITEM_LIMIT }) : t('paywall.reasonScans')}
          </Text>
        </Card>
      ) : null}

      <Card style={{ paddingVertical: 4 }}>
        <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
          <View style={{ flex: 1.3 }} />
          <Text variant="tiny" weight={800} color="textSoft" style={{ flex: 1, textAlign: 'center' }}>
            {t('paywall.free')}
          </Text>
          <Text variant="tiny" weight={800} color="primaryDark" style={{ flex: 1, textAlign: 'center' }}>
            {t('paywall.premium')}
          </Text>
        </View>
        <Row label={t('paywall.items')} free={String(FREE_ITEM_LIMIT)} premium={t('paywall.unlimited')} />
        <Row
          label={t('paywall.scans')}
          free={t('paywall.perMonth', { n: FREE_SCAN_LIMIT })}
          premium={t('paywall.perMonth', { n: PREMIUM_SCAN_LIMIT })}
        />
      </Card>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <Plan id="yearly" name={t('paywall.yearly')} price="RM 79" note={t('paywall.yearlyNote')} badge={t('paywall.bestValue')} />
        <Plan id="monthly" name={t('paywall.monthly')} price="RM 9.90" note={t('paywall.monthlyNote')} />
      </View>
    </Screen>
  );
}
