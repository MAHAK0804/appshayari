/* eslint-disable react-native/no-inline-styles */
// import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useFormik } from "formik";
import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  NativeModules,
  // CheckBox,
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';

import * as Yup from "yup";
import { fontScale, scaleFont, verticalScale } from "../Responsive";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { AdConstants } = NativeModules;
  // //console.log("Ad ID:", JSON.stringify(AdConstants.BANNER_AD_UNIT_ID));

  const adUnitId = __DEV__ ? TestIds.BANNER : AdConstants.BANNER_AD_UNIT_ID
  const navigation = useNavigation();
  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "",
      agree: false,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      phone: Yup.string()
        .required("Email is required")
        .test(
          "is-valid-email",
          "Enter a valid email",
          function (value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            return emailRegex.test(value);
          }
        ),
      agree: Yup.bool().oneOf([true], "You must accept Terms & Conditions"),
    }),
    onSubmit: async (values) => {
      const { phone } = values;

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phone);

      try {
        let response;

        if (isEmail) {
          response = await axios.post(
            "https://hindishayari.onrender.com/api/users/auth/request-otp",
            {
              name: values.name,
              email: values.phone,
            }
          );

          Alert.alert("Otp is Sent To your mail Id");
          navigation.replace("VerifyOTPScreen", {
            name: values.name,
            email: values.phone,
          });
        }




        // //console.log("Login Response:", response.data);
      } catch (error) {
        // //console.log("Login Error ->", error.message);
        Alert.alert("Failed to send OTP. Please try again.");
      }
    },
  });

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
        <View style={styles.container}>
          <Text style={styles.title}>Login to Shayari App</Text>
          <Text
            style={{
              color: "#fff",
              paddingBottom: 10,
              fontFamily: "Manrope_600SemiBold",
              fontSize: fontScale * scaleFont(16),
            }}
          >
            Name
          </Text>
          <TextInput
            placeholder="Name*"
            placeholderTextColor="#ccc"
            value={formik.values.name}
            onChangeText={formik.handleChange("name")}
            onBlur={formik.handleBlur("name")}
            style={styles.input}
          />
          {formik.touched.name && formik.errors.name && (
            <Text style={styles.errorText}>{formik.errors.name}</Text>
          )}
          <Text
            style={{
              color: "#fff",
              paddingBottom: 10,
              fontFamily: "Manrope_600SemiBold",
              fontSize: fontScale * scaleFont(16),
            }}
          >
            E-mail ID
          </Text>
          <TextInput
            placeholder="E-mail ID*"
            placeholderTextColor="#ccc"
            value={formik.values.phone}
            onChangeText={formik.handleChange("phone")}
            onBlur={formik.handleBlur("phone")}
            style={styles.input}
          />
          {formik.touched.phone && formik.errors.phone && (
            <Text style={styles.errorText}>{formik.errors.phone}</Text>
          )}

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              onPress={() => formik.setFieldValue("agree", !formik.values.agree)}
              style={styles.checkboxBox}
            >
              {formik.values.agree && (
                <Ionicons name="checkmark" size={18} color="#000" />
              )}
            </TouchableOpacity>

            <Text style={styles.checkboxLabel}>
              I agree to the Terms & Conditions
            </Text>
          </View>
          {formik.touched.agree && formik.errors.agree && (
            <Text style={styles.errorText}>{formik.errors.agree}</Text>
          )}

          <TouchableOpacity style={styles.button} onPress={formik.handleSubmit}>
            <Text style={styles.buttonText}>Generate Code</Text>
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
    flex: 0,
  },
  background: { flex: 1, backgroundColor: "#08041C" },
  container: { paddingHorizontal: 24, paddingVertical: 20 },
  backButton: { padding: 24, },
  backIcon: { fontSize: fontScale * scaleFont(34), color: "#fff" },
  title: {
    fontSize: fontScale * scaleFont(30),
    color: "#fff",
    marginBottom: 20,
    fontFamily: "Manrope_700Bold",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    marginLeft: 5,
    fontSize: fontScale * scaleFont(12),
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#393649",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: fontScale * scaleFont(20),
    fontFamily: "Manrope_600SemiBold",
  },

  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxLabel: {
    color: "#fff",
    marginLeft: 10,
    fontSize: fontScale * scaleFont(14),
    fontFamily: "Manrope_500Medium",
  },
});
