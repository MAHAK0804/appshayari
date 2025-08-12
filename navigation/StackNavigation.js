/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useContext, useEffect, useRef, useState } from 'react'; // Keep React and hooks
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Keep if used in CustomDrawerContent

import { useTheme } from '../ThemeContext';
import CustomDrawerContent from '../CustomDrawerContent';
import HomeScreen from '../screen/HomeScreen';
import { NavigationContainer } from '@react-navigation/native'; // Already imported
import ShayariFullViewScreen from '../screen/ShayariFullViewScreen';
import ShayariEditScreen from '../screen/ShayariEditScreen';
import { useNavigation } from '@react-navigation/native'; // Used in CustomEditHeader
import WriteShayari from '../screen/WriteShayari';
import LoginScreen from '../screen/LoginScreen';
import VerifyOTPScreen from '../screen/VerifyOtpScreen';
import ShayariListScreen from '../screen/ShayariByCategory';
import AllCategories from '../screen/AllCategories';
import { fontScale, scale, scaleFont, verticalScale } from '../Responsive'; // Assuming these are correctly defined
import CreateShayari from '../assets/add (plus).svg'; // SVG imports
import FavShayari from '../assets/heart icon.svg'; // SVG imports

import { AuthContext } from '../AuthContext'; // Used in CustomEditHeader and HomeStack
import MenuBar from '../assets/MENU BAR.svg'; // SVG import
import BackArrow from '../assets/left arrow.svg'; // SVG import
// import { useRewardAd } from '../RewardContext'; // Keep if you uncomment later
import SplashScreen from '../screen/SplashScreen';
import messaging from '@react-native-firebase/messaging'; // Will be removed from HomeStack
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions'; // Will be removed from HomeStack
import { requestNotificationPermission } from '../Notification'; // Will be removed from HomeStack
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads'; // Used in CustomEditHeader and HomeStack

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// This sendTokenToServer function should be moved to App.js or a separate utility
// if it's not strictly tied to HomeStack's lifecycle.
// For now, keeping it here for context as it was in your provided code.

