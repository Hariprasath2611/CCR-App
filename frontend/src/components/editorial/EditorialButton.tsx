import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { EditorialColors, EditorialFonts, EditorialRules } from '@theme/editorial';

export type ButtonVariant = 'primary' | 'outline' | 'danger';

export interface EditorialButtonProps {
  title: string;
  variant?: ButtonVariant;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const EditorialButton: React.FC<EditorialButtonProps> = ({
  title,
  variant = 'primary',
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  rightIcon,
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

  const getSpinnerColor = () => {
    if (variant === 'outline') {
      return EditorialColors.ink;
    }
    return EditorialColors.white;
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      activeOpacity={0.8}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.baseContainer,
        getContainerStyle(),
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getSpinnerColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.leftIconWrapper}>{icon}</View> : null}
          <Text style={[styles.baseText, getTextStyle(), textStyle]}>
            {title.toUpperCase()}
          </Text>
          {rightIcon ? <View style={styles.rightIconWrapper}>{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    height: 54, // strict 54px height per prompt
    borderRadius: 0, // strict square
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderWidth: 0,
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconWrapper: {
    marginRight: 8,
  },
  rightIconWrapper: {
    marginLeft: 8,
  },
  primaryContainer: {
    backgroundColor: EditorialColors.ink,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: EditorialColors.ink,
  },
  dangerContainer: {
    backgroundColor: EditorialColors.accent,
  },
  disabledContainer: {
    backgroundColor: EditorialColors.track,
  },
  baseText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  primaryText: {
    color: EditorialColors.white,
  },
  outlineText: {
    color: EditorialColors.ink,
  },
  dangerText: {
    color: EditorialColors.white,
  },
  disabledText: {
    color: EditorialColors.muted,
  },
});

export default EditorialButton;
