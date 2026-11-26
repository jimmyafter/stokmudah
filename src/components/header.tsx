import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';

import { Icon } from '@/components/icons';
import { Text } from '@/components/text';
import { useTheme } from '@/hooks/use-theme';
import { useInventory } from '@/store/inventory';

/** Back button and title row for screens pushed on top of the tabs. */
export function Header({ title, right }: { title: string; right?: ReactNode }) {
  const theme = useTheme();
  const { t } = useInventory();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: -8 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="back" color={theme.text} size={24} strokeWidth={2} />
      </Pressable>
      <Text variant="title" style={{ flex: 1, fontSize: 22 }}>
        {title}
      </Text>
      {right}
    </View>
  );
}
