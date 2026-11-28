import { View, type ViewProps } from 'react-native';

import { Radius, Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface CardProps extends ViewProps {
  padded?: boolean;
  radius?: number;
  tone?: 'surface' | 'soft' | 'amber' | 'red';
}

export function Card({ padded = true, radius = Radius.lg, tone = 'surface', style, ...rest }: CardProps) {
  const theme = useTheme();
  const background =
    tone === 'soft' ? theme.primarySoft : tone === 'amber' ? theme.amberSoft : tone === 'red' ? theme.redSoft : theme.surface;
  return (
    <View
      style={[
        {
          backgroundColor: background,
          borderRadius: radius,
          padding: padded ? 16 : 0,
        },
        tone === 'surface' ? Shadow.card : null,
        style,
      ]}
      {...rest}
    />
  );
}
