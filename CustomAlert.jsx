/* eslint-disable react-hooks/rules-of-hooks */
// components/CustomAlert.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PixelRatio,
} from "react-native";
import { scaleFont } from "./Responsive";
import { useNavigation } from "@react-navigation/native";

export default function CustomAlert({ visible, title, message, onClose }) {
  // //console.log(visible);

  if (!visible) return null;
  const navigation = useNavigation();
  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.button} onPress={() => {
          if (message === "Thank You! Your Shayari has been successfully saved in My Shayari.")
            navigation.navigate("Shayari", {
              type: "mine",
              title: "My Shayari",
            })
          onClose()
        }}>
          <Text style={styles.buttonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const fontScale = PixelRatio.getFontScale();
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  box: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },
  title: {
    fontSize: fontScale * scaleFont(18),
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: fontScale * scaleFont(15),
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#191734",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: fontScale * scaleFont(16),
    fontWeight: "bold",
  },
});
