import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { HealthRing } from '@/components/charts/health-ring';
import { Icon } from '@/components/icons';
import { ItemRow } from '@/components/item-row';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { useTheme } from '@/hooks/use-theme';
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
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name="user" color={theme.text} size={22} />
        </Pressable>
      </View>

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
