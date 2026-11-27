import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { LevelSlider } from '@/components/level-slider';
import { Screen } from '@/components/screen';
import { Stepper } from '@/components/stepper';
import { Text } from '@/components/text';
import { fontFor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addDays, addMonths, toISODate } from '@/lib/dates';
import { levelLabel, type TKey } from '@/i18n';
import { useInventory, type NewPurchase } from '@/store/inventory';
import type { Category, Location } from '@/types';

const CATEGORIES: Category[] = ['fresh', 'pantry', 'household', 'toiletries'];
const LOCATIONS: Location[] = ['kitchen', 'bathroom', 'storeroom'];

type ExpiryChoice = 'none' | '3d' | '1w' | '2w' | '1m' | '6m' | '1y';
const EXPIRY: { id: ExpiryChoice; key: TKey }[] = [
  { id: 'none', key: 'add.noExpiry' },
  { id: '3d', key: 'add.in3d' },
  { id: '1w', key: 'add.in1w' },
  { id: '2w', key: 'add.in2w' },
  { id: '1m', key: 'add.in1m' },
  { id: '6m', key: 'add.in6m' },
  { id: '1y', key: 'add.in1y' },
];

function expiryDate(choice: ExpiryChoice): string | undefined {
  const now = new Date();
  switch (choice) {
    case '3d': return toISODate(addDays(now, 3));
    case '1w': return toISODate(addDays(now, 7));
    case '2w': return toISODate(addDays(now, 14));
    case '1m': return toISODate(addMonths(now, 1));
    case '6m': return toISODate(addMonths(now, 6));
    case '1y': return toISODate(addMonths(now, 12));
    default: return undefined;
  }
}

interface AddItemFormProps {
  initialName: string;
  barcode?: string;
  initialCategory?: Category;
  /** An exact date (YYYY-MM-DD), for example read from a photo of the pack. */
  initialExpiry?: string;
  /** Shown above the form, for example "Product found". */
  banner?: string;
  onSave: (purchase: NewPurchase) => void;
  onCancel: () => void;
}

export function AddItemForm({ initialName, barcode, initialCategory, initialExpiry, banner, onSave, onCancel }: AddItemFormProps) {
  const theme = useTheme();
  const { t } = useInventory();
  const [name, setName] = useState(initialName);
  const [packs, setPacks] = useState(1);
  const [level, setLevel] = useState(1);
  const [category, setCategory] = useState<Category>(initialCategory ?? 'pantry');
  const [location, setLocation] = useState<Location>('kitchen');
  const [expiry, setExpiry] = useState<ExpiryChoice | 'scanned'>(initialExpiry ? 'scanned' : 'none');
  const [price, setPrice] = useState('');
  const [missingName, setMissingName] = useState(false);

  function save() {
    if (!name.trim()) {
      setMissingName(true);
      return;
    }
    const parsed = parseFloat(price.replace(',', '.'));
    onSave({
      name,
      barcode,
      category,
      location,
      packs,
      level,
      expiry: expiry === 'scanned' ? initialExpiry : expiryDate(expiry),
      price: Number.isFinite(parsed) ? parsed : undefined,
    });
  }

  return (
    <Screen
      insetBottom
      footer={
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button label={t('common.cancel')} variant="secondary" style={{ flex: 1 }} onPress={onCancel} />
          <Button label={t('add.saveItem')} style={{ flex: 2 }} onPress={save} />
        </View>
      }>
      <Text variant="title">{t('camera.title')}</Text>
      {banner ? (
        <Text variant="small" weight={700} color="primaryDark">
          {banner}
        </Text>
      ) : null}

      <Text variant="label" color="textMuted">
        {t('add.name')}
      </Text>
      <TextInput
        value={name}
        onChangeText={(value) => {
          setName(value);
          setMissingName(false);
        }}
        placeholder={t('add.namePlaceholder')}
        placeholderTextColor={theme.textMuted}
        accessibilityLabel={t('add.name')}
        style={{
          minHeight: 52,
          paddingHorizontal: 14,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: missingName ? theme.red : theme.border,
          backgroundColor: theme.surface,
          color: theme.text,
          fontFamily: fontFor(700),
          fontSize: 16,
        }}
      />
      {missingName ? (
        <Text variant="tiny" color="redText">
          {t('add.nameRequired')}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
        <Text variant="h3">{t('add.packs')}</Text>
        <Stepper
          value={packs}
          min={1}
          onChange={setPacks}
          decreaseLabel={`${t('add.packs')} −`}
          increaseLabel={`${t('add.packs')} +`}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text variant="h3">{t('add.howFull')}</Text>
        <Text variant="small" weight={700} color="primaryDark">
          {levelLabel(t, level)}
        </Text>
      </View>
      <LevelSlider level={level} onChange={setLevel} />

      <Text variant="label" color="textMuted" style={{ marginTop: 6 }}>
        {t('add.category')}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {CATEGORIES.map((c) => (
          <Chip key={c} label={t(`cat.${c}` as const)} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>

      <Text variant="label" color="textMuted" style={{ marginTop: 6 }}>
        {t('add.location')}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {LOCATIONS.map((l) => (
          <Chip key={l} label={t(`loc.${l}` as const)} selected={location === l} onPress={() => setLocation(l)} />
        ))}
      </View>

      <Text variant="label" color="textMuted" style={{ marginTop: 6 }}>
        {t('add.expiry')}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {initialExpiry ? (
          <Chip label={initialExpiry} selected={expiry === 'scanned'} onPress={() => setExpiry('scanned')} />
        ) : null}
        {EXPIRY.map((choice) => (
          <Chip key={choice.id} label={t(choice.key)} selected={expiry === choice.id} onPress={() => setExpiry(choice.id)} />
        ))}
      </View>

      <Text variant="label" color="textMuted" style={{ marginTop: 6 }}>
        {t('add.price')}
      </Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor={theme.textMuted}
        accessibilityLabel={t('add.price')}
        style={{
          minHeight: 48,
          paddingHorizontal: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.surface,
          color: theme.text,
          fontFamily: fontFor(600),
          fontSize: 15,
        }}
      />
    </Screen>
  );
}
