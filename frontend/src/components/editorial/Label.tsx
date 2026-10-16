import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { DayRibbonColors, DayRibbonFonts } from '@theme/dayRibbon';

export interface LabelProps {
  children?: React.ReactNode;
  text?: string;
  variant?: 'dark' | 'muted' | 'warn' | 'cobalt' | string;
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
}

export const Label: React.FC<LabelProps> = ({
  children,
  text,
  variant,
  color,
  style,
  numberOfLines,
}) => {
  const content = text !== undefined ? text : children;

  let resolvedColor = color || DayRibbonColors.muted;
  if (!color && variant) {
    if (variant === 'dark') resolvedColor = DayRibbonColors.ink;
    else if (variant === 'warn' || variant === 'accent') resolvedColor = DayRibbonColors.warn;
    else if (variant === 'cobalt') resolvedColor = DayRibbonColors.cobalt;
    else if (variant === 'muted') resolvedColor = DayRibbonColors.muted;
  }

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        styles.label,
        { color: resolvedColor },
        style,
      ]}
    >
      {typeof content === 'string' ? content.toUpperCase() : content}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default Label;
