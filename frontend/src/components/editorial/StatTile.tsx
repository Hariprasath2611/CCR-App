import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';

export interface StatTileProps {
  value: string | number;
  label: string;
  suffix?: string;
  isBehindPlan?: boolean;
  isLagging?: boolean;
  bgVariant?: 'white' | 'tint';
  style?: ViewStyle;
}

export const StatTile: React.FC<StatTileProps> = ({
  value,
  label,
  suffix,
  isBehindPlan = false,
  isLagging = false,
  bgVariant = 'white',
  style,
}) => {
  const isWarn = isBehindPlan || isLagging;
  const numColor = isWarn ? DayRibbonColors.warn : DayRibbonColors.ink;

  return (
    <View
      style={[
        styles.tile,
        bgVariant === 'white' ? styles.whiteTile : styles.tintTile,
        style,
      ]}
    >
      <View style={styles.numberRow}>
        <Text style={[styles.numberText, { color: numColor }]}>{value}</Text>
        {suffix ? (
          <Text style={[styles.suffixText, { color: numColor }]}>{suffix}</Text>
        ) : null}
      </View>
      <Text style={styles.labelText} numberOfLines={1}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: DayRibbonShapes.borderWidth,
    borderColor: DayRibbonColors.line,
  },
  whiteTile: {
    backgroundColor: DayRibbonColors.surface,
    ...DayRibbonShapes.shadow,
  },
  tintTile: {
    backgroundColor: DayRibbonColors.bg,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  numberText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 26,
    lineHeight: 30,
  },
  suffixText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 16,
    marginLeft: 2,
  },
  labelText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
  },
});

export default StatTile;
