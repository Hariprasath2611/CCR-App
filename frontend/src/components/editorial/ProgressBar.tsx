import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { DayRibbonColors } from '@theme/dayRibbon';

export interface ProgressBarProps {
  progress: number; // 0 to 100 or 0 to 1
  isBehindPlan?: boolean;
  isLagging?: boolean;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  isBehindPlan = false,
  isLagging = false,
  height = 8,
  style,
}) => {
  // Normalize progress to 0-100
  const normalized = progress <= 1 && progress > 0 ? progress * 100 : Math.max(0, Math.min(100, progress || 0));
  const isWarn = isBehindPlan || isLagging;
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
