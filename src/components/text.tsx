import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { fontFor, type ColorName, type FontWeight } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'display' | 'title' | 'h2' | 'h3' | 'body' | 'small' | 'tiny' | 'label';

export interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: ColorName;
  weight?: FontWeight;
}

export function Text({ variant = 'body', color = 'text', weight, style, ...rest }: AppTextProps) {
  const theme = useTheme();
  const base = styles[variant];
  return (
    <RNText
      style={[
        { color: theme[color], fontFamily: fontFor(weight ?? base.weight) },
        base.style,
        style,
      ]}
      {...rest}
    />
  );
}

const styles: Record<Variant, { weight: FontWeight; style: TextStyle }> = {
  display: { weight: 800, style: { fontSize: 32, lineHeight: 38, letterSpacing: -0.6 } },
  title: { weight: 800, style: { fontSize: 26, lineHeight: 32, letterSpacing: -0.5 } },
  h2: { weight: 800, style: { fontSize: 18, lineHeight: 24 } },
  h3: { weight: 700, style: { fontSize: 15, lineHeight: 20 } },
  body: { weight: 500, style: { fontSize: 15, lineHeight: 22 } },
  small: { weight: 500, style: { fontSize: 13, lineHeight: 18 } },
  tiny: { weight: 600, style: { fontSize: 12, lineHeight: 16 } },
  label: {
    weight: 800,
    style: { fontSize: 12, lineHeight: 16, letterSpacing: 0.5, textTransform: 'uppercase' },
  },
};
