/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from "react";
import { Image, View, StyleSheet, ActivityIndicator } from "react-native";
import { SvgXml } from "react-native-svg";
import axios from "axios";

const SvgImageWithFallback = ({ uri, size = 50 }) => {
  const [svgContent, setSvgContent] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSvg = async () => {
      try {
        const response = await axios.get(uri);
        setSvgContent(response.data);
      } catch (err) {
        setError(true);
      }
    };

    if (uri?.endsWith(".svg")) {
      fetchSvg();
    } else {
      setError(true);
    }
  }, [uri]);

  if (svgContent) {
    return (
      <SvgXml
        xml={svgContent}
        width={size}
        height={size}
        style={{ borderWidth: 3 }}
      />
    );
  }

  if (error) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        resizeMode="cover" // ✅ Prevents repeat/tiling
      />
    );
  }

  return (
    <View style={[styles.loading, { width: size, height: size }]}>
      <ActivityIndicator size="small" color="#888" />
    </View>
  );
};

const styles = StyleSheet.create({
  loading: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SvgImageWithFallback;
