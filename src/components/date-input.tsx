import { TextInput, View } from 'react-native';

import { Text } from '@/components/text';
import { fontFor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { maskDateInput, parseUserDate } from '@/lib/dates';
import { useInventory } from '@/store/inventory';

interface DateInputProps {
  /** The text in the box, DD/MM/YYYY. The parent turns it into a date with parseUserDate. */
  text: string;
  onChangeText: (text: string) => void;
  label: string;
}

/** Type a date by hand. Slashes are added for you, and a date that does not exist is flagged. */
export function DateInput({ text, onChangeText, label }: DateInputProps) {
  const theme = useTheme();
  const { t } = useInventory();
  const invalid = text.length === 10 && parseUserDate(text) === null;
  return (
    <View style={{ gap: 4 }}>
      <TextInput
        value={text}
        onChangeText={(value) => onChangeText(maskDateInput(value))}
        keyboardType="number-pad"
        maxLength={10}
        placeholder={t('date.placeholder')}
        placeholderTextColor={theme.textMuted}
        accessibilityLabel={label}
        style={{
          minHeight: 52,
          paddingHorizontal: 14,
          borderRadius: 20,
          borderWidth: 1.5,
          borderColor: invalid ? theme.red : 'transparent',
          backgroundColor: theme.surface,
          color: theme.text,
          fontFamily: fontFor(700),
          fontSize: 16,
        }}
      />
      {invalid ? (
        <Text variant="tiny" color="redText">
          {t('date.invalid')}
        </Text>
      ) : null}
    </View>
  );
}
