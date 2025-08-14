/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  ImageBackground,
  Dimensions,
  Share,
  AppState,
} from "react-native";
import {
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { useTheme } from "./ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "./AuthContext";
import { fontScale, scale, scaleFont } from "./Responsive";
import MyShayari from "./assets/myshayariicon.svg";
import AtRateIcon from "./assets/atrate.svg";
import LinearGradient from "react-native-linear-gradient";
import { AppContext } from "./AppContext";

const { width } = Dimensions.get("screen");

export default function CustomDrawerContent(props) {
  const { theme } = useTheme();
  const { user, logout, isLogin } = useContext(AuthContext);
  const navigation = useNavigation();
  const { updateActionStatus } = useContext(AppContext);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener("change", nextAppState => {
      // If coming back to foreground
      if (
        appState.current.match(/background/) &&
        nextAppState === "active"
      ) {
        updateActionStatus(false); // Reset after coming back
      }
      appState.current = nextAppState;
    });

    return () => sub.remove();
  }, []);


  const rateApp = () => {
    try {
      updateActionStatus(true)
      Linking.openURL("market://details?id=com.shayariapp").catch(console.error);

    } catch (error) {
      console.log(error);

    }
    // finally {
    //   updateActionStatus(false)
    // }
  };

  const sendFeedbackMail = () => {
    try {
      updateActionStatus(true)
      Linking.openURL(
        "mailto:jhingurlab@gmail.com?subject=Feedback&body=Hi, I would like to share some feedback..."
      );
    } catch (error) {

    }
  };

  const handleLogout = () => {
    logout();
    props.navigation.closeDrawer();
    navigation.navigate("Home");
  };

  const shareApp = () => {
    try {
      updateActionStatus(true)

      Share.share({
        message: `📲 Share your mood in style — text or image, with just one tap

  🔗 https://play.google.com/store/apps/details?id=com.shayariapp`,
      });
    } catch (error) {
      console.log(error);

    } finally {
      updateActionStatus(false)
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      style={[styles.drawerContainer, { backgroundColor: theme.background }]}
    >
      <ImageBackground
        source={require("./assets/Rectangle.png")}
        style={styles.headerBackground}
        imageStyle={styles.headerImageStyle}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {user ? (
            <View style={styles.headerOverlay}>
              <Text style={styles.appName}>{user.name}</Text>
              <Text style={styles.email}>
                {user.email || user.phone}
              </Text>
            </View>
          ) : (
            <View style={styles.headerCenterText}>
              <Text style={styles.guestText}>Hindi Shayari Lok</Text>
            </View>
          )}
        </View>
      </ImageBackground>

      <View style={styles.menuItemsContainer}>
        <DrawerMenuItem
          icon={<Ionicons name="heart" size={22} color="red" />}
          label="Favourites"
          onPress={() =>
            navigation.navigate("Shayari", {
              type: "favorites",
              title: "Favourite",
            })
          }
        />
        <DrawerMenuItem
          icon={<MyShayari width={scale(25)} height={scale(25)} />}
          label="My Shayaris"
          onPress={() =>
            navigation.navigate("Shayari", {
              type: "mine",
              title: "My Shayari",
            })
          }
        />
        <DrawerMenuItem
          icon={
            <Image
              source={require("./assets/pencil.png")}
              style={styles.pencilIcon}
            />
          }
          label="Write Own Shayari"
          onPress={() =>
            isLogin
              ? navigation.navigate("Writeshayari")
              : navigation.navigate("LoginScreen")
          }
        />
        <DrawerMenuItem
          icon={<AtRateIcon />}
          label="Feedback"
          onPress={sendFeedbackMail}
        />
        <DrawerMenuItem
          icon={<Ionicons name="share-social-outline" size={22} color={theme.text} />}
          label="Share"
          onPress={shareApp}
        />
        <DrawerMenuItem
          icon={<Ionicons name="star" size={22} color="gold" />}
          label="Rate Us"
          onPress={rateApp}
        />
        <DrawerMenuItem
          icon={<MaterialIcons name="flag" size={22} color={theme.text} />}
          label="Privacy Policy"
          onPress={() => {
            try {
              updateActionStatus(true)
              Linking.openURL("https://jhingurlab.blogspot.com/2025/08/privacy-policy.html")

            } catch (error) {
              console.log(error);

            }
          }
          }
        />
        {user && (
          <DrawerMenuItem
            icon={<FontAwesome5 name="sign-out-alt" size={22} color={theme.text} />}
            label="Logout"
            onPress={handleLogout}
          />
        )}
        <View style={styles.container}>
          <LinearGradient
            colors={["#ffffff00", "#ffffff80", "#ffffff"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.line}
          />
          <Text style={styles.versionText}>Version 1.0</Text>
          <LinearGradient
            colors={["#ffffff", "#ffffff80", "#ffffff00"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.line}
          />
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

const DrawerMenuItem = ({ icon, label, onPress }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      {icon}
      <Text style={[styles.menuText, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    height: 1,
    width: width * 0.3,
  },
  versionText: {
    marginHorizontal: 10,
    fontSize: 18,
    color: "#fff",
  },
  headerBackground: {
    width: "100%",
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  headerImageStyle: {
    resizeMode: "cover",
  },
  headerOverlay: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  headerCenterText: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  guestText: {
    color: "#fff",
    fontSize: fontScale * scaleFont(25),
  },
  pencilIcon: {
    width: scale(20),
    height: scale(20),
    resizeMode: "contain",
  },
  appName: {
    fontSize: fontScale * scaleFont(22),
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  email: {
    color: "#fff",
    fontSize: fontScale * scaleFont(14),
    marginTop: 4,
  },
  menuItemsContainer: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuText: {
    fontSize: fontScale * scaleFont(16),
    flex: 1,
    fontFamily: "Manrope_400Regular",
  },
});