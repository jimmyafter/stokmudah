import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { Status } from '@/types';

export function LevelBar({ fraction, status }: { fraction: number; status: Status }) {
  const theme = useTheme();
  const fill = status === 'fine' ? theme.green : status === 'low' ? theme.amber : theme.red;
  const width = `${Math.round(Math.min(1, Math.max(0.04, fraction)) * 100)}%` as `${number}%`;
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.track }}>
      <View style={{ width, height: 6, borderRadius: 3, backgroundColor: fill }} />
    </View>
  );
}
