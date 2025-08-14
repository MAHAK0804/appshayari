/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useRef, useCallback, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from "react-native";

import Feather from 'react-native-vector-icons/Feather';

// Corrected import for Slider
import Slider from "@react-native-community/slider";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
// import HSVColorPicker from 'react-native-hsv-color-picker';
import ColorPicker from 'react-native-wheel-color-picker';


import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "../CustomAlert";
import TextIcon from "../assets/blacktext.svg";
import WhiteShareIcon from "../assets/share.svg";
import BackArrow from "../assets/left arrow.svg";

import CustomShareModal from "../CustomShareModal";
import { fontScale, moderateScale, scale, scaleFont, verticalScale } from "../Responsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { launchImageLibrary } from "react-native-image-picker";
import { AppContext } from "../AppContext";
import axios from "axios";
import FastImage from "react-native-fast-image";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
// Adjusted CARD_HEIGHT to take up more vertical space,
// allowing more room for the shayari and preventing cutting.
// This value can be fine-tuned further if needed based on device testing.
const CARD_WIDTH = SCREEN_WIDTH - 20; // Increased padding on sides for better look
const CARD_HEIGHT = SCREEN_HEIGHT * 0.6; // Increased from 0.479 to 0.6 for more height

export default function ShayariCardExact({ route }) {
  const [fontSize, setFontSize] = useState(23);
  const [opacity, setOpacity] = useState(1);
  const [fontFamily, setFontFamily] = useState("Kameron_600SemiBold");
  const [fontWeight, setFontWeight] = useState("normal"); // 'normal' or 'bold'
  const [fontStyle, setFontStyle] = useState("normal"); // 'normal' or 'italic'
  const [showFontOptions, setShowFontOptions] = useState(false);
  const [showStyleOptions, setShowStyleOptions] = useState(false);
  const [fontColor, setFontColor] = useState("#000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(require("../assets/image_1.webp"))

  // const DEFAULT_BG = { uri: "https://shayaripoetry.s3.ap-south-1.amazonaws.com/bgImages/image_1.webp" }
  const [favorites, setFavorites] = useState([]);
  const cardRef = useRef(null);
  const [showforSave, setshowforSave] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState(null);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [textAlign, setTextAlign] = useState("center");
  const [textAlign2, setTextAlign2] = useState("align-center");

  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setCustomAlertVisible(true);
  };
  const [customShareModalVisible, setCustomShareModalVisible] = useState(false);
  const [selectedCardRef, setSelectedCardRef] = useState(null);
  const [selectedShayari, setSelectedShayari] = useState(null);
  const shayari = route.params.shayari.text.replace(/\\n/g, "\n");
  const handleShare = useCallback((item) => {
    setshowforSave(false);
    setShowFontOptions(false);
    setShowStyleOptions(false)
    setShowBgPicker(false);
    setShowBgColorPicker(false);
    setShowColorPicker(false);

    setSelectedShayari(item);
    setSelectedCardRef(cardRef);
    setCustomShareModalVisible(true);
  }, []);
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();
  const { updateActionStatus } = useContext(AppContext);
  useEffect(() => {
    if (customAlertVisible) {
      setshowforSave(true);
      return;
    }
  }, [customAlertVisible]);
  const pickImageFromGallery = async () => {
    try {
      updateActionStatus(true)


      const options = {
        mediaType: 'photo',
        includeBase64: false,
      };

      launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else {
          const selectedImage = { uri: response.assets[0].uri };
          console.log("selected2", selectedImage);

          setBackgroundImage(selectedImage);
          setBackgroundColor(null);
          setShowBgPicker(false);
        }
      });
    } catch (error) {
      console.log(error);

    }
    finally {
      updateActionStatus(false)
    }
  };


  const menuItems = [
    { id: "1", name: "Fonts", iconName: "type", type: "image" },
    { id: "2", name: "Styles", iconName: "italic", type: "icon" },
    { id: "3", name: "Font color", type: "color", color: "#088A86" },
    { id: "4", name: "Background", type: "background", iconName: "image" },
    { id: "5", name: "Background color", type: "color", color: "#ff8b8b6a" },
    { id: "6", name: "Font align", iconName: "align-center", type: "align" },
  ];
  const fonts = [
    { name: "serif", label: "Serif" },
    { name: "monospace", label: "Monospace" },
    { name: "sans-serif", label: "Sans-serif" },
    { name: "Manrope_600SemiBold", label: "Manrope" },
    { name: "Kameron_600SemiBold", label: "Kameron" },
    { name: "sans-serif", label: " Sans Serif" },
    { name: "sans-serif-light", label: "Sans Serif Light" },
    { name: "sans-serif-medium", label: "Sans Serif Medium" },
    { name: "sans-serif-black", label: "Sans Serif Black" },
    { name: "sans-serif-condensed", label: "Sans Serif Condensed" },
    { name: "cursive", label: "Cursive" },
    { name: "casual", label: "Casual" },
  ];
  const [isActive, setisActive] = useState(null);
  // const [bgImages, setBgImages] = useState([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   fetchBackgroundImages();
  // }, []);
  // const fetchBackgroundImages = async () => {
  //   try {
  //     const res = await axios.get("https://hindishayari.onrender.com/api/bg-images"); // Replace with your endpoint
  //     console.log(res.data);

  //     setBgImages(res.data); // Assuming data is an array of image URLs
  //   } catch (err) {
  //     console.error("Error fetching background images:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // const preloadImages = (urls) => {
  //   urls.forEach((url) => Image.prefetch(url));
  // };
  // useEffect(() => {
  //   if (bgImages.length > 0) preloadImages(bgImages);
  // }, [bgImages]);

  // if (loading) {
  //   return <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />;
  // }
  // const bgImages = 
  const handleItemPress = (itemName) => {
    setShowFontOptions(false);
    setShowStyleOptions(false);
    setShowColorPicker(false);
    setShowBgPicker(false);
    setShowBgColorPicker(false);
    setisActive(prev => prev === itemName ? null : itemName);

    if (itemName === "Fonts") {

      setShowFontOptions(!showFontOptions);
    } else if (itemName === "Styles") {


      setShowStyleOptions(!showStyleOptions);
    } else if (itemName === "Font color") {


      setShowColorPicker(!showColorPicker);
    } else if (itemName === "Background") {


      setShowBgPicker(!showBgPicker);
    } else if (itemName === "Background color") {


      setShowBgColorPicker(!showBgColorPicker);
    } else if (itemName === "Font align") {

      setisActive(null)
      toggleTextAlign();
    }
  };
  const toggleTextAlign = () => {
    setTextAlign((prevAlign) => {
      if (prevAlign === "left") { setTextAlign2("align-center"); return "center"; }
      if (prevAlign === "center") { setTextAlign2("align-right"); return "right" };
      if (prevAlign === "right") { setTextAlign2("align-left"); return "left" };

      // return "left";
    });
  };

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
  console.log("selected", route.params, selectedShayari);

  return (
    <>
      <SafeAreaView style={styles.safeArea}>

        <View style={styles.customHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconLeft}
          >
            <BackArrow width={40} height={40} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text
              numberOfLines={1}
              style={[styles.headerTitleText, { color: '#FFFFFF' }]}
            >
              Edit
            </Text>
          </View>
          <TouchableOpacity onPress={handleShare} style={{ marginRight: scale(7) }}>
            <WhiteShareIcon width={40} height={40} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <CustomAlert
        visible={customAlertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setCustomAlertVisible(false)}
      />
      <View style={styles.container}>
        {/* Shayari Card */}
        <View
          style={[
            styles.shayariCard, // Use the new style for the card
            backgroundColor && { backgroundColor },
            // { position: "absolute", top: -30 + insets.top, height: "70%" }
          ]}
          ref={cardRef}
          collapsable={false}
        >
          {/* Background Image with Opacity */}
          {backgroundImage && (
            <FastImage
              // key={backgroundImage?.uri}
              source={backgroundImage}
              style={[
                StyleSheet.absoluteFillObject,
                {
                  width: '100%', // Changed to 100% to fill the card
                  height: '100%', // Changed to 100% to fill the card
                  // resizeMode: "contain",
                  opacity: opacity,
                  borderRadius: 12,
                },
              ]}
            />
          )}

          {/* Foreground Content */}
          <View style={[styles.innerRow,]}>
            {/* Font Size Slider */}
            {!customShareModalVisible && (
              <View style={styles.sliderCard}>
                <View style={styles.sliderColumn}>
                  <Slider
                    style={styles.verticalSlider}
                    minimumValue={10}
                    maximumValue={30}
                    value={fontSize}
                    onValueChange={setFontSize}
                    minimumTrackTintColor="#000"
                    maximumTrackTintColor="#000"
                    thumbTintColor="#000"
                  />
                </View>
              </View>
            )}

            {/* Shayari Text */}
            <View style={styles.textWrapper}>
              <Text
                style={[
                  styles.shayariText,
                  {
                    fontSize,
                    fontFamily,
                    fontWeight,
                    fontStyle,
                    color: fontColor,
                    textAlign,
                    lineHeight: fontSize * 1.4,
                  },
                ]}
              >
                {shayari}
              </Text>
            </View>

            {/* Opacity Slider */}
            {!customShareModalVisible && (
              <View style={styles.sliderCard}>
                <View style={styles.sliderColumn}>
                  <Slider
                    style={styles.verticalSlider}
                    minimumValue={0}
                    maximumValue={1}
                    step={0.01}
                    value={opacity}
                    onValueChange={setOpacity}
                    minimumTrackTintColor="#000"
                    maximumTrackTintColor="#000"
                    thumbTintColor="#000"
                  />
                </View>
              </View>
            )}
          </View>

          {/* Font Family Selector */}


        </View>

        {/* Grid Menu */}
        <View style={[{

          width: "100%",
          position: "absolute",
          bottom: 60 + insets.bottom,
          // paddingHorizontal: 10,
        }, showColorPicker || showBgColorPicker ? { backgroundColor: "transparent" } : { backgroundColor: "#08041C" }]}>
          {/* Conditionally rendered sub-menus go here */}
          {showFontOptions && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.fontScrollViewAbsolute} // Using a new, non-absolute style
              contentContainerStyle={styles.fontScrollViewContent}
            >
              {fonts.map((font) => (
                <TouchableOpacity
                  key={font.name}
                  style={[
                    styles.fontItem,
                    fontFamily === font.name && styles.fontItemSelected,
                  ]}
                  onPress={() => setFontFamily(font.name)}
                >
                  <Text
                    style={{
                      fontFamily: font.name,
                      fontSize: fontScale * scaleFont(15),
                      color: fontFamily === font.name ? "#000" : "#fff",
                    }}
                  >
                    {font.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          {showStyleOptions && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.fontScrollViewAbsolute}
              contentContainerStyle={styles.fontScrollViewContent}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  // marginTop: 10,
                  // paddingVertical: 5,
                }}
              >
                {/* Regular */}
                <TouchableOpacity
                  style={[
                    styles.fontItem,
                    fontWeight === "normal" &&
                    fontStyle === "normal" &&
                    styles.fontItemSelected,
                  ]}
                  onPress={() => {
                    setFontWeight("normal");
                    setFontStyle("normal");
                  }}
                >
                  <Text
                    style={{
                      fontSize: fontScale * scaleFont(14),
                      color:
                        fontWeight === "normal" && fontStyle === "normal"
                          ? "#000"
                          : "#fff",
                    }}
                  >
                    Regular
                  </Text>
                </TouchableOpacity>

                {/* Bold */}
                <TouchableOpacity
                  style={[
                    styles.fontItem,
                    fontWeight === "bold" && styles.fontItemSelected,
                  ]}
                  onPress={() => {
                    setFontWeight("bold");
                    setFontStyle("normal");
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: fontScale * scaleFont(14),
                      color: fontWeight === "bold" ? "#000" : "#fff",
                    }}
                  >
                    Bold
                  </Text>
                </TouchableOpacity>

                {/* Italic */}
                <TouchableOpacity
                  style={[
                    styles.fontItem,
                    fontStyle === "italic" && styles.fontItemSelected,
                  ]}
                  onPress={() => {
                    setFontStyle("italic");
                    setFontWeight("normal");
                  }}
                >
                  <Text
                    style={{
                      fontStyle: "italic",
                      fontSize: fontScale * scaleFont(14),
                      color: fontStyle === "italic" ? "#000" : "#fff",
                    }}
                  >
                    Italic
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
          {showColorPicker && (
            <View style={styles.colorPickerContainer}>
              <ColorPicker
                color={fontColor}
                onColorChange={color => setFontColor(color)}
                style={{ width: '100%' }}
              />
            </View>
          )}
          {showBgPicker && (
            <View style={styles.bgPickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {/* Upload from gallery option */}
                <TouchableOpacity
                  onPress={pickImageFromGallery}
                  style={{
                    width: 80,
                    height: 80,
                    paddingRight: 5,
                    marginRight: 10,
                    justifyContent: "center",
                    alignItems: "center",

                  }}
                >
                  <View style={{ width: 80, height: 80 }}>
                    <Image source={require('../assets/upload.png')} style={{ width: "100%", height: "100%" }} />
                  </View>
                </TouchableOpacity>

                {/* Predefined background images */}
                {[require("../assets/bg1.webp"),
                require("../assets/bg2.webp"),
                require("../assets/bg3.webp"),
                require("../assets/bg4.webp"),
                require("../assets/bg5.webp"), require("../assets/bg6.webp"), require("../assets/bg7.webp"), require("../assets/bg8.webp"), require("../assets/bg9.webp"), require("../assets/bg10.webp"), require("../assets/bg11.webp"), require("../assets/bg12.webp"), require("../assets/bg13.webp"), require("../assets/bg14.webp"), require("../assets/bg16.webp"), require("../assets/bg17.webp"), require("../assets/bg18.webp"), require("../assets/bg19.webp"), require("../assets/bg20.webp"), require("../assets/bg21.webp"), require("../assets/bg22.webp"), require("../assets/bg24.webp"), require("../assets/bg25.webp"), require("../assets/bg26.webp"), require("../assets/bg27.webp"), require("../assets/bg28.webp"), require("../assets/bg29.webp"), require("../assets/bg31.webp"), require("../assets/bg32.webp")].map((img, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setBackgroundImage(img);
                        setBackgroundColor(null);
                      }}
                      style={styles.bgImageOption}
                    >
                      <FastImage
                        source={img}
                        style={{
                          width: 80,
                          height: 80,
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </View>
          )}

          {showBgColorPicker && (
            <View style={styles.colorPickerContainer}>
              <ColorPicker
                color={backgroundColor}
                onColorChange={color => {
                  setBackgroundColor(color);
                  setBackgroundImage(null);
                }}
                style={{ width: '100%' }}
              />
            </View>
          )}
          <View style={{
            backgroundColor: "#08041C",
            width: "100%",
            // position: "absolute",
            // bottom: 65 + insets.bottom,
            paddingHorizontal: 10,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}>


            {menuItems.map((item) => (
              <View style={styles.gridItem} key={item.id}>
                <TouchableOpacity
                  onPress={() => handleItemPress(item.name)}
                >
                  <View style={[styles.iconWrapper, isActive === item.name ? { borderWidth: 2, borderColor: "#fff", backgroundColor: "rgba(255,255,255,0.5)" } : { borderWidth: 0 }]}>
                    {item.type === "icon" && (
                      <Feather name={item.iconName} size={23} color="#000" />
                    )}
                    {item.type === "align" && (

                      <Feather name={textAlign2} size={23} color="#000" />
                    )}
                    {item.type === "image" && (
                      <TextIcon width={22} height={20} fill="#000" />
                    )}
                    {item.type === "color" && (
                      <View
                        style={[styles.colorBox, { backgroundColor: item.color }]}
                      />
                    )}
                    {item.type === "background" && (
                      <ImageBackground
                        source={require("../assets/image_5.webp")}
                        style={[styles.backgroundPreview, showBgPicker && { opacity: 0.9 }]}
                        imageStyle={{ borderRadius: 15 }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
                <Text
                  style={styles.itemText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <CustomShareModal
          visible={customShareModalVisible}
          onClose={() => setCustomShareModalVisible(false)}
          cardRef={selectedCardRef}
          shayari={route.params.shayari}
        />
      </View>

      {/* Banner Ad */}
      <View style={{ position: "absolute", bottom: insets.bottom, left: 0, right: 0, alignItems: 'center', backgroundColor: "#08041C" }}>
        <BannerAd
          unitId={TestIds.BANNER}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: 'center', // Center content horizontally
    justifyContent: 'flex-start', // Align content to the top
    paddingHorizontal: 10, // Added padding to the main container
    paddingTop: 10, // Added padding from the top
  },
  safeArea: {
    flex: 0,
    backgroundColor: "#191734",
  },
  customHeader: {
    backgroundColor: "#191734",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(10),
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(20),
    elevation: 4,
  },
  iconLeft: {},
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 10,
  },
  headerTitleText: {
    fontSize: fontScale * scaleFont(18),
    textAlign: "start",
    fontFamily: "Manrope_400Regular",
  },
  shayariCard: {
    // flex: 1,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden', // Ensures content respects border radius
    // marginBottom: 20, // Space between card and grid menu
    // paddingTop: verticalScale(30)
  },
  innerRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    // height: "100%", // This now takes the full height of the CARD_HEIGHT
  },
  sliderCard: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  sliderColumn: {
    height: "10%", // Keep this as a small portion relative to its parent (sliderCard)
    justifyContent: "space-between",
    alignItems: "center",
  },
  verticalLabel: {
    transform: [{ rotate: "-90deg" }],
    fontSize: fontScale * scaleFont(16),
    fontWeight: "700",
    color: "#444",
  },
  sliderValue: {
    fontSize: fontScale * scaleFont(12),
    fontWeight: "600",
    color: "#444",
  },
  verticalSlider: {
    transform: [{ rotate: "-90deg" }],
    width: SCREEN_HEIGHT * 0.35,
    // height: 40,
  },
  opacityPreview: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#bbb",
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
    color: "#fff",
    width: "100%",
    padding: 10,
  },
  // gridContainer: {
  //   flexDirection: "row",
  //   flexWrap: "wrap",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   width: "100%",
  //   paddingHorizontal: 10,
  //   position: "absolute", // Position it absolutely
  //   bottom: 50 + insets.bottom, // Dynamically set the bottom position 50px above the ad
  // },
  gridItem: {
    width: "33.33%", // Adjust width to fit 3 items per row
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(20), // Adds vertical space between rows
  },
  fontScrollView: {
    marginTop: 10,
  },
  iconWrapper: {
    width: 62,
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#262237",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 8,
    overflow: "hidden",
  },
  colorBox: {
    padding: moderateScale(50),
  },
  backgroundPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  itemText: {
    fontSize: fontScale * scaleFont(13),
    color: "#fff",
    textAlign: "center",
  },
  fontScrollViewAbsolute: {

    maxHeight: 150, // Added a max height to prevent it from taking up too much space
    borderRadius: 10,
    // backgroundColor: 'rgba(0,0,0,0.7)',
    marginBottom: 10,
  },

  // Adjusted color picker container style
  colorPickerContainerNonAbsolute: {
    height: 250,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 10,
  },

  // Adjusted background picker container style
  bgPickerContainerNonAbsolute: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    marginBottom: 10,
  },

  fontScrollViewContent: {
    alignItems: "center",
    paddingHorizontal: 5,
  },
  fontItem: {
    marginVertical: verticalScale(8),
    paddingVertical: 3,
    paddingHorizontal: 15,
    // borderWidth: 1,
    // borderColor: "#fff",
    marginHorizontal: 5,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  fontItemSelected: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 15,
    color: "#fff",
    backgroundColor: "#fff",
  },
  colorPickerContainer: {
    height: 250,
    padding: 10,
    // backgroundColor: 'rgba(0,0,0,0.7)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 40,
  },
  bgPickerContainer: {
    padding: 10,
    // backgroundColor: 'rgba(0,0,0,0.7)',
    marginBottom: 10,
  },
  bgImageOption: {
    marginRight: 10,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#191734",
  },
  alertOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  alertBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },
  alertTitle: {
    fontSize: fontScale * scaleFont(18),
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222",
    textAlign: "center",
  },
  alertMessage: {
    fontSize: fontScale * scaleFont(15),
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  alertButton: {
    backgroundColor: "#08448A",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  alertButtonText: {
    color: "#fff",
    fontSize: fontScale * scaleFont(16),
    fontWeight: "bold",
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
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    paddingTop: 30,
    alignItems: "center",
    position: "relative",
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
    flex: 1,
    justifyContent: "center",
  },
  saveButton: {
    margin: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#19173D",
    borderRadius: 30,
    width: "100%",
    justifyContent: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: fontScale * scaleFont(14),
    fontWeight: "600",
  },
});