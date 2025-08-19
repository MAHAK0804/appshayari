/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
  PixelRatio,
  TouchableOpacity,
} from "react-native";
import { moderateScale, scale, scaleFont } from "./Responsive";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function ShayariSpotlightSlider({
  data = [],
  fetchNewShayaris,
}) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const cardRefs = useRef({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [latestShayaris, setLatestShayaris] = useState(data.slice(0, 3));


  // const handleShare = useCallback((item, ref) => {
  //   setSelectedShayari(item);
  //   setSelectedCardRef(ref);
  //   setCustomShareModalVisible(true);
  // }, []);

  const refreshShayaris = useCallback(async () => {
    // //console.log(fetchNewShayaris);

    try {
      if (typeof fetchNewShayaris === "function") {
        const newData = await fetchNewShayaris();
        // //console.log(newData);

        const topThree = newData.slice(0, 3);
        setLatestShayaris(topThree);
        setCurrentIndex(0);
        flatListRef.current?.scrollToIndex({ index: 0, animated: false });
      }
    } catch (err) {
      // console.error("Error fetching new shayaris:", err);
    }
  }, [fetchNewShayaris]);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (latestShayaris.length === 0) return;

      let nextIndex = currentIndex + 1;
      if (nextIndex >= latestShayaris.length) {
        refreshShayaris();
        return;
      }

      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, latestShayaris.length, refreshShayaris]);
  const navigation = useNavigation();

  // Handle scroll event manually to keep track of current index
  const onScrollEnd = useCallback((e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  }, []);

  const renderItem = ({ item }) => {
    const currentRef = cardRefs.current[item._id] || React.createRef();
    cardRefs.current[item._id] = currentRef;

    return (
      <TouchableOpacity onPress={(item) => {
        navigation.navigate("HomeStack", {
          screen: "ShayariFullView",
          params: {
            title: "Spotlight Shayari",
            shayariList: latestShayaris,
            shayari: item,
            initialIndex: latestShayaris.findIndex((s) => s._id === item._id),
          },
        })
      }} style={styles.card}>
        <Image
          source={require("./assets/spotlight.webp")}
          style={styles.bgImage}
        />
        <View style={styles.absoluteContent}>
          <Text style={styles.title}>Shayari Spotlight</Text>
          <View style={styles.captureArea} collapsable={false} ref={currentRef}>
            <Text style={styles.quote}>
              {(item.text || "").replace(/\\n/g, "\n")}
            </Text>
          </View>
          <View style={{ marginBottom: 11, marginRight: 12 }}>
            {/* <ShayariCardActions
              title="SpotLight Shayaris"
              shayari={item}
              filteredShayaris={latestShayaris}
              onShare={() => handleShare(item, currentRef)}
              isSpotlightScreen={true}
            /> */}
          </View>
        </View>

      </TouchableOpacity>
    );
  };


  if (!latestShayaris.length) return null;

  return (
    <View>
      <Animated.FlatList
        ref={flatListRef}
        data={latestShayaris}
        keyExtractor={(item) => item._id || item.id}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        renderItem={renderItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={onScrollEnd}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        showsHorizontalScrollIndicator={false}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {latestShayaris.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={i}
              style={[styles.dot, { opacity: dotOpacity }]}
            />
          );
        })}
      </View>

      {/* <CustomShareModal
        visible={customShareModalVisible}
        onClose={() => setCustomShareModalVisible(false)}
        cardRef={selectedCardRef}
        shayari={selectedShayari}
      /> */}
    </View>
  );
}

const fontScale = PixelRatio.getFontScale();
const baseFontSize = scaleFont(21);
const dynamicFontSize = baseFontSize * fontScale;
const dynamicCardHeight = dynamicFontSize * 12;

const styles = StyleSheet.create({
  card: {
    width: scale(335),
    // height: dynamicCardHeight,
    height: dynamicCardHeight,
    borderRadius: 18,
    // overflow: "hidden",
    // marginBottom: 10,
    marginHorizontal: 14,
  },

  bgImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
    borderRadius: 15,
    width: "100%",
    height: "100%",
  },
  captureArea: {
    flex: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  absoluteContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: fontScale * scaleFont(20),
    color: "#fff",
    marginBottom: 20,
    fontFamily: "Kameron_500Medium",
  },
  quote: {
    fontSize: dynamicFontSize,
    color: "#fff",
    lineHeight: dynamicFontSize * 1.4,
    textAlign: "center",
    fontFamily: "Kameron_500Medium",
    marginHorizontal: moderateScale(15),
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 4,
  },
});
