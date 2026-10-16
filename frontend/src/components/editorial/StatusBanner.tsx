import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DayRibbonColors, DayRibbonFonts } from '@theme/dayRibbon';

export interface StatusBannerProps {
  message?: string;
  title?: string;
  subtitle?: string;
  variant?: 'warn' | 'info' | 'approved' | 'accent' | 'ink';
  type?: 'warn' | 'info' | 'approved' | 'accent' | 'error' | 'success' | 'warning' | string;
  icon?: keyof typeof Feather.glyphMap;
  style?: ViewStyle;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  message,
  title,
  subtitle,
  variant,
  type,
  icon,
  style,
}) => {
  const chosenVariant = variant || (type === 'error' || type === 'warning' ? 'warn' : (type as any)) || 'info';
  const isWarn = chosenVariant === 'warn' || chosenVariant === 'accent';
  const bgColor = isWarn ? DayRibbonColors.warnBg : DayRibbonColors.cobaltTint;
  const textColor = isWarn ? DayRibbonColors.warn : DayRibbonColors.cobalt;
  const defaultIcon = isWarn ? 'alert-circle' : 'info';
  const iconName = icon || defaultIcon;

  const displayMessage = message || (title && subtitle ? `${title}: ${subtitle}` : title || subtitle || '');

  return (
    <View style={[styles.banner, { backgroundColor: bgColor }, style]}>
      <Feather name={iconName} size={16} color={textColor} style={styles.icon} />
      <View style={styles.textContainer}>
        {title && subtitle ? (
          <>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: textColor }]}>{subtitle}</Text>
          </>
        ) : (
          <Text style={[styles.text, { color: textColor }]}>{displayMessage}</Text>
        )}
      </View>
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
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    lineHeight: 18,
  },
  subtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  text: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default StatusBanner;
