import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.85,
};

export async function takeCollectiblePhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      'Camera needed',
      'Collectiverse needs the camera to photograph your collectible.',
    );
    return null;
  }

  const result = await ImagePicker.launchCameraAsync(pickerOptions);
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}

export async function pickCollectiblePhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      'Photos needed',
      'Collectiverse needs photo access so you can choose an image of your collectible.',
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}
