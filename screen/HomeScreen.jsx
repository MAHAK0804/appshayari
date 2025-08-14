/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useContext,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Modal,
  BackHandler,
  Platform,
  PermissionsAndroid,
  // Import BackHandler
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import axios from "axios";
import ShayariSpotlightSlider from "../SpotlightShayariSlider";
import { AuthContext } from "../AuthContext";
import SvgImageWithFallback from "../SvgImage";
import AllShayari from "../assets/allshayariicon.svg";
import MyShayari from "../assets/myshayariicon.svg";
import Fav from "../assets/favouriteicon.svg";
import { fontScale, moderateScale, scale, scaleFont } from "../Responsive";
import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { captureRef } from "react-native-view-shot";
// import * as Sharing from "expo-sharing";
// import * as MediaLibrary from "expo-media-library";
import Toast from "react-native-root-toast";
import NativeCard from "../NativeCardAds";
import EditIcon from "../assets/edit.svg";
import CopyIcon from "../assets/copy.svg";
import FavIcon from "../assets/favourite ( stroke ).svg";
import ShareIcon from "../assets/share.svg";
import TickIcon from "../assets/tick.svg";
import LikedIcon from "../assets/heart.svg";
import Gallery from "../assets/gallery.svg";
import DownloadGallery from "../assets/Download.svg";
import CrossXMark from "../assets/cross.svg";
import TextIcon from "../assets/text.svg";
import PostSlider from "../PostSlider";
import Clipboard from "@react-native-clipboard/clipboard";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import Share from "react-native-share";
import { AppContext } from "../AppContext";
const { width } = Dimensions.get("screen");
const numColumns = 3;
const cardSize = width / numColumns - 25;
const CARD_WIDTH = Dimensions.get("screen").width - scale(50);
const CARD_HEIGHT = Dimensions.get("screen").height - scale(550);
const bgColors = ["#364149", "#ffffff", "#393649", "#493645", "#213550"];

