import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DayRibbonColors, DayRibbonFonts } from '@theme/dayRibbon';

export interface StatusBannerProps {
  message: string;
  variant?: 'warn' | 'info' | 'approved' | 'accent' | 'ink';
  icon?: keyof typeof Feather.glyphMap;
  style?: ViewStyle;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  message,
  variant = 'info',
  icon,
  style,
}) => {
  const isWarn = variant === 'warn' || variant === 'accent';
  const bgColor = isWarn ? DayRibbonColors.warnBg : DayRibbonColors.cobaltTint;
  const textColor = isWarn ? DayRibbonColors.warn : DayRibbonColors.cobalt;
  const defaultIcon = isWarn ? 'alert-circle' : 'info';
  const iconName = icon || defaultIcon;

  return (
    <View style={[styles.banner, { backgroundColor: bgColor }, style]}>
      <Feather name={iconName} size={16} color={textColor} style={styles.icon} />
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontFamily: DayRibbonFonts.body600,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default StatusBanner;
