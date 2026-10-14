import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { EditorialColors, EditorialFonts } from '@theme/editorial';

interface LabelProps {
  children?: React.ReactNode;
  text?: string;
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
}

export const Label: React.FC<LabelProps> = ({
  children,
  text,
  color = EditorialColors.muted,
  style,
  numberOfLines,
}) => {
  const content = text !== undefined ? text : children;
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        styles.label,
        { color },
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
