import React from 'react';
import { View, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { EditorialColors, EditorialFonts } from '@theme/editorial';

export interface BigNumberProps {
  value: string | number;
  suffix?: string;
  unit?: string;
  label?: string;
  showPercent?: boolean;
  size?: 'hero' | 'big' | 'section';
  color?: string;
  suffixColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const BigNumber: React.FC<BigNumberProps> = ({
  value,
  suffix,
  unit,
  label,
  showPercent = false,
  size = 'big',
  color = EditorialColors.ink,
  suffixColor = EditorialColors.accent,
  style,
  textStyle,
}) => {
  const finalSuffix = suffix !== undefined ? suffix : (unit !== undefined ? unit : (showPercent ? '%' : undefined));
  
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

  return (
    <View style={[styles.container, style]}>
      <View style={styles.numberRow}>
        <Text
          style={[
            styles.value,
            {
              fontSize: getFontSize(),
              lineHeight: getLineHeight(),
              color,
            },
            textStyle,
          ]}
        >
          {value}
        </Text>
        {finalSuffix ? (
          <Text
            style={[
              styles.suffix,
              {
                fontSize: getFontSize() * 0.45,
                lineHeight: getLineHeight() * 0.5,
                color: suffixColor,
              },
            ]}
          >
            {finalSuffix}
          </Text>
        ) : null}
      </View>
      {label ? (
        <Text style={styles.labelText}>{label.toUpperCase()}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  value: {
    fontFamily: EditorialFonts.display,
    letterSpacing: -1,
  },
  suffix: {
    fontFamily: EditorialFonts.display,
    marginLeft: 2,
    marginTop: 4,
  },
  labelText: {
    fontFamily: EditorialFonts.bold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: EditorialColors.muted,
    marginTop: 4,
  },
});

export default BigNumber;
