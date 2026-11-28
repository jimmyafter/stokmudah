import { Tabs } from 'expo-router';

import { FloatingTabBar } from '@/components/floating-tab-bar';
import { useInventory } from '@/store/inventory';

export default function TabsLayout() {
  const { t } = useInventory();

  return (
    <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: t('tab.home') }} />
      <Tabs.Screen name="stock" options={{ title: t('tab.stock') }} />
      <Tabs.Screen name="add" options={{ title: t('tab.add') }} />
      <Tabs.Screen name="shop" options={{ title: t('tab.shop') }} />
      <Tabs.Screen name="insights" options={{ title: t('tab.insights') }} />
    </Tabs>
  );
}
