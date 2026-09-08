import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device
// (e.g., iPhone X / 11 Pro)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const scale = (size: number) => (width / guidelineBaseWidth) * size;
export const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

// moderateScale is useful for fonts, paddings, margins where you don't want 
// them to grow proportionally as much as the screen size (e.g., on a tablet)
export const moderateScale = (size: number, factor: number = 0.5) => 
  size + (scale(size) - size) * factor;

// Shortcut alias
export const ms = moderateScale;
