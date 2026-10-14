import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { EditorialColors, EditorialFonts, EditorialRules } from '@theme/editorial';

export type ButtonVariant = 'primary' | 'outline' | 'danger';

interface EditorialButtonProps {
  title: string;
  variant?: ButtonVariant;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const EditorialButton: React.FC<EditorialButtonProps> = ({
  title,
  variant = 'primary',
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const getContainerStyle = () => {
    if (disabled) {
      return styles.disabledContainer;
    }
    switch (variant) {
      case 'outline':
        return styles.outlineContainer;
      case 'danger':
        return styles.dangerContainer;
      case 'primary':
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = () => {
    if (disabled) {
      return styles.disabledText;
    }
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      case 'danger':
        return styles.dangerText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.baseButton, getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? EditorialColors.white : EditorialColors.ink}
        />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text style={[styles.baseText, getTextStyle(), textStyle]}>
            {title.toUpperCase()}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    height: 54,
    width: '100%',
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  baseText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  primaryContainer: {
    backgroundColor: EditorialColors.ink,
  },
  primaryText: {
    color: EditorialColors.white,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: EditorialRules.borderWidth,
    borderColor: EditorialColors.ink,
  },
  outlineText: {
    color: EditorialColors.ink,
  },
  dangerContainer: {
    backgroundColor: 'transparent',
    borderWidth: EditorialRules.borderWidth,
    borderColor: EditorialColors.accent,
  },
  dangerText: {
    color: EditorialColors.accent,
  },
  disabledContainer: {
    backgroundColor: EditorialColors.track,
  },
  disabledText: {
    color: EditorialColors.muted,
  },
});
