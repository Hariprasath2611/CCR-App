import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { EditorialColors, EditorialFonts } from '@theme/editorial';

interface LabelProps {
  children: React.ReactNode;
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
}

export const Label: React.FC<LabelProps> = ({
  children,
  color = EditorialColors.muted,
  style,
  numberOfLines,
}) => {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        styles.label,
        { color },
        style,
      ]}
    >
      {typeof children === 'string' ? children.toUpperCase() : children}
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
