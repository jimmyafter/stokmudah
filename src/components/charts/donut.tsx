import Svg, { Circle, G } from 'react-native-svg';

export interface DonutSlice {
  value: number;
  color: string;
}

const RADIUS = 38;
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function Donut({ slices, size = 104, label }: { slices: DonutSlice[]; size?: number; label: string }) {
  const total = Math.max(1, slices.reduce((sum, slice) => sum + slice.value, 0));
  let offset = 0;
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" accessibilityLabel={label}>
      <G rotation={-90} origin="48, 48">
        {slices.map((slice, i) => {
          const length = (slice.value / total) * CIRCUMFERENCE;
          const circle = (
            <Circle
              key={i}
              cx={48}
              cy={48}
              r={RADIUS}
              stroke={slice.color}
              strokeWidth={STROKE}
              fill="none"
              strokeDasharray={`${Math.max(0, length - 2)} ${CIRCUMFERENCE}`}
              strokeDashoffset={-offset}
            />
          );
          offset += length;
          return circle;
        })}
      </G>
    </Svg>
  );
}
