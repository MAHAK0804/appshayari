/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useRef,
  useState,
  useEffect,
  memo,
  useContext,
} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { useNavigation } from "@react-navigation/native";

import { fontScale, scale, scaleFont } from "./Responsive";

const { width } = Dimensions.get("window");

const PostSlider = () => {
  const navigation = useNavigation();

  const [shayariList, setShayariList] = useState([]);
  const [setLikedIds] = useState([]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { userId } = useContext(AuthContext);
  // //console.log("post user", userId);

  useEffect(() => {
    const fetchShayaris = async () => {
      try {
        const res = await axios.get(
          "https://hindishayari.onrender.com/api/users/shayaris/all"
        );
        // //console.log("userId =>", userId);
        // res.data.forEach((el) => {
        //   //console.log("Comparing", el.userId?._id, "==", userId);
        // });


        setShayariList(res.data.filter((el) => el.userId._id === userId));
      } catch (error) {
        // //console.log("Error fetching shayaris ->", error);
      }
    };


    fetchShayaris();
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("favaorites");
        const favs = stored ? JSON.parse(stored) : [];
        setLikedIds(favs.map((item) => item._id));
      } catch (err) {
        // //console.log("Failed to load favorites", err);
      }
    })();
  }, []);

  // const toggleLike = useCallback(async (item) => {
  //   try {
  //     const stored = await AsyncStorage.getItem("favorites");
  //     let favorites = stored ? JSON.parse(stored) : [];
  //     const isLiked = favorites.some((s) => s._id === item._id);
  //     let updated = isLiked
  //       ? favorites.filter((s) => s._id !== item._id)
  //       : [...favorites, item];

  //     await AsyncStorage.setItem("favorites", JSON.stringify(updated));
  //     setLikedIds(updated.map((s) => s._id));

  //     Toast.show(isLiked ? "Removed from Favorites" : "Added to Favorites", {
  //       duration: Toast.durations.SHORT,
  //       position: Toast.positions.BOTTOM,
  //     });
  //   } catch (err) {
  //     //console.log("Toggle like failed", err);
  //   }
  // }, []);

  // const handleCopy = useCallback((item) => {
  //   Clipboard.setStringAsync(item.text);
  //   setCopiedId(item._id);
  //   Toast.show("Copied to clipboard!", {
  //     duration: Toast.durations.SHORT,
  //     position: Toast.positions.BOTTOM,
  //   });
  //   setTimeout(() => setCopiedId(null), 2000);
  // }, []);

  // const handleShare = useCallback(async (item) => {
  //   try {
  //     await Share.share({ message: item.text });
  //   } catch (error) {
  //     console.error("Share failed", error);
  //   }
  // }, []);
  // const handleEdit = (item) => {
  //   navigation.navigate("Writeshayari", {
  //     shayari: item,
  //   });
  // };
  const renderItem =
    ({ item, widthOverride }) => {
      // const isLiked = likedIds.includes(item._id);

      // const isCopied = copiedId === item._id;

      const cardStyle = [
        styles.postCard,
        { width: widthOverride || width / 2 - scale(30), marginHorizontal: scale(5) },
      ];
      // //console.log("shayri", postData);

      return (
        <TouchableOpacity onPress={() => {
          navigation.navigate("HomeStack", {
            screen: "ShayariFullView",
            params: {
              title: "My Post Shayari",
              shayariList: postData,
              shayari: item,
              initialIndex: postData.map((s) => s._id === item._id),
            },
          })
        }} style={cardStyle}>
          <Image
            source={require("./assets/mypostbg.webp")}
            style={styles.postBackground}
          />

          <View style={styles.postOverlay}>
            <View style={styles.textWrapper}>
              <Text style={styles.postText}>{item.text}</Text>
            </View>
            {/* <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => handleCopy(item)}>
                {isCopied ? (
                  <TickIcon width={22} height={20} fill="#000" />
                ) : (
                  <CopyIcon width={22} height={20 } fill="#000" />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <EditIcon width={22} height={20} fill="#000" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleLike(item)}>
                {isLiked ? (
                  <LikedIcon width={22} height={20} fill="#000" />
                ) : (
                  <FavIcon width={22} height={20} fill="#000" />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleShare(item)}>
                <ShareIcon width={22} height={20} fill="#000" />
              </TouchableOpacity>
            </View> */}
          </View>
        </TouchableOpacity>
      );
    }


  // if (!shayariList || shayariList.length === 0) {
  //   return null;
  // }

  const postData = shayariList;
  const length = postData.length;
  return (
    <View style={{ marginTop: 20, marginBottom: 25 }}>
      <View style={styles.postsHeader}>
        <Text style={styles.postsTitle}>My Posts</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Shayari", {
              type: "mine",
              title: "My Shayari",
            })
          }
        >
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>

      {/* 1 Post */}
      {length === 1 && (
        <View style={{ paddingHorizontal: 15 }}>
          {renderItem({ item: postData[0], widthOverride: width - scale(55) })}
        </View>
      )}

      {/* 2 Posts */}
      {length === 2 && (
        <View style={[styles.rowContainer, { paddingHorizontal: 15 }]}>
          {postData.map((item) => (
            <View key={item._id} style={{ flex: 1, marginHorizontal: 5 }}>
              {renderItem({ item })}
            </View>
          ))}
        </View>
      )}

      {/* 3 or More Posts */}
      {length >= 3 && (
        <>
          <Animated.FlatList
            data={postData}
            keyExtractor={(item) => item._id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={length === 3 ? width - 30 : width / 2 - 25 + 14}
            decelerationRate="fast"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            renderItem={({ item }) =>
              renderItem({
                item,
                widthOverride: length === 3 ? width - 30 : width / 2 - 25,
              })
            }
            contentContainerStyle={{ paddingHorizontal: 15 }}
          />

          <View style={styles.pagination}>
            {postData.map((_, i) => {
              const itemWidth = length === 3 ? width - 30 : width / 2 - 25 + 14;
              const inputRange = [
                (i - 1) * itemWidth,
                i * itemWidth,
                (i + 1) * itemWidth,
              ];
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: "clamp",
              });

              return (
                <Animated.View key={i} style={[styles.dot, { opacity }]} />
              );
            })}
          </View>
        </>
      )}
    </View>
  );
};

export default memo(PostSlider);

const styles = StyleSheet.create({
  postsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  postsTitle: {
    fontSize: fontScale * scaleFont(18),
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Manrope_700Bold",
  },
  viewAll: {
    color: "#FFFFFF",
    fontSize: fontScale * scaleFont(14),
    fontFamily: "Manrope_500Medium",
  },
  postCard: {
    height: 300,
    // marginHorizontal: 7,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  postBackground: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },
  postOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
  },
  textWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  postText: {
    fontSize: fontScale * scaleFont(16),
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
    fontFamily: "Kameron_600SemiBold",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 5,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
});
