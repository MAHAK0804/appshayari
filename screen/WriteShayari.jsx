/* eslint-disable react-native/no-inline-styles */
import React, { useState, useRef, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  PermissionsAndroid,
  Alert,
  SafeAreaView,
} from "react-native";
import WhiteText from "../assets/text.svg";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Share from "react-native-share"
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { captureRef } from "react-native-view-shot";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-root-toast";
import axios from "axios";
import CustomAlert from "../CustomAlert";
import CopyIcon from "../assets/copy.svg";
import FavIcon from "../assets/favourite ( stroke ).svg";
import ShareIcon from "../assets/share.svg";
import TickIcon from "../assets/tick.svg";
import LikedIcon from "../assets/hearticon.svg";
import { AuthContext } from "../AuthContext";
import { fontScale, moderateScale, scale, scaleFont, verticalScale } from "../Responsive";
import NativeCard from "../NativeCardAds";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import Clipboard from "@react-native-clipboard/clipboard";
import { AppContext } from "../AppContext";

export default function WriteShayari({ route }) {
  const { shayari = {} } = route?.params || {};

  // const shayari = { _id: 554554542, text: "dhfvsnbdvsnb" };
  console.log(route.params);

  const navigation = useNavigation();
  const [fontSize] = useState(20);
  const [opacity] = useState(0.8);
  const [fontFamily] = useState("Kameron_400Regular");
  const [fontWeight] = useState("normal");
  const [fontStyle] = useState("normal");
  const [fontColor] = useState("#000");
  const [backgroundImage] = useState(
    require("../assets/fullscreenpage.png")
  );
  const [favorites, setFavorites] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const cardRef = useRef(null);
  const [backgroundColor] = useState(null);
  const [textAlign] = useState("center");
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // NEW STATES FOR EDITABLE SHAYARI
  const [shayariText, setShayariText] = useState(shayari?.text || "");

  const [isEditing, setIsEditing] = useState(false);
  const [placeholderText] = useState(
    "Tap here to write your shayari...\n\nExpress your thoughts,\nShare your feelings,\nCreate something beautiful."
  );
  const { updateActionStatus } = useContext(AppContext);

  const [customShareModalVisible, setCustomShareModalVisible] = useState(false);
  const [selectedCardRef, setSelectedCardRef] = useState(null);
  const { userId } = useContext(AuthContext);

  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setCustomAlertVisible(true);
  };

  const handleCardTap = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleTextSubmit = () => {
    setIsEditing(false);
    Keyboard.dismiss();
    if (shayariText.trim() === "") {
      setShayariText("");
    }
  };

  const handleShare = useCallback(() => {
    if (shayariText.trim() === "") {
      showCustomAlert(
        "Empty Shayari",
        "Please write something before sharing!"
      );
      return;
    }
    // setshowforSave(true);
    setSelectedCardRef(cardRef);
    setCustomShareModalVisible(true);
  }, [shayariText]);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      setFavorites(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.log("Failed to load favorites", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const saveFavorites = async (updatedFavorites) => {
    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.log("Failed to save favorites", error);
    }
  };

  const toggleFavorite = useCallback(() => {
    if (shayariText.trim() === "") {
      showCustomAlert(
        "Empty Shayari",
        "Please write something before adding to favorites!"
      );
      return;
    }

    const shayariObject = {
      _id: Date.now().toString(), // Generate unique ID
      text: shayariText,
      createdAt: new Date().toISOString(),
    };

    const isFav = favorites.some((item) => item.text === shayariText);
    const updated = isFav
      ? favorites.filter((item) => item.text !== shayariText)
      : [...favorites, shayariObject];

    saveFavorites(updated);

    Toast.show(isFav ? "Removed from Favorites" : "Added to Favorites", {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
    });
  }, [favorites, shayariText]);

  const isFav = favorites.some((item) => item.text === shayariText);

  const handleCopy = useCallback(() => {
    if (shayariText.trim() === "") {
      showCustomAlert(
        "Empty Shayari",
        "Please write something before copying!"
      );
      return;
    }

    Clipboard.setString(shayariText);
    setCopiedId("current");
    Toast.show("Copied to clipboard!", {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
    });
    setTimeout(() => setCopiedId(null), 2000);
  }, [shayariText]);

  const isCopied = copiedId === "current";

  const shareAsImage = async (uri) => {
    // if (!cardRef.current) return;
    try {
      updateActionStatus(true)

      // Toast.show(uri)
      console.log("uri", uri);

      await Share.open({ url: uri });
    } catch (error) {
      console.error("Failed to share image with text", error);
      Toast.show("Failed to share as image.");
    } finally {
      updateActionStatus(false)
    }
  };
  const saveToGallery = async () => {

    const uri = await captureRef(cardRef, { format: "png", quality: 1 });
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Storage permission denied');
        return;
      }


      try {
        await CameraRoll.saveAsset(uri, { type: 'photo' });
        console.log('Image saved to gallery!');
        Alert.alert("Image Save to Gallery")

      } catch (error) {
        console.log('Save error:', error);
      }
    };
  };

  const displayText =
    shayariText.trim() === "" ? shayari?.text || placeholderText : shayariText;

  const textOpacity = shayariText.trim() === "" ? 0.5 : opacity;
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <SafeAreaView style={[styles.safeArea, { paddingTop: verticalScale(20) }]}>

            <View style={styles.customHeader}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Home")}
                style={styles.headerIcon}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Write Your Shayari</Text>

              <TouchableOpacity
                onPress={async () => {
                  if (shayariText.trim() === "") {
                    showCustomAlert(
                      "Empty Shayari",
                      "Please write something before posting!"
                    );
                    return;
                  }

                  try {
                    if (shayari?._id) {
                      // 🔁 Update existing Shayari
                      await axios.put(
                        `https://hindishayari.onrender.com/api/users/shayaris/update/${shayari._id}`,
                        { userId, text: shayariText }
                      );
                      showCustomAlert("Updated", "Thank You! Your Shayari has been successfully saved in My Shayari.");
                    } else {
                      // 🆕 Post new Shayari
                      await axios.post(
                        "https://hindishayari.onrender.com/api/users/shayaris/add",
                        { userId, text: shayariText }
                      );
                      showCustomAlert("Posted", "Thank You! Your Shayari has been successfully saved in My Shayari.");
                    }

                    // ✅ Reset state and navigate
                    setIsEditing(false);
                    setShayariText("");
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{ name: "HomeScreen" }],
                      })
                    );

                  } catch (error) {
                    console.log("Shayari save error:", error);
                    showCustomAlert("Error", "Failed to save Shayari.");
                  }
                }}
                style={styles.headerIcon}
              >
                <TickIcon width={40} height={40} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Shayari Card Row */}
          <View style={styles.cardRow}>
            <View ref={cardRef} collapsable={false}>
              <CustomAlert
                visible={customAlertVisible}
                title={alertTitle}
                message={alertMessage}
                onClose={() => setCustomAlertVisible(false)}
              />

              <ImageBackground
                source={backgroundImage}
                imageStyle={styles.imageBorder}
                style={[
                  styles.backgroundCard,
                  backgroundColor && { backgroundColor },
                ]}
                resizeMode="cover"
              >
                <View style={styles.innerRow}>
                  {/* Shayari Text - Now Editable */}
                  <TouchableOpacity
                    style={styles.textWrapper}
                    onPress={handleCardTap}
                    activeOpacity={0.8}
                  >
                    {isEditing ? (
                      <TextInput
                        style={[
                          styles.shayariText,
                          styles.textInput,
                          {
                            fontSize,
                            opacity,
                            fontFamily,
                            fontWeight,
                            fontStyle,
                            color: fontColor,
                            textAlign,
                          },
                        ]}
                        value={shayariText}
                        onChangeText={setShayariText}
                        multiline={true}
                        placeholder="Write your shayari here..."
                        placeholderTextColor={`${fontColor}80`}
                        onBlur={handleTextSubmit}
                        autoFocus={true}
                        textAlignVertical="center"
                      />
                    ) : (
                      <Text
                        style={[
                          styles.shayariText,
                          {
                            fontSize,
                            opacity: textOpacity,
                            fontFamily,
                            fontWeight,
                            fontStyle,
                            color: fontColor,
                            textAlign,
                          },
                        ]}
                      >
                        {displayText}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </View>
          </View>

          {/* Share Modal */}
          {customShareModalVisible && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setCustomShareModalVisible(false)}
                >
                  <Ionicons name="close" size={22} color="#333" />
                </TouchableOpacity>

                {/* <View style={styles.previewBox} /> */}
                <NativeCard />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={() => {
                      try {
                        updateActionStatus(true)
                        Share.open({
                          message: shayariText.replace(/\\n/g, "\n"),
                        });
                      } catch (error) {
                        console.log(error);

                      }
                      finally {

                        setCustomShareModalVisible(false);
                        updateActionStatus(false)
                      }

                    }}
                  >
                    <WhiteText width={18} height={18} />
                    <Text style={styles.shareButtonText}>Share Text</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={captureAndShare}
                  >
                    <Ionicons
                      name="image-outline"
                      size={18}
                      color="#fff"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.shareButtonText}>Share Image</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={saveToGallery}>
                  <Ionicons
                    name="download-outline"
                    size={18}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.shareButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={{ marginBottom: 20 }}>
            <ImageBackground
              source={require("../assets/bgbottom.png")}
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
                padding: 10,
              }}
            >
              <TouchableOpacity onPress={handleCopy}>
                {isCopied ? (
                  <TickIcon width={40} height={40} fill="#000" />
                ) : (
                  <CopyIcon width={40} height={40} fill="#000" />
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleShare}>
                <ShareIcon width={40} height={40} fill="#000" />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleFavorite}>
                {isFav ? (
                  <LikedIcon width={40} height={40} fill="#000" />
                ) : (
                  <FavIcon width={40} height={40} fill="#000" />
                )}
              </TouchableOpacity>
            </ImageBackground>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

const styles = StyleSheet.create({
  safeArea: {
    flex: 0,
  },
  container: { flex: 1, backgroundColor: "#000" },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // paddingVertical: verticalScale(10),
    elevation: 4,
    paddingHorizontal: 10,
    backgroundColor: "#191734",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },

  headerIcon: {
    padding: 8,
  },

  headerTitle: {
    fontSize: fontScale * scaleFont(18),
    fontWeight: "600",
    color: "#fff",
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  backgroundCard: {
    width: 420,
    height: SCREEN_HEIGHT - verticalScale(220),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imageBorder: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    resizeMode: "cover",
  },
  innerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },

  textWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  shayariText: {
    textAlign: "center",
    lineHeight: 23,
    color: "#fff",
    width: "100%",
    padding: 10,
  },
  textInput: {
    minHeight: 200,
    textAlignVertical: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

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
  previewBox: {
    width: "100%",
    height: 140,
    backgroundColor: "#ddd",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#19173D",
    paddingVertical: 10,
    paddingHorizontal: 16,
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
    fontSize: fontScale * scaleFont(14),
    fontWeight: "600",
  },
});
