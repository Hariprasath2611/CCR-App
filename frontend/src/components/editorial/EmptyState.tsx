import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  isLoading = false,
  icon = 'inbox',
  style,
}) => {
  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.skeletonBlockLarge} />
        <View style={styles.skeletonBlockMedium} />
        <View style={styles.skeletonBlockSmall} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Feather name={icon} size={24} color={DayRibbonColors.mutedSoft} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 44,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...DayRibbonShapes.shadow,
  },
  title: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    color: DayRibbonColors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    lineHeight: 18,
    color: DayRibbonColors.muted,
    textAlign: 'center',
    maxWidth: 280,
  },
  skeletonBlockLarge: {
    width: '100%',
    height: 64,
    backgroundColor: DayRibbonColors.surface,
    borderColor: DayRibbonColors.line,
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: DayRibbonShapes.cardRadius,
  },
  skeletonBlockMedium: {
    width: '100%',
    height: 64,
    backgroundColor: DayRibbonColors.surface,
    borderColor: DayRibbonColors.line,
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: DayRibbonShapes.cardRadius,
  },
  skeletonBlockSmall: {
    width: '60%',
    height: 24,
    backgroundColor: DayRibbonColors.line,
    borderRadius: 8,
  },
});

export default EmptyState;
