import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { EditorialColors } from '@theme/editorial';

export interface SegBarProps {
  /** Percentage (0-100) or completed count */
  progress?: number;
  value?: number;
  total?: number;
  max?: number;
  totalSegments?: number;
  segments?: number;
  filledSegments?: number;
  isLagging?: boolean;
  color?: string;
  style?: ViewStyle;
}

export const SegBar: React.FC<SegBarProps> = ({
  progress,
  value,
  total,
  max,
  totalSegments,
  segments,
  filledSegments,
  isLagging = false,
  color,
  style,
}) => {
  const currentVal = value !== undefined ? value : (progress !== undefined ? progress : 0);
  const currentMax = max !== undefined ? max : (total !== undefined ? total : 100);
  const TOTAL_SEGMENTS = segments !== undefined ? segments : (totalSegments !== undefined ? totalSegments : 25);

  let filledCount = 0;
  if (filledSegments !== undefined) {
    filledCount = Math.max(0, Math.min(TOTAL_SEGMENTS, filledSegments));
  } else {
    const ratio = Math.max(0, Math.min(1, currentMax > 0 ? currentVal / currentMax : 0));
    filledCount = Math.round(ratio * TOTAL_SEGMENTS);
  }

  const fillColor = color || (isLagging ? EditorialColors.accent : EditorialColors.ink);

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: TOTAL_SEGMENTS }).map((_, index) => {
        const isFilled = index < filledCount;
        return (
          <View
            key={index}
            style={[
              styles.block,
              {
                backgroundColor: isFilled ? fillColor : EditorialColors.track,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 8,
    gap: 3,
    width: '100%',
  },
  block: {
    flex: 1,
    height: 8,
    borderRadius: 0,
  },
});

export default SegBar;
