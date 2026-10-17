import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';
import { RemoteBanner as BannerType } from '@services/remoteConfig/remoteConfigService';

interface RemoteBannerProps {
  banner: BannerType;
  onDismiss: (id: string) => void;
}

export const RemoteBanner: React.FC<RemoteBannerProps> = ({ banner, onDismiss }) => {
  const getBannerAccent = () => {
    switch (banner.type) {
      case 'warning':
        return { bg: '#FFF8E7', border: DayRibbonColors.amber, text: DayRibbonColors.ink };
      case 'alert':
        return { bg: '#FFF0F2', border: DayRibbonColors.coral, text: DayRibbonColors.ink };
      case 'success':
        return { bg: '#EBFBF5', border: DayRibbonColors.mint, text: DayRibbonColors.ink };
      case 'info':
      default:
        return { bg: '#F0F1FF', border: DayRibbonColors.blue, text: DayRibbonColors.ink };
    }
  };

  const accent = getBannerAccent();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: accent.bg, borderLeftColor: accent.border },
      ]}
      accessibilityRole="alert"
    >
      <View style={styles.textContainer}>
        <Text style={[styles.bannerText, { color: accent.text }]}>
          {banner.text}
        </Text>
      </View>

      {banner.dismissible && (
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => onDismiss(banner.id)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss banner"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: DayRibbonShapes.cardRadius,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: DayRibbonColors.border,
    ...DayRibbonShapes.shadow,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  bannerText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 13,
    lineHeight: 18,
  },
  dismissButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 16,
    fontFamily: DayRibbonFonts.body700,
    color: DayRibbonColors.muted,
  },
});

export default RemoteBanner;
