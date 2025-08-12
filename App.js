/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  LogBox,
  Platform,
  Alert,
  Linking, // Only for showing specific permission request as fallback/example, primary is Firebase
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootSiblingParent } from 'react-native-root-siblings';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MobileAds } from 'react-native-google-mobile-ads';
// import { NavigationContainerRef } from '@react-navigation/native'; // Not needed if using useRef for navigationRef

import { ThemeProvider } from './ThemeContext';
import DrawerNavigation from './navigation/StackNavigation'; // Assuming this component contains NavigationContainer
import { AuthProvider } from './AuthContext.js';
// import { RewardAdProvider } from './RewardContext.js';
import Toast from 'react-native-root-toast';
import messaging from '@react-native-firebase/messaging';

// Ignore all log warnings for a cleaner console output during development
LogBox.ignoreAllLogs();
const sendTokenToServer = async token => {
  try {
    const response = await fetch(
      'https://hindishayari.onrender.com/api/register-fcm-token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fcmToken: token, userId: 'some_user_id' }), // Replace 'some_user_id' with actual user ID
      },
    );
    const data = await response.json();
    console.log('Token sent to server:', data);
  } catch (error) {
    console.error('Error sending token to server:', error);
  }
};
export default function App() {
  const [isReady, setIsReady] = useState(false);
  // Create a ref for the NavigationContainer within DrawerNavigation to allow
  // navigation outside of components rendered by NavigationContainer itself.
  const navigationRef = useRef(null);

  const openAppSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    }
  };

  const requestUserPermission = async () => {
    try {
      // const authStatus = await messaging().requestPermission();
      // const enabled =
      //   authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      //   authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      // if (enabled) {
      //   console.log('Firebase Messaging: Authorization status:', authStatus);
      //   const fcmToken = await messaging().getToken();
      //   await sendTokenToServer(fcmToken);
      //   console.log('Firebase Messaging: FCM Token:', fcmToken);
      // } else {
      console.log('Firebase Messaging: User denied notification permissions.');
      Alert.alert(
        'Notification Permission Denied',
        'Please enable notification permissions in your device settings to receive important updates.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: openAppSettings,
          },
        ],
      );
      // }
    } catch (error) {
      console.error('Firebase Messaging: Error requesting permission:', error);
      Alert.alert(
        'Permission Error',
        'Could not request notification permissions.',
      );
    }
  };

  const checkNotificationStatusAndRequest = async () => {
    const settings = await messaging().hasPermission();
    console.log('set', settings);

    if (
      settings === messaging.AuthorizationStatus.NOT_DETERMINED ||
      settings === messaging.AuthorizationStatus.DENIED
    ) {
      // Permission has not been requested yet or was explicitly denied.
      requestUserPermission();
    } else {
      // Permission is already granted or Provisional.
      // You can still get the token and set up listeners.
      const fcmToken = await messaging().getToken();
      await sendTokenToServer(fcmToken);
      console.log('Firebase Messaging: FCM Token (already granted):', fcmToken);
    }
  };

  useEffect(() => {
    // Setup Android notification channels if applicable (optional but good practice)
    // setupNotificationChannel(); // Assuming this function is correctly implemented in NotificationServices.js

    // Request permissions first
    // requestUserPermission();
    checkNotificationStatusAndRequest();
    // Then set up FCM listeners

    // Initialize Google Mobile Ads
    const initAds = async () => {
      try {
        if (Platform.OS === 'android') {
          // It's good practice to initialize AdMob on iOS too if applicable
          const status = await MobileAds().initialize();
          if (__DEV__) {
            console.log('AdMob initialized:', status);
          }
        }
        setIsReady(true);
      } catch (error) {
        console.error('AdMob initialization error:', error);
        Toast.show('Please check your internet or Play Services for Ads.', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
        setIsReady(true); // Still set ready to allow app to load even if ads fail
      }
    };

    initAds();

    // Clean up FCM listeners on component unmount
  }, []); // Empty dependency array ensures this runs once on mount

  if (!isReady) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <RewardAdProvider> */}
      <ThemeProvider>
        <RootSiblingParent>
          <AuthProvider>
            <SafeAreaProvider>
              <StatusBar
                backgroundColor="transparent"
                barStyle="light-content"
                translucent={true}
              />
              {/* Pass the ref to the NavigationContainer (which is likely inside DrawerNavigation) */}
              {/* Ensure your DrawerNavigation component correctly passes this ref to NavigationContainer's `ref` prop */}
              <DrawerNavigation ref={navigationRef} />
            </SafeAreaProvider>
          </AuthProvider>
        </RootSiblingParent>
      </ThemeProvider>
      {/* </RewardAdProvider> */}
    </GestureHandlerRootView>
  );
}
