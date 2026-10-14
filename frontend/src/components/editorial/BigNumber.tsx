import React from 'react';
import { View, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { EditorialColors, EditorialFonts } from '@theme/editorial';

interface BigNumberProps {
  value: string | number;
  suffix?: string;
  size?: 'hero' | 'big' | 'section';
  color?: string;
  suffixColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const BigNumber: React.FC<BigNumberProps> = ({
  value,
  suffix,
  size = 'big',
  color = EditorialColors.ink,
  suffixColor = EditorialColors.accent,
  style,
  textStyle,
}) => {
  const getFontSize = () => {
    switch (size) {
      case 'hero':
        return 104;
      case 'section':
        return 32;
      case 'big':
      default:
        return 60;
    }
  };

  const getLineHeight = () => {
    switch (size) {
      case 'hero':
        return 104;
      case 'section':
        return 34;
      case 'big':
      default:
        return 62;
    }
  };

  const fontSize = getFontSize();
  const lineHeight = getLineHeight();

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          styles.number,
          {
            fontSize,
            lineHeight,
            color,
          },
          textStyle,
        ]}
      >
        {value}
        {suffix ? (
          <Text
            style={[
              styles.suffix,
              {
                fontSize: Math.round(fontSize * 0.6),
                color: suffixColor,
              },
            ]}
          >
            {suffix}
          </Text>
        ) : null}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  number: {
    fontFamily: EditorialFonts.display,
    letterSpacing: -1,
  },
  suffix: {
    fontFamily: EditorialFonts.display,
  },
});
