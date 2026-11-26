import { Pressable } from 'react-native';

import { Text } from '@/components/text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export function Chip({ label, selected, onPress, disabled }: ChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        minHeight: 40,
        paddingHorizontal: 16,
        borderRadius: Radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected ? theme.primary : theme.surface,
        borderWidth: selected ? 0 : 1,
        borderColor: theme.border,
        opacity: disabled ? 0.45 : 1,
      }}>
      <Text variant="small" weight={selected ? 700 : 600} style={{ color: selected ? theme.onPrimary : theme.textSoft }}>
        {label}
      </Text>
    </Pressable>
  );
}
