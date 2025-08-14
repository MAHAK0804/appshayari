/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
// import { Ionicons } from "@expo/vector-icons";
import Ionicons from 'react-native-vector-icons/Ionicons';

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  NativeModules,
} from "react-native";
import { AuthContext } from "../AuthContext";
import { fontScale, scaleFont, verticalScale } from "../Responsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { AppContext } from '../AppContext';

export default function VerifyOTPScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { AdConstants } = NativeModules;
  console.log("Ad ID:", JSON.stringify(AdConstants.BANNER_AD_UNIT_ID));

  const adUnitId = __DEV__ ? TestIds.BANNER : AdConstants.BANNER_AD_UNIT_ID
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState(300); // 5 minutes
  const [showOtp, setShowOtp] = useState("");
  const timerRef = useRef(null);
  const { login } = useContext(AuthContext);

  const inputs = Array.from({ length: 6 }, () => useRef(null));
  const { updateActionStatus } = useContext(AppContext);
  useEffect(() => {
    updateActionStatus(true)
  }, [])
  useEffect(() => {
    const loadSavedOtp = async () => {
      if (route.params.phone) {
        const saved = await AsyncStorage.getItem("otp");
        if (saved) {
          // const otpArray = saved.split("").slice(0, 6);
          // // setOtp(otpArray);
          showCustomOtpToast(saved);
        }
      }
    };

    loadSavedOtp();

    return () => clearInterval(timerRef.current);
  }, []);

  const startOtpTimer = () => {
    setRemainingTime(300);
    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setToastVisible(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const showCustomOtpToast = (otpCode) => {
    setShowOtp(otpCode);
    setToastVisible(true);
    startOtpTimer();
  };

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputs[index + 1].current.focus();
    }
  };

  const handleBackspace = (key, index) => {
    if (key === "Backspace" && otp[index] === "" && index > 0) {
      inputs[index - 1].current.focus();
    }
  };

  const verifyCode = async () => {
    const code = otp.join("");
    setLoading(true);
    try {
      const payload = {
        name: route.params.name,
        otp: code,
      };

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(route.params.email);
      if (isEmail) {
        payload.email = route.params.email;
      } else {
        payload.phone = route.params.phone;
      }

      const res = await axios.post(
        "https://hindishayari.onrender.com/api/users/auth/verify-otp",
        payload
      );

      if (res.data.message === "OTP verified") {
        const userData = {
          name: route.params.name,
          email: route.params.email,
          phone: route.params.phone,
        };
        await login(res.data.userId, userData);
        updateActionStatus(false)
        navigation.replace("Writeshayari");
      } else {
        Alert.alert("Invalid OTP");
      }
    } catch (error) {
      console.log("OTP Verify Error:", error);
      Alert.alert("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async () => {
    const { phone, email } = route.params;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhone = /^[0-9]{10}$/.test(phone);
    setLoading2(true);
    try {
      let response;
      if (isEmail) {
        response = await axios.post(
          "https://hindishayari.onrender.com/api/users/auth/request-otp",
          { name: route.params.name, email }
        );
        Alert.alert("OTP sent to your email.");
      } else if (isPhone) {
        response = await axios.post(
          "https://hindishayari.onrender.com/api/users/auth/request-otp",
          { name: route.params.name, phone }
        );
        const otpCode = response.data.data.user.otp;
        await AsyncStorage.setItem("otp", otpCode);
        showCustomOtpToast(otpCode);
        Alert.alert("OTP sent to your phone.");
      }
    } catch (error) {
      console.log("Resend OTP Error:", error.message);
      Alert.alert("Failed to resend OTP.");
    } finally {
      setLoading2(false);
    }
  };

  return (
    <>
      <View style={styles.background}>
        <SafeAreaView style={[styles.safeArea, { paddingTop: verticalScale(15) }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>
        {toastVisible && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastOtpText}>Your OTP: {showOtp}</Text>
            <Text style={styles.toastTimerText}>
              Expires in: {Math.floor(remainingTime / 60)}:
              {String(remainingTime % 60).padStart(2, "0")}
            </Text>
          </View>
        )}

        <View style={styles.container}>
          <Text style={styles.title}>Verify Code</Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputs[index]}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleBackspace(nativeEvent.key, index)
                }
                keyboardType="number-pad"
                maxLength={1}
                style={styles.otpBox}
              />
            ))}
          </View>

          <Text style={styles.resend}>
            Didn't receive the code?{" "}
            <TouchableOpacity onPress={handleOtp} disabled={loading2}>
              {loading2 ? (
                <Text style={{ color: "#999" }}>Resending...</Text>
              ) : (
                <Text style={{ color: "#fff", textDecorationLine: "underline" }}>
                  Resend
                </Text>
              )}
            </TouchableOpacity>
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={verifyCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ position: "absolute", bottom: insets.bottom, left: 0, right: 0, alignItems: 'center' }}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
      </View>
    </>

  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 0

  },
  background: { flex: 1, backgroundColor: "#08041C" },
  container: {
    padding: 24,
  },
  backButton: { padding: 24 },
  backIcon: { fontSize: fontScale * scaleFont(24), color: "#fff" },
  title: {
    fontSize: fontScale * scaleFont(30),
    color: "#fff",
    fontFamily: "Manrope_700Bold",
    marginBottom: 10,
  },
  subtitle: { color: "#ccc", marginBottom: 20 },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 20,
  },
  otpBox: {
    width: 45,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    textAlign: "center",
    fontSize: fontScale * scaleFont(20),
  },
  resend: {
    color: "#fff",
    // marginTop: 10,
    textAlign: "center",
    fontFamily: "Manrope_400Regular",
  },
  button: {
    backgroundColor: "#393649",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 30,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: fontScale * scaleFont(20),
    fontFamily: "Manrope_600SemiBold",
  },
  toastContainer: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: "#222",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    zIndex: 999,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  toastOtpText: {
    color: "#fff",
    fontSize: fontScale * scaleFont(18),
    fontFamily: "Manrope_700Bold",
  },
  toastTimerText: {
    color: "#ccc",
    fontSize: fontScale * scaleFont(14),
    textAlign: "center",
    fontFamily: "Manrope_400Regular",
    marginTop: 4,
  },
});
