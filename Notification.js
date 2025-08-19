import { Platform, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

export async function requestNotificationPermission() {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        // Android 13+
        const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
        if (result === RESULTS.GRANTED) {
          //console.log('✅ Notification permission granted (Android 13+)');
          Alert.alert('Permission granted');
          return true;
        } else {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in settings.',
          );
          return false;
        }
      } else {
        // Android 12 and below → custom ask
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          //console.log('✅ Notification permission granted (iOS)');
          return true;
        } else {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in settings.',
          );
          return false;
        }
      }
    } else {
      // iOS
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        //console.log('✅ Notification permission granted (iOS)');
        return true;
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in settings.',
        );
        return false;
      }
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}
