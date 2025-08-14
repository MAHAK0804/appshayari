/* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable react-native/no-inline-styles */
// /* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useContext, useEffect, useState } from 'react'; // Keep React and hooks
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  NativeModules,
} from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons'; // Keep if used in CustomDrawerContent

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
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const CustomEditHeader = ({ theme, title, type, ads }) => {
  const navigation = useNavigation();
  const { isLogin } = useContext(AuthContext);
  // const { showRewardAd } = useRewardAd();

  const handleBackPress = () => {
    ads;
    // Define the navigation logic you want to run after the ad closes
    navigation.navigate('Home');

    // Call the global showAd function and pass the callback
  };
  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: verticalScale(20) }]}>
      <View style={styles.customHeader}>
        <TouchableOpacity
          onPress={() => {
            if (type === 'category') {
              // showRewardAd();

              handleBackPress();
              // Removed navigation.goBack() here as showInterstitialAd already calls it
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
            <CreateShayari width={50} height={50} />
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
  // INTERSTITIAL_AD_UNIT_ID;
  const { AdConstants } = NativeModules;
  console.log(
    'Native Ad ID:',
    JSON.stringify(AdConstants.INTERSTITIAL_AD_UNIT_ID),
  );

  const adUnitId = __DEV__
    ? TestIds.INTERSTITIAL
    : AdConstants.INTERSTITIAL_AD_UNIT_ID;
  const [interstitialAds, setInterstitialAds] = useState(null);
  useEffect(() => {
    initInterstital();
  }, []);
  const initInterstital = async () => {
    const interstitialAd = InterstitialAd.createForAdRequest(adUnitId);
    interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      setInterstitialAds(interstitialAd);
      console.log('Interstital Ads Loaded');
    });
    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstital Ads closed');
    });
    interstitialAd.load();
  };
  const showInterstitialAd = async () => {
    if (interstitialAds) {
      interstitialAds.show();
    }
  };

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
          // headerShown: false,
          header: () => (
            <SafeAreaView
              style={[styles.safeArea, { paddingTop: verticalScale(20) }]}
            >
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
                    showInterstitialAd;
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
                  <CreateShayari width={50} height={50} />
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
                  <FavShayari width={50} height={50} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
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
              ads={showInterstitialAd}
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
    backgroundColor: '#191734',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Space between items
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(10),
    // elevation: 4,
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
