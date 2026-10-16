import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
  labelStyle?: TextStyle;
  icon?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  mode = 'contained',
  loading = false,
  disabled = false,
  style,
  textColor,
  labelStyle,
}) => {
  const isContained = mode === 'contained';
  const isOutlined = mode === 'outlined';

  const containerStyle = disabled
    ? styles.disabled
    : isContained
    ? styles.contained
    : isOutlined
    ? styles.outlined
    : styles.textMode;

  const fontColor = disabled
    ? DayRibbonColors.mutedSoft
    : textColor
    ? textColor
    : isContained
    ? DayRibbonColors.white
    : DayRibbonColors.ink;

  return (
    <TouchableOpacity
      style={[styles.button, containerStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator size="small" color={fontColor} />
      ) : (
        <Text style={[styles.label, { color: fontColor }, labelStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: DayRibbonShapes.buttonRadius, // 14
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 6,
    width: '100%',
  },
  contained: {
    backgroundColor: DayRibbonColors.cobalt,
    ...DayRibbonShapes.shadow,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: DayRibbonColors.ink,
  },
  textMode: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: DayRibbonColors.line,
  },
  label: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

export default AppButton;
