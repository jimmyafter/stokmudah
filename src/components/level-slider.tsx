import Slider from '@react-native-community/slider';
import { View } from 'react-native';

import { Text } from '@/components/text';
import { useTheme } from '@/hooks/use-theme';
import { levelLabel } from '@/i18n';
import { LEVELS, levelIndex } from '@/lib/stock';
import { useInventory } from '@/store/inventory';

/** Five-step slider: almost empty, quarter, half, three quarters, full. */
export function LevelSlider({ level, onChange }: { level: number; onChange: (level: number) => void }) {
  const theme = useTheme();
  const { t } = useInventory();
  const index = levelIndex(level);
  return (
    <View style={{ gap: 6 }}>
      <Slider
        minimumValue={0}
        maximumValue={LEVELS.length - 1}
        step={1}
        value={index}
        onValueChange={(next) => onChange(LEVELS[Math.round(next)])}
        minimumTrackTintColor={theme.primary}
        maximumTrackTintColor={theme.track}
        thumbTintColor={theme.primary}
        accessibilityLabel={levelLabel(t, level)}
        style={{ height: 40 }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
        {['0', '¼', '½', '¾', '1'].map((mark) => (
          <Text key={mark} variant="tiny" color="textMuted">
            {mark}
          </Text>
        ))}
      </View>
    </View>
  );
}
