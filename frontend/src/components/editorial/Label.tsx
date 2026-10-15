import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { EditorialColors, EditorialFonts } from '@theme/editorial';

export interface LabelProps {
  children?: React.ReactNode;
  text?: string;
  variant?: 'dark' | 'muted' | 'accent' | string;
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

  let resolvedColor = color || EditorialColors.muted;
  if (!color && variant) {
    if (variant === 'dark') resolvedColor = EditorialColors.ink;
    else if (variant === 'accent') resolvedColor = EditorialColors.accent;
    else if (variant === 'muted') resolvedColor = EditorialColors.muted;
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
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default Label;
