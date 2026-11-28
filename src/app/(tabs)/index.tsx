import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { HealthRing } from '@/components/charts/health-ring';
import { Icon } from '@/components/icons';
import { ItemRow } from '@/components/item-row';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { estimateTotal, suggestedLines } from '@/lib/shopping';
import { healthCounts, useFirst } from '@/lib/stock';
import { useInventory } from '@/store/inventory';

function greetingKey(hour: number) {
  if (hour < 12) return 'home.morning' as const;
  if (hour < 17) return 'home.afternoon' as const;
  return 'home.evening' as const;
}

function Dot({ color }: { color: string }) {
  return <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />;
}

export default function HomeScreen() {
  const theme = useTheme();
  const { items, t, language } = useInventory();
  const now = new Date();
  const counts = healthCounts(items, now);
  const soon = useFirst(items, 3, now);
  const listLines = suggestedLines(items, now);
  const dateLabel = now.toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="small" color="textMuted">
            {dateLabel}
          </Text>
          <Text variant="title">{t(greetingKey(now.getHours()))}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.title')}
          onPress={() => router.push('/settings')}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.surface,
            alignItems: 'center',
            justifyContent: 'center',
            ...Shadow.card,
          }}>
          <Icon name="user" color={theme.text} size={22} />
        </Pressable>
      </View>

      {listLines.length > 0 ? (
        <View style={{ backgroundColor: theme.deep, borderRadius: 28, padding: 20, gap: 6, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', right: -34, top: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.07)' }} />
          <View style={{ position: 'absolute', right: 30, bottom: -50, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <Text variant="h2" style={{ color: theme.onDeep }}>
            {t('home.listReady')}
          </Text>
          <Text variant="small" style={{ color: theme.onDeep, opacity: 0.85 }}>
            {t('home.listMeta', { n: listLines.length, total: Math.round(estimateTotal(listLines)) })}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.viewList')}
            onPress={() => router.push('/shop')}
            style={{ marginTop: 8, alignSelf: 'flex-start', minHeight: 44, paddingHorizontal: 20, borderRadius: 22, backgroundColor: '#DFF5E8', justifyContent: 'center' }}>
            <Text variant="small" weight={800} style={{ color: '#1F5C4B' }}>
              {t('home.viewList')}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {items.length === 0 ? (
        <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 28 }}>
          <Text variant="h2">{t('home.emptyTitle')}</Text>
          <Text variant="body" color="textMuted" style={{ textAlign: 'center' }}>
            {t('home.emptyBody')}
          </Text>
        </Card>
      ) : (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <HealthRing counts={counts} caption={t('home.healthy')} />
          <View style={{ flex: 1, gap: 8 }}>
            <Text variant="h3">{t('home.healthTitle')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Dot color={theme.green} />
              <Text variant="small" color="textSoft">
                {t('home.fine', { n: counts.fine })}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Dot color={theme.amber} />
              <Text variant="small" color="textSoft">
                {t('home.low', { n: counts.low })}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Dot color={theme.red} />
              <Text variant="small" color="textSoft">
                {t('home.expiring', { n: counts.expiring })}
              </Text>
            </View>
          </View>
        </Card>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 6 }}>
        <Text variant="h2">{t('home.useFirst')}</Text>
        <Pressable accessibilityRole="link" onPress={() => router.push('/stock')} hitSlop={10}>
          <Text variant="small" weight={700} color="primaryDark">
            {t('home.seeAll')}
          </Text>
        </Pressable>
      </View>

      {soon.length === 0 ? (
        <Text variant="body" color="textMuted">
          {t('home.nothingExpiring')}
        </Text>
      ) : (
        <View style={{ gap: 10 }}>
          {soon.map((item, i) => (
            <ItemRow key={item.id} item={item} index={i} showBar={false} />
          ))}
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
        <Button
          label={t('home.justBought')}
          style={{ flex: 1 }}
          onPress={() => router.push({ pathname: '/camera', params: { mode: 'receipt' } })}
        />
        <Button
          label={t('home.countStock')}
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => router.push('/count')}
        />
      </View>
    </Screen>
  );
}
