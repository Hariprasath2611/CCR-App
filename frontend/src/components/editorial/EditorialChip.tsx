import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';

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
      activeOpacity={0.75}
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
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: DayRibbonShapes.chipRadius, // 14
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedChip: {
    backgroundColor: 'transparent',
    borderColor: DayRibbonColors.line,
  },
  selectedChip: {
    backgroundColor: DayRibbonColors.ink,
    borderColor: DayRibbonColors.ink,
  },
  text: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
  },
  unselectedText: {
    color: DayRibbonColors.ink,
  },
  selectedText: {
    color: DayRibbonColors.white,
  },
});

export default EditorialChip;
