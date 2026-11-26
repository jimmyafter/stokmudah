import type { ReactNode } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  /** Reserve room under the content for the bottom safe area (screens outside the tab bar). */
  insetBottom?: boolean;
  contentStyle?: ViewStyle;
  footer?: ReactNode;
}

export function Screen({ children, scroll = true, insetBottom = false, contentStyle, footer }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const padding: ViewStyle = {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24 + (insetBottom ? insets.bottom : 0),
    gap: 12,
  };
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[padding, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, padding, contentStyle]}>{children}</View>
      )}
      {footer ? (
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 12 + (insetBottom ? insets.bottom : 0),
            borderTopWidth: 1,
            borderTopColor: theme.border,
            backgroundColor: theme.bg,
            gap: 8,
          }}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}
