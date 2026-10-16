import React from 'react';
import { View, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { DayRibbonColors, DayRibbonFonts } from '@theme/dayRibbon';

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
  color = DayRibbonColors.cobalt,
  suffixColor,
  style,
  textStyle,
}) => {
  const finalSuffix = suffix !== undefined ? suffix : (unit !== undefined ? unit : (showPercent ? '%' : undefined));
  const finalSuffixColor = suffixColor || DayRibbonColors.ink;

  const getFontSize = () => {
    switch (size) {
      case 'hero':
        return 92;
      case 'section':
        return 34;
      case 'big':
      default:
        return 60;
    }
  };

  const getLineHeight = () => {
    switch (size) {
      case 'hero':
        return 96;
      case 'section':
        return 38;
      case 'big':
      default:
        return 64;
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
                color: finalSuffixColor,
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
    alignItems: 'baseline',
  },
  value: {
    fontFamily: DayRibbonFonts.display,
    letterSpacing: -1,
  },
  suffix: {
    fontFamily: DayRibbonFonts.display,
    marginLeft: 2,
  },
  labelText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    marginTop: 4,
  },
});

export default BigNumber;
