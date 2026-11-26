import { router, Tabs } from 'expo-router';
import { Pressable, View, type ColorValue } from 'react-native';

import { Icon, type IconName } from '@/components/icons';
import { fontFor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useInventory } from '@/store/inventory';

function tabIcon(name: IconName, fallback: string) {
  return ({ color }: { color: ColorValue }) => (
    <Icon name={name} color={typeof color === 'string' ? color : fallback} />
  );
}

function AddButton({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => router.push('/camera')}
        style={{
          width: 62,
          height: 62,
          borderRadius: 31,
          marginTop: -24,
          backgroundColor: theme.primary,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 4,
          borderColor: theme.bg,
          shadowColor: theme.primary,
          shadowOpacity: 0.35,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 5 },
          elevation: 6,
        }}>
        <Icon name="camera" color={theme.onPrimary} size={28} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useInventory();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primaryDark,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarLabelStyle: { fontFamily: fontFor(700), fontSize: 11 },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: t('tab.home'), tabBarIcon: tabIcon('home', theme.textMuted) }}
      />
      <Tabs.Screen
        name="stock"
        options={{ title: t('tab.stock'), tabBarIcon: tabIcon('stock', theme.textMuted) }}
      />
      <Tabs.Screen
        name="add"
        options={{ title: t('tab.add'), tabBarButton: () => <AddButton label={t('camera.title')} /> }}
      />
      <Tabs.Screen
        name="shop"
        options={{ title: t('tab.shop'), tabBarIcon: tabIcon('shop', theme.textMuted) }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: t('tab.insights'), tabBarIcon: tabIcon('insights', theme.textMuted) }}
      />
    </Tabs>
  );
}
