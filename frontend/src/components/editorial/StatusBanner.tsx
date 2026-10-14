import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { EditorialColors, EditorialFonts } from '@theme/editorial';

interface StatusBannerProps {
  message: string;
  variant?: 'ink' | 'accent';
  style?: ViewStyle;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  message,
  variant = 'ink',
  style,
}) => {
  return (
    <View
      style={[
        styles.banner,
        variant === 'accent' ? styles.accentBanner : styles.inkBanner,
        style,
      ]}
    >
      <Text style={styles.text}>{message.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inkBanner: {
    backgroundColor: EditorialColors.ink,
  },
  accentBanner: {
    backgroundColor: EditorialColors.accent,
  },
  text: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 2,
    color: EditorialColors.white,
    textAlign: 'center',
  },
});
