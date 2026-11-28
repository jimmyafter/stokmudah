import { Alert, Image, Pressable, View } from 'react-native';

import { Avatar } from '@/components/item-row';
import { Icon } from '@/components/icons';
import { Text } from '@/components/text';
import { useTheme } from '@/hooks/use-theme';
import { pickPhoto } from '@/lib/photo';
import { useInventory } from '@/store/inventory';

interface PhotoTileProps {
  name: string;
  photo?: string;
  onChange: (photo: string | undefined) => void;
  size?: number;
  /** Show the "Add photo" label beside the tile. */
  withLabel?: boolean;
}

/** The item picture. Tap to take a photo, choose one from the gallery, or remove it. */
export function PhotoTile({ name, photo, onChange, size = 64, withLabel = false }: PhotoTileProps) {
  const theme = useTheme();
  const { t } = useInventory();

  async function run(source: 'camera' | 'library') {
    const result = await pickPhoto(source);
    if (result.status === 'ok') onChange(result.photo);
    if (result.status === 'denied') Alert.alert(t('photo.denied'));
  }

  function open() {
    const buttons = [
      { text: t('photo.take'), onPress: () => run('camera') },
      { text: t('photo.gallery'), onPress: () => run('library') },
      photo
        ? { text: t('photo.remove'), style: 'destructive' as const, onPress: () => onChange(undefined) }
        : { text: t('common.cancel'), style: 'cancel' as const },
    ];
    Alert.alert(photo ? t('photo.change') : t('photo.add'), undefined, buttons, { cancelable: true });
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={photo ? t('photo.change') : t('photo.add')}
      onPress={open}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View>
        {photo || name.trim() ? (
          <Avatar name={name || '?'} size={size} photo={photo} />
        ) : (
          <View style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: theme.surfaceAlt }} />
        )}
        <View
          style={{
            position: 'absolute',
            right: -6,
            bottom: -6,
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: theme.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name="camera" color={theme.onPrimary} size={14} strokeWidth={2.2} />
        </View>
      </View>
      {withLabel ? (
        <Text variant="small" weight={700} color="primaryDark">
          {photo ? t('photo.change') : t('photo.add')}
        </Text>
      ) : null}
    </Pressable>
  );
}
