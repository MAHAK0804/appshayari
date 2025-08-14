/* eslint-disable react-native/no-inline-styles */
import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, PermissionsAndroid, Alert } from "react-native";
import TextIcon from "./assets/text.svg";
import { captureRef } from "react-native-view-shot";
import { fontScale, moderateScale, scale, scaleFont } from "./Responsive";
import Gallery from "./assets/gallery.svg";
import DownloadGallery from "./assets/Download.svg";
import CrossXMark from "./assets/cross.svg";
import NativeCard from "./NativeCardAds";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import Toast from "react-native-root-toast";
import Share from 'react-native-share';
import { AppContext } from "./AppContext";

export default function CustomShareModal({
  visible,
  onClose,
  cardRef,
  shayari,
}) {
  console.log("shayari", shayari);
  const { updateActionStatus } = useContext(AppContext);

  if (!visible) return null;

  const shareAsImage = async (uri) => {
    // if (!cardRef.current) return;

    try {

      // Toast.show(uri)
      console.log("uri", uri);
      updateActionStatus(true)
      await Share.open({ url: uri });
    } catch (error) {
      console.error("Failed to share image with text", error);
      Toast.show("Failed to share as image.");
    }
    finally {
      updateActionStatus(false);
    }
  };
  const saveToGallery = async () => {
    try {
      const permission = Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

      const hasPermission = await PermissionsAndroid.check(permission);

      if (!hasPermission) {
        const result = await PermissionsAndroid.request(permission);
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          Toast.show('Permission denied to save image.');
          return;
        }
      }

      const uri = await captureRef(cardRef.current, {
        format: 'png',
        quality: 1,
      });

      await CameraRoll.saveToCameraRoll(uri, { type: 'photo' });
      Toast.show('Image saved to gallery!');
    } catch (error) {
      console.error('Error saving image:', error);
      Toast.show('Failed to save image.');
    }
  };

  const captureAndShare = async () => {
    try {
      const uri = await captureRef(cardRef.current, {
        format: "png",
        quality: 1,
      });
      // Call the share function with the URI
      await shareAsImage(uri);
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  };
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalBox}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <CrossXMark width={40} height={40} fill="#000" />
        </TouchableOpacity>

        <NativeCard />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.shareButton, { gap: 7 }]}
            onPress={() => {
              try {
                updateActionStatus(true)
                Share.open({
                  message: shayari?.text.replace(/\\n/g, "\n"),
                });
              } catch (error) {
                console.log(error);

              } finally {
                onClose();

                updateActionStatus(false)
              }

            }}
          >
            <TextIcon width={16} height={20} fill="#000" />
            <Text style={styles.shareButtonText}>Share Text</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareButton, { gap: 7 }]}
            onPress={captureAndShare}
          >
            <Gallery width={16} height={20} fill="#000" />

            <Text style={styles.shareButtonText}>Share Image</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { gap: 7 }]}
          onPress={saveToGallery}
        >
          <DownloadGallery width={16} height={20} fill="#000" />

          <Text style={styles.shareButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
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
  modalBox: {
    // width: 300,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    paddingTop: 30,
    alignItems: "center",
    position: "relative",
    marginHorizontal: moderateScale(50),
  },
  closeButton: {
    position: "absolute",
    top: 4,
    right: 10,
    padding: 6,
    zIndex: 10,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    // width: "100%",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#19173D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  saveButton: {
    margin: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#19173D",
    borderRadius: 30,
    width: scale(250),
    justifyContent: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: fontScale * scaleFont(12),
    // fontWeight: "600",
    textAlign: "center",
  },
});
