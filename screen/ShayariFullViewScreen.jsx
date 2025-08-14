/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Dimensions,
  ImageBackground,
  FlatList,
} from "react-native";
import Toast from "react-native-root-toast";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
} from "react-native-reanimated";

import CustomAlert from "../CustomAlert";
import TickIcon from "../assets/tick.svg";
import LikedIcon from "../assets/hearticon.svg";
import CustomShareModal from "../CustomShareModal";
import { fontScale, scale, scaleFont } from "../Responsive";
import WhiteCopyIcon from "../assets/copy.svg";
import WhiteFavIcon from "../assets/favourite ( stroke ).svg";
import WhiteEditIcon from "../assets/edit.svg";
import WhiteShareIcon from "../assets/share.svg";
import HandIcon from "../assets/hand.svg"; // Assuming you have a hand SVG
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Clipboard from "@react-native-clipboard/clipboard";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");
const CARD_WIDTH = SCREEN_WIDTH;
const CARD_HEIGHT = SCREEN_HEIGHT - scale(240);

export default function ShayariFullViewScreen({ route }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  console.log("full view ", route.params.shayariList.length);

  const [favorites, setFavorites] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [customShareModalVisible, setCustomShareModalVisible] = useState(false);
  const [selectedShayari, setSelectedShayari] = useState(null);
  const [shayaris, setShaayris] = useState(null);
  const cardRef = useRef(null);
  const [isFav, setIsFav] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(true);
  const swipeIndicatorAnim = useSharedValue(0);

  const { shayariList, initialIndex } = route.params;
  console.log("index", initialIndex);

  const flatListRef = useRef(null);

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

  const handleShare = useCallback((item) => {
    setSelectedShayari(item);
    setCustomShareModalVisible(true);
  }, []);

  const handleCopy = async () => {
    if (!shayaris) return;
    Clipboard.setString(shayaris.text);
    setCopiedId(shayaris._id);
    setIsCopied(true);
    Toast.show("Copied to Clipboard!!", { position: Toast.positions.TOP })
    setTimeout(() => {
      setCopiedId(null);
      setIsCopied(false);
    }, 2000);
  };

  const toggleFavorite = async () => {
    if (!shayaris) return;
    const isAlreadyFav = favorites.some((fav) => fav._id === shayaris._id);
    const updatedFavorites = isAlreadyFav
      ? favorites.filter((fav) => fav._id !== shayaris._id)
      : [...favorites, shayaris];
    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
      setIsFav(!isAlreadyFav);
      Toast.show(
        isAlreadyFav ? "Removed from Favorites" : "Added to Favorites",
        {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        }
      );
    } catch (e) {
      console.error("Failed to update favorites", e);
    }
  };

  useEffect(() => {
    if (shayaris) {
      setIsCopied(copiedId === shayaris._id);
      const isAlreadyFav = favorites.some((fav) => fav._id === shayaris._id);
      setIsFav(isAlreadyFav);
    }
  }, [shayaris, favorites, copiedId]);

  // Run the swipe indicator animation continuously
  useEffect(() => {
    if (showSwipeIndicator && shayariList && shayariList.length > 1) {
      swipeIndicatorAnim.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 500 }), // Move the hand slightly left
          withTiming(0, { duration: 500 }) // Return to center
        ),
        -1, // -1 means infinite repeat
        true // reverse animation on each iteration
      );
    } else {
      swipeIndicatorAnim.value = 0; // Reset animation when hidden
    }
  }, [shayariList, showSwipeIndicator]);


  useEffect(() => {
    if (flatListRef.current && initialIndex >= 0) {
      setTimeout(() => {
        flatListRef.current.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      }, 100);
    }
  }, [initialIndex]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const currentShayari = viewableItems[0].item;
      setShaayris(currentShayari);
      setIsCopied(copiedId === currentShayari._id);
      const isAlreadyFav = favorites.some((fav) => fav._id === currentShayari._id);
      setIsFav(isAlreadyFav);
    }
  });

  const onScrollBeginDrag = () => {
    setShowSwipeIndicator(false);
  };

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: swipeIndicatorAnim.value }],
    };
  });

  return (
    <View style={styles.container}>
      <CustomAlert
        visible={customAlertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setCustomAlertVisible(false)}
      />
      <View style={[styles.cardRow, { flex: 1 }]}>
        <View ref={cardRef} collapsable={false}>
          <ImageBackground
            source={require("../assets/image_1.webp")}
            style={[

              { width: CARD_WIDTH, flex: 1 },
            ]}
            imageStyle={styles.imageBorder}
            resizeMode="cover"
          >
            <View style={styles.textWrapper}>
              <FlatList
                ref={flatListRef}
                data={shayariList}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                horizontal
                pagingEnabled
                onViewableItemsChanged={onViewableItemsChanged.current}
                onScrollBeginDrag={onScrollBeginDrag}
                getItemLayout={(data, index) => ({
                  length: CARD_WIDTH,
                  offset: CARD_WIDTH * index,
                  index,
                })}
                onScrollToIndexFailed={(info) => {
                  const wait = new Promise((resolve) => setTimeout(resolve, 500));
                  wait.then(() => {
                    flatListRef.current?.scrollToIndex({
                      index: info.index,
                      animated: true,
                    });
                  });
                }}
                viewabilityConfig={{
                  itemVisiblePercentThreshold: 50,
                }}
                renderItem={({ item }) => {
                  const shayari = item.text.replace(/\\n/g, "\n");
                  return (
                    <View
                      style={{
                        width: CARD_WIDTH,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.shayariText}>{shayari}</Text>
                    </View>
                  );
                }}
              />

            </View>
          </ImageBackground>
        </View>
      </View>

      {/* The new swipe indicator with a hand icon */}
      {showSwipeIndicator && (
        <View style={styles.swipeIndicatorContainer}>
          <Animated.View style={indicatorStyle}>
            <HandIcon width={50} height={50} style={{ color: '#000' }} />
          </Animated.View>
          <Text style={styles.swipeIndicatorText}>Swipe for more</Text>
        </View>
      )}

      <View style={[{
        width: "100%",
        position: "absolute", bottom: 60 + insets.bottom, flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 10,
        paddingHorizontal: 9,
        backgroundColor: "#191734",
        borderTopWidth: 0,
        // borderBottomLeftRadius: 20,
        // borderBottomRightRadius: 20,
      }]}>
        <TouchableOpacity onPress={handleCopy}>
          {isCopied ? (
            <TickIcon width={40} height={40} />
          ) : (
            <WhiteCopyIcon width={40} height={40} />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleFavorite}>
          {isFav ? (
            <LikedIcon width={40} height={40} />
          ) : (
            <WhiteFavIcon width={40} height={40} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (!shayaris) return;
            if (route.params.title === "My Post Shayari") {
              navigation.navigate("HomeStack", {
                screen: "Writeshayari",
                params: { shayari: shayaris },
              });
            } else {
              navigation.navigate("HomeStack", {
                screen: "ShayariEditScreen",
                params: { shayari: shayaris },
              });
            }
          }}
        >
          <WhiteEditIcon width={40} height={40} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleShare(shayaris)}>
          <WhiteShareIcon width={40} height={40} />
        </TouchableOpacity>
      </View>

      <CustomShareModal
        visible={customShareModalVisible}
        shayari={selectedShayari}
        onClose={() => setCustomShareModalVisible(false)}
        cardRef={cardRef}
      />
      <View style={{ position: 'absolute', bottom: insets.bottom, left: 0, right: 0, backgroundColor: "#000" }}>
        <BannerAd
          unitId={TestIds.BANNER}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
            networkExtras: {
              collapsible: "bottom",
            },
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  textWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
  },
  shayariText: {
    textAlign: "center",
    lineHeight: fontScale * scaleFont(22) * 1.4,
    color: "#000",
    fontSize: fontScale * scaleFont(22),
    fontFamily: "Kameron_700Bold",
    paddingHorizontal: scale(20),
  },
  actionsDark: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 9,
    backgroundColor: "#191734",
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  swipeIndicatorContainer: {
    position: "absolute",
    top: "60%",
    right: 20,
    alignSelf: "center",
    alignItems: "center",
    zIndex: 10,
  },
  swipeIndicator: {
    // These styles are no longer needed as we're using an SVG
  },
  swipeIndicatorText: {
    color: "#000",
    fontSize: fontScale * scaleFont(16),
    marginTop: 5,
  },
});