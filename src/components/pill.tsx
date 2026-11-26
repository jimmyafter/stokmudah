import { View } from 'react-native';

import { Text } from '@/components/text';
import { Radius, type ColorName } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Status } from '@/types';

export type Tone = 'green' | 'amber' | 'red' | 'blue' | 'neutral';

const TONES: Record<Tone, { bg: ColorName; fg: ColorName }> = {
  green: { bg: 'greenSoft', fg: 'greenText' },
  amber: { bg: 'amberSoft', fg: 'amberText' },
  red: { bg: 'redSoft', fg: 'redText' },
  blue: { bg: 'blueSoft', fg: 'blueText' },
  neutral: { bg: 'surfaceAlt', fg: 'textSoft' },
};

export function toneForStatus(status: Status): Tone {
  if (status === 'fine') return 'green';
  if (status === 'low') return 'amber';
  return 'red';
}

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const theme = useTheme();
  const colors = TONES[tone];
  return (
    <View
      style={{
        backgroundColor: theme[colors.bg],
        borderRadius: Radius.pill,
        paddingHorizontal: 10,
        paddingVertical: 6,
        alignSelf: 'flex-start',
      }}>
      <Text variant="tiny" weight={700} color={colors.fg}>
        {label}
      </Text>
    </View>
  );
}
