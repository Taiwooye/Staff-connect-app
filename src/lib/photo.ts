import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export type PhotoResult = { uri: string } | { error: string } | null;

/**
 * Lets the person pick (or take) a photo, crops it square and shrinks it to a small
 * JPEG data URI so it can be stored on the device with the rest of the profile.
 */
export async function pickProfilePhoto(source: 'library' | 'camera'): Promise<PhotoResult> {
  if (Platform.OS !== 'web') {
    const perm =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return { error: source === 'camera' ? 'Camera access is needed to take a photo.' : 'Photo access is needed to choose a photo.' };
    }
  }

  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.9 };
  const result =
    source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets[0]) return null;

  try {
    const rendered = await ImageManipulator.manipulate(result.assets[0].uri).resize({ width: 320, height: 320 }).renderAsync();
    const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.75, base64: true });
    return saved.base64 ? { uri: `data:image/jpeg;base64,${saved.base64}` } : { uri: saved.uri };
  } catch {
    return { error: 'That photo couldn’t be processed. Try another one.' };
  }
}
