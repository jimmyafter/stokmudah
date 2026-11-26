import { Pressable, View } from 'react-native';

import { Text } from '@/components/text';
import { useTheme } from '@/hooks/use-theme';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  decreaseLabel: string;
  increaseLabel: string;
}

export function Stepper({ value, onChange, min = 0, max = 99, decreaseLabel, increaseLabel }: StepperProps) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={decreaseLabel}
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - 1))}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          borderWidth: 1.5,
          borderColor: theme.border,
          backgroundColor: theme.surface,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: value <= min ? 0.4 : 1,
        }}>
        <Text weight={600} style={{ fontSize: 22, lineHeight: 26 }}>
          −
        </Text>
      </Pressable>
      <Text weight={800} style={{ fontSize: 20, minWidth: 28, textAlign: 'center' }}>
        {value}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={increaseLabel}
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: theme.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: value >= max ? 0.4 : 1,
        }}>
        <Text weight={600} style={{ fontSize: 22, lineHeight: 26, color: theme.onPrimary }}>
          +
        </Text>
      </Pressable>
    </View>
  );
}
