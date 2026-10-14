import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { EditorialColors } from '@theme/editorial';

interface SegBarProps {
  /** Percentage (0-100) or completed count */
  progress?: number;
  total?: number;
  totalSegments?: number;
  filledSegments?: number;
  isLagging?: boolean;
  style?: ViewStyle;
}

export const SegBar: React.FC<SegBarProps> = ({
  progress = 0,
  total = 100,
  totalSegments = 25,
  filledSegments,
  isLagging = false,
  style,
}) => {
  const TOTAL_SEGMENTS = totalSegments;
  let filledCount = 0;
  if (filledSegments !== undefined) {
    filledCount = Math.max(0, Math.min(TOTAL_SEGMENTS, filledSegments));
  } else {
    const ratio = Math.max(0, Math.min(1, total > 0 ? progress / total : 0));
    filledCount = Math.round(ratio * TOTAL_SEGMENTS);
  }

  const fillColor = isLagging ? EditorialColors.accent : EditorialColors.ink;

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
    alignItems: 'center',
    width: '100%',
    height: 8,
    gap: 2,
  },
  block: {
    flex: 1,
    height: 8,
    borderRadius: 0,
  },
});