const CustomEditHeader = ({ theme, title, type }) => {
  const navigation = useNavigation();
  const { isLogin } = useContext(AuthContext);
  // const { showRewardAd } = useRewardAd();
  const interstitialAdRef = useRef(null);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);

  const createAndLoadInterstitialAd = () => {
    const newAd = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitialAdRef.current = newAd;

    newAd.addAdEventListener(AdEventType.LOADED, () => {
      setInterstitialLoaded(true);
      console.log('Interstitial ad loaded');
    });

    newAd.addAdEventListener(AdEventType.CLOSED, () => {
      // Reload a new ad when closed
      setInterstitialLoaded(false);
      createAndLoadInterstitialAd();
    });

    newAd.load();
  };

  useEffect(() => {
    createAndLoadInterstitialAd();
  }, []);

  const showInterstitialAd = () => {
    const ad = interstitialAdRef.current;
    if (ad && interstitialLoaded) {
      try {
        ad.show();
        navigation.goBack();
      } catch (error) {
        navigation.goBack();
      }
    } else {
      console.log('Interstitial not ready, loading new one...');
      navigation.goBack();

      createAndLoadInterstitialAd();
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.customHeader}>
        <TouchableOpacity
          onPress={() => {
            if (type === 'category') {
              // showRewardAd();
              if (interstitialLoaded) {
                showInterstitialAd();
                // Removed navigation.goBack() here as showInterstitialAd already calls it
              } else {
                navigation.goBack();
              }
            } else if (title === 'Popular Shayaris') {
              navigation.navigate('Home');
            } else {
              navigation.goBack();
            }
          }}
          style={styles.iconLeft}
        >
          <BackArrow width={40} height={40} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text
            numberOfLines={1}
            style={[styles.headerTitleText, { color: theme.primary }]}
          >
            {title}
          </Text>
        </View>
        {title === 'My Shayari' && (
          <TouchableOpacity
            onPress={() => {
              // showRewardAd();

              return isLogin
                ? navigation.navigate('HomeStack', {
                    screen: 'Writeshayari',
                  })
                : navigation.navigate('HomeStack', {
                    screen: 'LoginScreen',
                  });
            }}
            style={{ marginRight: scale(7) }}
          >
            <CreateShayari width={32} height={32} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

// HomeStack: This component should primarily define your stack navigation for the home flow.
// FCM logic should be moved to App.js.
function HomeStack({ navigation }) {
  const { theme } = useTheme();
  const { isLogin } = useContext(AuthContext);
  const [initialNotification, setinitialNotification] = useState();
  // Interstitial Ad logic remains here as it's screen-specific
  const interstitialAdRef = useRef(null);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);

  const createAndLoadInterstitialAd = () => {
    const newAd = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitialAdRef.current = newAd;

    newAd.addAdEventListener(AdEventType.LOADED, () => {
      setInterstitialLoaded(true);
      console.log('Interstitial ad loaded');
    });

    newAd.addAdEventListener(AdEventType.CLOSED, () => {
      // Reload a new ad when closed
      setInterstitialLoaded(false);
      createAndLoadInterstitialAd();
    });

    newAd.load();
  };
  const setupFCMListeners = () => {
    // 1. Handle background/quit notifications that open the app
    // This is called when the app is opened from a notification tap
    // while the app was in the background or quit state.
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification opened app from quit/background state:',
            remoteMessage.data,
          );
          setinitialNotification(remoteMessage);
          // Navigate to a specific screen based on notification data
          // Ensure navigationRef.current is available before attempting to navigate
          // if (navigationRef.current) {
          navigation.navigate('Splash', { initialNotification });
          // }
        }
      })
      .catch(error =>
        console.error('Error getting initial notification:', error),
      );

    // 2. Handle notifications received when the app is in the foreground
    // This listener fires when a notification arrives while the app is active.
    // You might want to display a local notification or an in-app message here.
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);
      // You can use your NotificationServices.js to show a local notification
      // based on this remoteMessage for a better user experience.
      // sendRandomNotification(
      //   remoteMessage.notification.title,
      //   remoteMessage.notification.body,
      // );
    });

    // 3. Handle notifications tapped when the app is in the background
    // This listener fires when a user taps a notification and the app is in the background.
    const unsubscribeOnNotificationOpenedApp =
      messaging().onNotificationOpenedApp(async remoteMessage => {
        console.log(
          'Notification opened app from background state:',
          remoteMessage.data,
        );
        setinitialNotification(remoteMessage);
        // Navigate to a specific screen based on notification data
        navigation.navigate('Splash', {
          initialNotification,
        });
      });

    // Return unsubscribe functions for cleanup
    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
    };
  };
  useEffect(() => {
    createAndLoadInterstitialAd();
    const unsubscribeFCM = setupFCMListeners();
    return () => {
      unsubscribeFCM();
    };
  }, []);

  const showInterstitialAd = () => {
    const ad = interstitialAdRef.current;
    if (ad && interstitialLoaded) {
      ad.show();
    } else {
      console.log('Interstitial not ready, loading new one...');
      createAndLoadInterstitialAd();
    }
  };

  // Removed all FCM related useEffect and functions from here.
  // They are now handled centrally in App.js.

  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen
        name="Splash"
        component={SplashScreen} // SplashScreen will not receive initialNotification directly from here
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShayariFullView"
        component={ShayariFullViewScreen}
        options={({ route }) => ({
          header: () => (
            <CustomEditHeader
              theme={theme}
              title={route.params.title || 'Favourite Shayari'}
            />
          ),
        })}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          header: () => (
            <View style={[styles.customHeader]}>
              <TouchableOpacity
                onPress={() => navigation.openDrawer()}
                style={styles.iconLeft}
              >
                <MenuBar width={40} height={40} />
              </TouchableOpacity>

              <View style={styles.titleContainer}>
                <Text
                  numberOfLines={1}
                  style={[styles.headerTitleText, { color: theme.primary }]}
                >
                  Home
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  // showRewardAd();
                  showInterstitialAd();
                  return isLogin
                    ? navigation.navigate('HomeStack', {
                        screen: 'Writeshayari',
                      })
                    : navigation.navigate('HomeStack', {
                        screen: 'LoginScreen',
                      });
                }}
                style={styles.iconLeft}
              >
                <CreateShayari width={40} height={40} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('HomeStack', {
                    screen: 'Shayari',
                    params: { type: 'favorites', title: 'Favourite' },
                  })
                }
                style={{ marginRight: scale(7) }}
              >
                <FavShayari width={40} height={45} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="Shayari"
        component={ShayariListScreen}
        options={({ route }) => ({
          header: () => (
            <CustomEditHeader
              theme={theme}
              title={route.params.title}
              type={route.params.type}
            />
          ),
        })}
      />
      <Stack.Screen
        name="ShayariEditScreen"
        component={ShayariEditScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AllCategories"
        component={AllCategories}
        options={{
          header: () => (
            <CustomEditHeader theme={theme} title="AllCategories" />
          ),
        }}
      />
      <Stack.Screen
        name="Writeshayari"
        component={WriteShayari}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VerifyOTPScreen"
        component={VerifyOTPScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Wrap DrawerNavigation with React.forwardRef
const DrawerNavigation = React.forwardRef(({ navigationRef }, ref) => {
  const { theme } = useTheme();

  return (
    <NavigationContainer ref={ref}>
      {' '}
      {/* Assign the ref here */}
      <Drawer.Navigator
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerStyle: {
            backgroundColor: theme.background,
          },
          drawerLabelStyle: {
            color: theme.text,
          },
        }}
      >
        <Drawer.Screen
          name="HomeStack"
          component={HomeStack}
          options={{ headerShown: false }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
});

export default DrawerNavigation;

const styles = StyleSheet.create({
  safeArea: {
    flex: 0,
  },
  customHeader: {
    backgroundColor: '#191734', // Match the header background
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Space between items
    paddingHorizontal: scale(10),
    paddingTop: verticalScale(30), // Adjusted vertical padding
    paddingBottom: verticalScale(15),
    elevation: 4,
  },
  iconLeft: {
    marginRight: 5,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center', // Center title vertically
    marginHorizontal: 10,
  },
  headerTitleText: {
    fontSize: fontScale * scaleFont(18),
    textAlign: 'start', // Center text
    fontFamily: 'Manrope_400Regular',
  },
});
