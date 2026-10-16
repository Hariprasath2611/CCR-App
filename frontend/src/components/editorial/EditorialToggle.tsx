import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { DayRibbonColors } from '@theme/dayRibbon';

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
    width: 48,
    height: 28,
    borderRadius: 14, // radius full
    padding: 3,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: DayRibbonColors.cobalt,
  },
  trackOff: {
    backgroundColor: DayRibbonColors.line,
  },
  trackDisabled: {
    backgroundColor: DayRibbonColors.line,
    opacity: 0.5,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: DayRibbonColors.white,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(14, 19, 48, 0.15)',
      },
      default: {
        shadowColor: DayRibbonColors.ink,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
  knobOff: {
    alignSelf: 'flex-start',
  },
});

export default EditorialToggle;
