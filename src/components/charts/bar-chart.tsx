import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { fontFor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface Bar {
  label: string;
  value: number;
}

const WIDTH = 320;
const HEIGHT = 130;
const BASE = 100;
const TOP = 26;

/** Simple vertical bars with value labels. The last bar is highlighted. */
export function BarChart({ bars, description }: { bars: Bar[]; description: string }) {
  const theme = useTheme();
  const max = Math.max(1, ...bars.map((b) => b.value));
  const slot = WIDTH / Math.max(1, bars.length);
  const barWidth = Math.min(34, slot * 0.6);

  return (
    <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} accessibilityLabel={description}>
      <Line x1={6} y1={BASE} x2={WIDTH - 6} y2={BASE} stroke={theme.border} strokeWidth={1} />
      {bars.map((bar, i) => {
        const height = (bar.value / max) * (BASE - TOP);
        const x = i * slot + (slot - barWidth) / 2;
        const last = i === bars.length - 1;
        return (
          <Rect
            key={bar.label}
            x={x}
            y={BASE - height}
            width={barWidth}
            height={height}
            rx={6}
            fill={last ? theme.primary : theme.greenSoft}
          />
        );
      })}
      {bars.map((bar, i) => {
        const height = (bar.value / max) * (BASE - TOP);
        const cx = i * slot + slot / 2;
        const last = i === bars.length - 1;
        return (
          <SvgText
            key={`v-${bar.label}`}
            x={cx}
            y={BASE - height - 6}
            fontSize={11}
            fontFamily={fontFor(last ? 800 : 600)}
            fill={theme.textSoft}
            textAnchor="middle">
            {bar.value}
          </SvgText>
        );
      })}
      {bars.map((bar, i) => (
        <SvgText
          key={`l-${bar.label}`}
          x={i * slot + slot / 2}
          y={118}
          fontSize={11}
          fontFamily={fontFor(i === bars.length - 1 ? 800 : 600)}
          fill={theme.textMuted}
          textAnchor="middle">
          {bar.label}
        </SvgText>
      ))}
    </Svg>
  );
}
