import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { EditorialColors, EditorialFonts, EditorialRules } from '@theme/editorial';

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
    ? EditorialColors.muted
    : textColor
    ? textColor
    : isContained
    ? EditorialColors.white
    : EditorialColors.ink;

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
          {title.toUpperCase()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 6,
    width: '100%',
  },
  contained: {
    backgroundColor: EditorialColors.ink,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: EditorialRules.borderWidth,
    borderColor: EditorialColors.ink,
  },
  textMode: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: EditorialColors.track,
  },
  label: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