const HomeScreen = () => {
  const { updateActionStatus } = useContext(AppContext);

  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { userId, isLogin } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [spotlightShayaris, setSpotlightShayaris] = useState([]);
  const [shayaris, setShayaris] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const categoryTapCountRef = useRef(0);
  const [favorites, setFavorites] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [customShareModalVisible, setCustomShareModalVisible] = useState(false);
  const [selectedShayari, setSelectedShayari] = useState(null);
  const [selectedColors, setSelectedColors] = useState({ bg: "#fff" });
  const captureViewRef = useRef();
  const pageSize = 1000;


  // --- NEW STATE FOR EXIT POPUP ---
  const [exitModalVisible, setExitModalVisible] = useState(false);

  const [interstitialAds, setInterstitialAds] = useState(null);
  useEffect(() => {
    initInterstital();
  }, []);
  const initInterstital = async () => {
    const interstitialAd = InterstitialAd.createForAdRequest(
      TestIds.INTERSTITIAL,
    );
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
      await interstitialAds.show();
    }
  };

  const fetchShayaris = useCallback(
    async (pageNum) => {
      if (!hasMore || isFetchingMore) return;
      if (pageNum > 1) setIsFetchingMore(true);
      else setLoading(true);
      try {
        const res = await axios.get(
          `https://hindishayari.onrender.com/api/shayaris?page=${pageNum}&limit=${pageSize}`
        );
        const newShayaris = res.data.shayaris || [];
        setShayaris((prev) => (pageNum === 1 ? newShayaris : [...prev, ...newShayaris]));
        setHasMore(newShayaris.length === pageSize);
        setPage(pageNum);
      } catch (error) {
        console.log("Error fetching shayaris ->", error);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    },
    [hasMore, isFetchingMore]
  );
  console.log("shayar", shayaris.length);

  const getSpotlightShayaris = useCallback(async () => {
    try {
      const res = await axios.get("https://hindishayari.onrender.com/api/shayaris/");
      const spotlightData = res.data.shayaris.sort(() => 0.5 - Math.random()).slice(0, 3);
      setSpotlightShayaris(spotlightData);
    } catch (error) {
      console.error("Error fetching spotlight shayaris:", error);
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      (async () => {
        const res = await axios.get("https://hindishayari.onrender.com/api/categories/");
        setCategories(res.data.reverse());
      })(),
      getSpotlightShayaris(),
    ]);
    await fetchShayaris(1);
    setLoading(false);
  }, [fetchShayaris, getSpotlightShayaris]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const loadMoreShayaris = () => {
    // showRewardAd();
    if (!isFetchingMore) {
      fetchShayaris(page + 1);
    }
  };

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      setFavorites(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.log("Failed to load favorites", e);
    }
  };

  const saveFavorites = async (updatedFavorites) => {
    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.log("Failed to save favorites", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  // --- NEW BackHandler logic using useFocusEffect ---
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setExitModalVisible(true);
        return true; // This prevents the default back button behavior
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => backHandler.remove();
    }, [])
  );
  // --------------------------------------------------

  const toggleFavorite = useCallback(
    (shayari) => {
      const isFav = favorites.some((item) => item._id === shayari._id);
      const updated = isFav
        ? favorites.filter((item) => item._id !== shayari._id)
        : [...favorites, shayari];
      saveFavorites(updated);
      Toast.show(isFav ? "Removed from Favorites" : "Added to Favorites", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    },
    [favorites]
  );

  const handleCopy = useCallback((item) => {
    Clipboard.setString(item.text?.replace(/\\n/g, "\n") || "");
    setCopiedId(item._id);
    Toast.show("Copied to Clipboard!!", { position: Toast.positions.TOP })
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleEdit = useCallback(
    (item) => {
      navigation.navigate("HomeStack", {
        screen: "ShayariEditScreen",
        params: { shayari: item },
      });
    },
    [navigation]
  );

  const handleShare = useCallback((item, _, index) => {
    const bg = bgColors[index % bgColors.length];
    setSelectedShayari(item);
    setSelectedColors({ bg });
    setCustomShareModalVisible(true);
  }, []);

  const shareAsImage = async () => {
    if (!captureViewRef.current) return;
    try {
      updateActionStatus(true)

      const uri = await captureRef(captureViewRef.current, {
        format: "png",
        quality: 1,
      });

      await Share.open({
        url: uri,
        message: "Check out this Shayari!",
        title: "Share Shayari Image",
      });
    } catch (error) {
      console.error("Failed to share image", error);
      Toast.show("Failed to share as image.");
    } finally {
      setCustomShareModalVisible(false);
      updateActionStatus(false)
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

      const uri = await captureRef(captureViewRef.current, {
        format: 'png',
        quality: 1,
      });

      await CameraRoll.save(uri, { type: 'photo' });
      Toast.show('Image saved to gallery!');
      setCustomShareModalVisible(false)
    } catch (error) {
      console.error('Error saving image:', error);
      Toast.show('Failed to save image.');
    }
  };
  const handleExpand = (title, shayari, filteredShayaris) => {
    (async () => {
      try {
        const res = await axios.get(`https://hindishayari.onrender.com/api/shayaris`);
        const fetchedShayaris = res.data.shayaris;

        return navigation.navigate("HomeStack", {
          screen: "ShayariFullView",
          params: {
            title,
            shayariList: fetchedShayaris,
            shayari,
            initialIndex: fetchedShayaris.findIndex((s) => s._id === shayari._id),
          },
        });

      } catch (error) {
        console.error("SplashScreen: Error fetching shayaris ->", error);
      }
    })();

  };

  const quickLinks = useMemo(
    () => [
      { icon: AllShayari, title: "All Shayari", type: "all", route: "Allshayaris" },
      { icon: MyShayari, title: "My Shayari", type: "mine", route: "MyShayari" },
      { icon: Fav, title: "Favourites", type: "favorites", route: "Favourite" },
    ],
    []
  );

  const renderCategory = useCallback(
    ({ item }) => (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={() => {
            categoryTapCountRef.current++;
            // if (categoryTapCountRef.current % 3 === 0) showInterstitialAd();
            navigation.navigate("Shayari", {
              type: "category",
              title: item.title,
              categoryId: item._id,
            });
          }}
        >
          <SvgImageWithFallback uri={item.iconUrl} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
    ),
    [navigation, theme.card, theme.text]
  );

  const ShayariCard = React.memo(({ item, index }) => {
    console.log("most ", item);

    const backgroundColor = bgColors[index % bgColors.length];
    const textColor = backgroundColor === "#ffffff" ? "#111" : "#fff";
    const isFavorite = favorites.some((fav) => fav._id === item._id);
    const isCopied = copiedId === item._id;
    return (
      <TouchableOpacity onPress={() => handleExpand("Most Loved Shaayris", item, shayaris)}>

        <View style={[styles.shayariCard, { backgroundColor }]}>
          <View style={styles.textWrapper}>
            <Text style={[styles.shayariText, { color: textColor }]}>
              {item.text.replace(/\\n/g, "\n")}
            </Text>
          </View>
          <View style={styles.iconBar}>
            <TouchableOpacity onPress={() => handleCopy(item)}>
              {isCopied ? (
                <TickIcon width={40} height={40} fill={textColor} />
              ) : (
                <CopyIcon width={40} height={40} fill={textColor} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEdit(item)}>
              <EditIcon width={40} height={40} fill={textColor} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleFavorite(item)}>
              {isFavorite ? (
                <LikedIcon width={40} height={45} fill="#E91E63" />
              ) : (
                <FavIcon width={40} height={40} fill={textColor} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleShare(item, null, index)}>
              <ShareIcon width={40} height={40} fill={textColor} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  });
  console.log(userId);

  const screenData = useMemo(() => {
    const data = [];
    if (categories.length > 0) {
      data.push({ type: "header", id: "header_cat", title: "Categories", route: "AllCategories" });
      data.push({ type: "categories", id: "cat_list", items: categories.slice(0, 9) });
    }
    data.push({ type: "writeBox", id: "write_box" });
    if (spotlightShayaris.length > 0) {
      data.push({ type: "spotlight", id: "spotlight_slider", items: spotlightShayaris });
    }
    data.push({ type: "quickLinks", id: "quick_links", items: quickLinks });
    if (userId) {
      data.push({ type: "postSlider", id: "post_slider" });
    }
    if (shayaris.length > 0) {
      data.push({ type: "header", id: "header_loved", title: "Most Loved Shayaris" });
    }
    shayaris.forEach((shayari, index) => {
      data.push({ type: "shayari", id: shayari._id, item: shayari, index: index });
      if ((index + 1) % 5 === 0) {
        data.push({ type: "ad", id: `ad_${index}` });
      }
      // if ((index + 1) % 12 === 0) {
      //   data.push({ type: "rewarded", id: `ad_${index}` });
      // }
    });
    return data;
  }, [categories, spotlightShayaris, quickLinks, userId, shayaris]);

  const renderItem = useCallback(
    ({ item }) => {
      switch (item.type) {
        case "header":
          return (
            <View style={styles.titleHeader}>
              <Text style={styles.titleText}>{item.title}</Text>
              {item.route && (
                <TouchableOpacity onPress={() => navigation.navigate(item.route)}>
                  <Text style={styles.viewAll}>View all</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        case "categories":
          return (
            <FlashList
              data={item.items}
              numColumns={3}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(cat) => cat._id}
              scrollEnabled={true}
              renderItem={renderCategory}
              estimatedItemSize={cardSize + 14}
            />
          );
        case "writeBox":
          return (
            <View style={styles.writeBox}>
              <Text style={styles.writeHeading}>लिखो अपनी कहानी, शायरी</Text>
              <Text style={styles.writeHeading}>की ज़ुबान में</Text>
              <TouchableOpacity
                style={styles.writeButton}
                onPress={async () => {
                  await showInterstitialAd;

                  return navigation.navigate(isLogin ? "Writeshayari" : "LoginScreen");
                }}
              >
                <View style={styles.iconWrapper}>
                  <Image source={require("../assets/pencil.png")} style={styles.pencilIcon} />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.buttonTitle} numberOfLines={1} ellipsizeMode="tail">
                    Write Your Own Shayari
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        case "spotlight":
          return <ShayariSpotlightSlider data={item.items} fetchNewShayaris={getSpotlightShayaris} />;
        case "quickLinks":
          return (
            <View style={[styles.quickLinksContainer, { backgroundColor: theme.card }]}>
              <FlatList
                data={quickLinks}
                keyExtractor={(link) => link.title}
                renderItem={({ item: linkItem }) => (
                  <TouchableOpacity
                    style={styles.quickRow}
                    onPress={() =>
                      navigation.navigate("Shayari", {
                        type: linkItem.type,
                        title: linkItem.title,
                      })
                    }
                  >
                    <View style={styles.quickIcon}>
                      <linkItem.icon width={scale(28)} height={scale(28)} />
                    </View>
                    <Text style={[styles.quickText, { color: theme.text }]}>{linkItem.title}</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.divider} />}
                scrollEnabled={false}
              />
            </View>
          );
        case "postSlider":
          return <PostSlider />;
        case "shayari":
          return <ShayariCard item={item.item} index={item.index} />;
        case "ad":
          return (
            <View style={{ width: "100%", alignItems: "center", marginVertical: 10 }}>
              <NativeCard />
            </View>
          );


        default:
          return null;
      }
    },
    [renderCategory, getSpotlightShayaris, theme.card, theme.text, quickLinks, navigation, isLogin]
  );

  if (loading && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4E47A7" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlashList
        data={screenData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={250}
        onEndReached={loadMoreShayaris}
        onEndReachedThreshold={0.7}
        ListFooterComponent={() =>
          isFetchingMore ? (
            <ActivityIndicator size="small" color="#999" style={{ marginVertical: 20 }} />
          ) : null
        }
        contentContainerStyle={{ paddingHorizontal: scale(10), paddingBottom: insets.bottom + 60 }}
      />

      {/* Banner Ad at the bottom */}
      <View style={{ position: "absolute", bottom: insets.bottom, left: 0, right: 0, alignItems: 'center' }}>
        <BannerAd
          unitId={TestIds.BANNER}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
      </View>

      {/* Share Modal */}
      {customShareModalVisible && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCustomShareModalVisible(false)}
              >
                <CrossXMark width={40} height={40} fill="#000" />
              </TouchableOpacity>
              <View style={{ position: "absolute", top: -9999, left: -9999 }} ref={captureViewRef} collapsable={false}>
                <View style={[styles.shayariCard, { backgroundColor: selectedColors.bg, height: CARD_HEIGHT, width: CARD_WIDTH - 13, justifyContent: 'center' }]}>
                  <Text style={[styles.shayariText, { color: selectedColors.bg === "#ffffff" ? "#111" : "#fff" }]}>
                    {selectedShayari?.text.replace(/\\n/g, "\n")}
                  </Text>
                </View>
              </View>
              <NativeCard />
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.shareButton} onPress={() => {
                  try {
                    updateActionStatus(true)
                    Share.open({ message: selectedShayari?.text.replace(/\\n/g, "\n") });
                  } catch (error) {
                    console.log(error);

                  }
                  finally {
                    updateActionStatus(false)
                    setCustomShareModalVisible(false);
                  }

                }}>
                  <TextIcon width={16} height={20} fill="#fff" />
                  <Text style={styles.shareButtonText}>Share Text</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton} onPress={shareAsImage}>
                  <Gallery width={16} height={20} fill="#fff" />
                  <Text style={styles.shareButtonText}>Share Image</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={saveToGallery}>
                <DownloadGallery width={16} height={20} fill="#fff" />
                <Text style={styles.shareButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* --- NEW EXIT MODAL --- */}
      <Modal visible={exitModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.exitModalContainer}>
            <Text style={styles.exitModalText}>Are you sure you want to exit the app?</Text>
            <View style={{ marginVertical: scale(10) }}>

              <NativeCard />
            </View>
            <View style={styles.exitModalButtonContainer}>
              <TouchableOpacity
                style={[styles.exitModalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setExitModalVisible(false)}
              >
                <Text style={styles.exitModalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.exitModalButton, { backgroundColor: "#08041C" }]}
                onPress={() => {
                  if (Platform.OS === "android") {
                    BackHandler.exitApp();
                    setTimeout(() => {
                      // Force terminate process
                      const RNExitApp = require('react-native-exit-app').default;
                      RNExitApp.exitApp();
                    }, 50);
                  }
                }}

              >
                <Text style={[styles.exitModalButtonText, { color: '#fff' }]}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* ----------------------- */}
    </View>
  );
};
export default React.memo(HomeScreen)

// STYLES (Original + Merged from ShayariFeedScreen)
const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1B1B1D" },
  section: { paddingHorizontal: moderateScale(4), paddingTop: 10 },
  titleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: moderateScale(10), marginBottom: moderateScale(16), marginTop: moderateScale(10) },
  titleText: { fontSize: fontScale * scaleFont(19), color: "#fff", fontFamily: "Manrope_700Bold" },
  viewAll: { color: "#FFFFFF", fontSize: fontScale * scaleFont(16), fontFamily: "Manrope_500Medium" },
  cardWrapper: { alignItems: "center", justifyContent: "center", margin: 7 },
  card: { width: cardSize, height: cardSize, borderRadius: 20, margin: 5, backgroundColor: "#2C273C", alignItems: "center", justifyContent: "center", elevation: 3 },
  title: { fontSize: fontScale * scaleFont(17), fontWeight: "500", textAlign: "center", marginTop: 4, maxWidth: cardSize, fontFamily: "Manrope_700Bold" },
  writeBox: { minHeight: scale(120), marginHorizontal: moderateScale(10), marginVertical: moderateScale(20), backgroundColor: "#1F2B35", paddingVertical: moderateScale(20), paddingHorizontal: moderateScale(10), borderRadius: moderateScale(16), alignItems: "center", justifyContent: "center" },
  writeHeading: { color: "#ffffff", fontSize: scaleFont(18), textAlign: "center", lineHeight: scaleFont(26), fontFamily: "Manrope_500Medium", paddingHorizontal: 10 },
  writeButton: { backgroundColor: "#fff", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: moderateScale(10), paddingHorizontal: moderateScale(10), width: width - 100, marginVertical: moderateScale(20), borderRadius: 20, elevation: 5 },
  iconWrapper: { width: scale(40), height: scale(40), backgroundColor: "#fff", borderRadius: 20, justifyContent: "center", alignItems: "center", elevation: 4 },
  pencilIcon: { width: scale(22), height: scale(22), resizeMode: "contain" },
  buttonTitle: { textAlign: "center", color: "#000", fontSize: fontScale * scaleFont(16), fontFamily: "Kameron_600SemiBold" },
  quickLinksContainer: { marginHorizontal: 16, borderRadius: 20, overflow: "hidden", marginVertical: 20 },
  quickRow: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 20 },
  quickIcon: { width: scale(30), height: scale(28), marginRight: 16, justifyContent: "center", alignItems: "center" },
  quickText: { fontSize: fontScale * scaleFont(17), fontFamily: "Kameron_600SemiBold" },
  divider: { height: 1, backgroundColor: "#FFFFFF", marginHorizontal: 20, opacity: 0.1 },
  shayariCard: { width: '100%', minHeight: CARD_HEIGHT, borderRadius: 16, marginVertical: 10, justifyContent: "space-between", alignItems: "center", overflow: "hidden" },
  textWrapper: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10 },
  shayariText: { fontSize: fontScale * scaleFont(20), lineHeight: fontScale * scaleFont(20) * 1.5, textAlign: "center", fontFamily: "Kameron_500Medium" },
  iconBar: { height: 58, width: "100%", backgroundColor: "#15202C", flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalBox: { width: '100%', backgroundColor: "#fff", borderRadius: 20, padding: 20, paddingTop: 30, alignItems: "center" },
  closeButton: { position: "absolute", top: 10, right: 10, padding: 6, zIndex: 10 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  shareButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#19173D", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 30, marginHorizontal: 5, justifyContent: "center", gap: 8 },
  saveButton: { marginTop: 10, paddingVertical: 10, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", backgroundColor: "#19173D", borderRadius: 30, width: '90%', justifyContent: "center", gap: 8 },
  shareButtonText: { color: "#fff", fontSize: fontScale * scaleFont(12), textAlign: "center", fontWeight: 'bold' },
  // --- NEW EXIT MODAL STYLES ---
  exitModalContainer: { width: 300, backgroundColor: "#fff", borderRadius: 10, padding: 20, alignItems: 'center' },
  exitModalText: { fontSize: 18, textAlign: 'center', marginBottom: 20, color: '#333' },
  exitModalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  exitModalButton: { flex: 1, padding: 12, borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
  exitModalButtonText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
});
