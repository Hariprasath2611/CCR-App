import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { DayRibbonColors } from '@theme/dayRibbon';

export interface ProgressBarProps {
  progress?: number; // 0 to 100 or 0 to 1
  percent?: number;  // alias
  value?: number;    // alias
  isBehindPlan?: boolean;
  isBehind?: boolean; // alias
  isLagging?: boolean;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  percent,
  value,
  isBehindPlan = false,
  isBehind = false,
  isLagging = false,
  height = 8,
  style,
}) => {
  const actualVal = progress !== undefined ? progress : (percent !== undefined ? percent : (value || 0));
  // Normalize progress to 0-100
  const normalized = actualVal <= 1 && actualVal > 0 ? actualVal * 100 : Math.max(0, Math.min(100, actualVal || 0));
  const isWarn = isBehindPlan || isLagging || isBehind;
  const fillColor = isWarn ? DayRibbonColors.warn : DayRibbonColors.cobalt;

  return (
    <View style={[styles.track, { height, borderRadius: 9 }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${normalized}%`,
            backgroundColor: fillColor,
            borderRadius: 9,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: DayRibbonColors.line,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});

export default ProgressBar;
