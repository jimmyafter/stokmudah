import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { Text } from '@/components/text';
import { useTheme } from '@/hooks/use-theme';
import type { HealthCounts } from '@/lib/stock';

const SIZE = 96;
const RADIUS = 38;
const STROKE = 11;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Ring of fine, low and expiring shares, with the healthy percentage in the middle. */
export function HealthRing({ counts, caption }: { counts: HealthCounts; caption: string }) {
  const theme = useTheme();
  const total = Math.max(1, counts.total);
  const segments = [
    { value: counts.fine, color: theme.green },
    { value: counts.low, color: theme.amber },
    { value: counts.expiring, color: theme.red },
  ];
  const percent = counts.total === 0 ? 0 : Math.round((counts.fine / total) * 100);
  let offset = 0;

  return (
    <View
      style={{ width: SIZE, height: SIZE }}
      accessible
      accessibilityLabel={`${caption}: ${percent}%`}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <G rotation={-90} origin={`${SIZE / 2}, ${SIZE / 2}`}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke={theme.track} strokeWidth={STROKE} fill="none" />
          {segments.map((segment, i) => {
            if (segment.value <= 0) return null;
            const length = (segment.value / total) * CIRCUMFERENCE;
            const circle = (
              <Circle
                key={i}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke={segment.color}
                strokeWidth={STROKE}
                fill="none"
                strokeDasharray={`${Math.max(0, length - 3)} ${CIRCUMFERENCE}`}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return circle;
          })}
        </G>
      </Svg>
      <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text weight={800} style={{ fontSize: 22, lineHeight: 24 }}>
          {percent}%
        </Text>
        <Text variant="tiny" color="textMuted">
          {caption}
        </Text>
      </View>
    </View>
  );
}
