import { View } from 'react-native';

import { BarChart } from '@/components/charts/bar-chart';
import { Donut } from '@/components/charts/donut';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { sampleSpend } from '@/data/sample';
import { useTheme } from '@/hooks/use-theme';
import { useInventory } from '@/store/inventory';

export default function InsightsScreen() {
  const theme = useTheme();
  const { t } = useInventory();
  const colors = [theme.green, theme.amber, theme.blue, theme.rose];
  const current = sampleSpend.months[sampleSpend.months.length - 1].total;

  return (
    <Screen>
      <Text variant="title">{t('insights.title')}</Text>

      <View style={{ backgroundColor: theme.primary, borderRadius: 20, padding: 18, gap: 2 }}>
        <Text variant="small" weight={600} style={{ color: theme.onPrimary }}>
          {t('insights.spent')}
        </Text>
        <Text variant="display" style={{ color: theme.onPrimary }}>
          RM {current}
        </Text>
      </View>

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Donut
          size={104}
          label={t('insights.byCategory')}
          slices={sampleSpend.byCategory.map((entry, i) => ({ value: entry.total, color: colors[i] }))}
        />
        <View style={{ flex: 1, gap: 8 }}>
          {sampleSpend.byCategory.map((entry, i) => (
            <View key={entry.category} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors[i] }} />
              <Text variant="small" color="textSoft" style={{ flex: 1 }}>
                {t(`cat.${entry.category}` as const)}
              </Text>
              <Text variant="small" weight={700}>
                RM {entry.total}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={{ gap: 4 }}>
        <Text variant="h3">{t('insights.last6')}</Text>
        <BarChart
          description={t('insights.last6')}
          bars={sampleSpend.months.map((m) => ({ label: m.label, value: m.total }))}
        />
      </Card>

      <Card tone="amber" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="h3" color="amberText">
            {t('insights.thrown')}
          </Text>
          <Text variant="small" color="amberText">
            {t('insights.thrownBody', { n: sampleSpend.thrownAway.items })}
          </Text>
        </View>
        <Text weight={800} color="amberText" style={{ fontSize: 20 }}>
          RM {sampleSpend.thrownAway.value}
        </Text>
      </Card>

      <Text variant="tiny" color="textMuted">
        {t('insights.sampleNote')}
      </Text>
    </Screen>
  );
}
