import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { EditorialColors, EditorialFonts, EditorialRules } from '@theme/editorial';

interface EditorialChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const EditorialChip: React.FC<EditorialChipProps> = ({
  label,
  selected = false,
  onPress,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected ? styles.selectedChip : styles.unselectedChip,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      <Text
        style={[
          styles.text,
          selected ? styles.selectedText : styles.unselectedText,
          textStyle,
        ]}
      >
        {label.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 0, // square
    borderWidth: EditorialRules.borderWidth, // 1.5px ink border
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedChip: {
    backgroundColor: 'transparent',
    borderColor: EditorialColors.ink,
  },
  selectedChip: {
    backgroundColor: EditorialColors.ink,
    borderColor: EditorialColors.ink,
  },
  text: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  unselectedText: {
    color: EditorialColors.ink,
  },
  selectedText: {
    color: EditorialColors.white,
  },
});
