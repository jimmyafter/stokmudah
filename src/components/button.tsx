import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import type { ReactNode } from 'react';

import { Text } from '@/components/text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'secondary' | 'whatsapp' | 'ghost' | 'dashed' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  icon?: ReactNode;
  small?: boolean;
}

export function Button({ label, variant = 'primary', icon, small, disabled, style, ...rest }: ButtonProps) {
  const theme = useTheme();
  const look = {
    primary: { bg: theme.primary, fg: theme.onPrimary, border: 'transparent', width: 0 },
    secondary: { bg: theme.surface, fg: theme.primaryDark, border: theme.primary, width: 1.5 },
    whatsapp: { bg: theme.whatsapp, fg: theme.onWhatsapp, border: 'transparent', width: 0 },
    ghost: { bg: 'transparent', fg: theme.primaryDark, border: 'transparent', width: 0 },
    dashed: { bg: theme.primarySoft, fg: theme.primaryDark, border: theme.primary, width: 1.5 },
    danger: { bg: theme.redSoft, fg: theme.redText, border: 'transparent', width: 0 },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={(state) => [
        styles.base,
        {
          minHeight: small ? 44 : 52,
          backgroundColor: look.bg,
          borderColor: look.border,
          borderWidth: look.width,
          borderStyle: variant === 'dashed' ? 'dashed' : 'solid',
          opacity: disabled ? 0.45 : state.pressed ? 0.85 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      <View style={styles.row}>
        {icon}
        <Text variant="h3" weight={800} style={{ color: look.fg, fontSize: small ? 14 : 16 }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.pill,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
