import { router, type Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icons';
import { Text } from '@/components/text';
import { Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useInventory } from '@/store/inventory';

type BarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICONS: Record<string, IconName> = { index: 'home', stock: 'stock', shop: 'shop', insights: 'insights' };

/** Floating pill bar: the active tab shows its label, the others are round icon buttons. */
export function FloatingTabBar({ state, descriptors, emitter, navigateToTab, insets: navInsets }: BarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useInventory();
  // Some Android phones report 0 for the bottom inset even with on-screen buttons, so keep a floor.
  const bottomGap = Math.max(insets.bottom, navInsets.bottom, Platform.OS === 'android' ? 40 : 12) + 8;

  return (
    <View style={{ backgroundColor: theme.bg, paddingHorizontal: 16, paddingTop: 6, paddingBottom: bottomGap }}>
      <View
        style={{
          height: 68,
          borderRadius: 34,
          backgroundColor: theme.surface,
          paddingHorizontal: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...Shadow.bar,
        }}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const title = descriptors[route.key].options.title ?? route.name;

          if (route.name === 'add') {
            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityLabel={t('camera.title')}
                onPress={() => router.push('/camera')}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: theme.deep,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon name="camera" color={theme.onDeep} size={26} />
              </Pressable>
            );
          }

          const icon = ICONS[route.name] ?? 'home';
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={title}
              accessibilityState={{ selected: focused }}
              onPress={() => {
                const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigateToTab(route.key);
              }}
              style={{
                height: 48,
                minWidth: 48,
                paddingHorizontal: focused ? 18 : 0,
                borderRadius: 24,
                backgroundColor: focused ? theme.primary : theme.surfaceAlt,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}>
              <Icon name={icon} color={focused ? theme.onPrimary : theme.textMuted} size={22} />
              {focused ? (
                <Text variant="small" weight={700} style={{ color: theme.onPrimary }}>
                  {title}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
