import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("screen");

// These values are from iPhone X (standard design baseline)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scale based on width (best for font size)
 */
export const scale = (size) => (width / guidelineBaseWidth) * size;

/**
 * Vertical scale (useful for height-based elements)
 */
export const verticalScale = (size) => (height / guidelineBaseHeight) * size;

/**
 * Moderately scale the size — prevents extreme scaling on very large/small devices
 */
export const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

/**
 * Best for text: scales + rounds for pixel density
 */
export const scaleFont = (size, factor = 0.5) =>
  Math.round(PixelRatio.roundToNearestPixel(moderateScale(size, factor)));
export const fontScale = PixelRatio.getFontScale(); // Usually 1.0, 1.2, 1.5, etc.
