import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { EditorialColors, EditorialFonts, EditorialRules } from '@theme/editorial';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  isLoading = false,
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
      <View style={styles.squareIconBox}>
        <View style={styles.innerSquare} />
      </View>
      <Text style={styles.title}>{title.toUpperCase()}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  squareIconBox: {
    width: 48,
    height: 48,
    borderWidth: EditorialRules.borderWidth,
    borderColor: EditorialColors.ink,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  innerSquare: {
    width: 16,
    height: 16,
    backgroundColor: EditorialColors.ink,
  },
  title: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 14,
    letterSpacing: 2,
    color: EditorialColors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: EditorialColors.muted,
    textAlign: 'center',
    maxWidth: 280,
  },
  skeletonBlockLarge: {
    width: '100%',
    height: 48,
    backgroundColor: EditorialColors.track,
    marginBottom: 10,
    borderRadius: 0,
  },
  skeletonBlockMedium: {
    width: '80%',
    height: 32,
    backgroundColor: EditorialColors.track,
    marginBottom: 10,
    borderRadius: 0,
  },
  skeletonBlockSmall: {
    width: '60%',
    height: 24,
    backgroundColor: EditorialColors.track,
    borderRadius: 0,
  },
});
