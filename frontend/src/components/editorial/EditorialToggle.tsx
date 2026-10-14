import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { EditorialColors, EditorialRules } from '@theme/editorial';

interface EditorialToggleProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const EditorialToggle: React.FC<EditorialToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.track,
        value ? styles.trackOn : styles.trackOff,
        disabled && styles.trackDisabled,
        style,
      ]}
      onPress={() => !disabled && onValueChange(!value)}
      activeOpacity={0.8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <View
        style={[
          styles.knob,
          value ? styles.knobOn : styles.knobOff,
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 46,
    height: 26,
    borderWidth: EditorialRules.borderWidth, // 1.5px ink border
    borderColor: EditorialColors.ink,
    borderRadius: 0, // square
    padding: 2,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: EditorialColors.ink,
  },
  trackOff: {
    backgroundColor: 'transparent',
  },
  trackDisabled: {
    borderColor: EditorialColors.track,
    backgroundColor: EditorialColors.track,
  },
  knob: {
    width: 18,
    height: 18,
    borderRadius: 0, // square knob
  },
  knobOn: {
    backgroundColor: EditorialColors.white,
    alignSelf: 'flex-end',
  },
  knobOff: {
    backgroundColor: EditorialColors.ink,
    alignSelf: 'flex-start',
  },
});
