import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export type PhotoResult = { status: 'ok'; photo: string } | { status: 'cancelled' } | { status: 'denied' };

/** Shrink to a small square thumbnail stored as a data URI with the item. */
async function toThumbnail(uri: string): Promise<string | undefined> {
  try {
    const out = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 192 } }], {
      compress: 0.55,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    return out.base64 ? `data:image/jpeg;base64,${out.base64}` : undefined;
  } catch {
    return undefined;
  }
}

/** Take a photo or choose one from the gallery. The picker crops to a square, so no AI scan is used. */
export async function pickPhoto(source: 'camera' | 'library'): Promise<PhotoResult> {
  try {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return { status: 'denied' };
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    };
    const result =
      source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled || !result.assets[0]) return { status: 'cancelled' };
    const photo = await toThumbnail(result.assets[0].uri);
    return photo ? { status: 'ok', photo } : { status: 'cancelled' };
  } catch {
    return { status: 'cancelled' };
  }
}
