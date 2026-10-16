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
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';

export type ButtonVariant = 'primary' | 'highlight' | 'secondary' | 'outline' | 'danger';

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
  const isHighlight = variant === 'highlight';
  const isSecondary = variant === 'secondary' || variant === 'outline';
  const isDanger = variant === 'danger';

  const getContainerStyle = () => {
    if (disabled) {
      return styles.disabledContainer;
    }
    if (isHighlight) {
      return styles.highlightContainer;
    }
    if (isSecondary) {
      return styles.secondaryContainer;
    }
    if (isDanger) {
      return styles.dangerContainer;
    }
    return styles.primaryContainer;
  };

  const getTextStyle = () => {
    if (disabled) {
      return styles.disabledText;
    }
    if (isHighlight) {
      return styles.highlightText;
    }
    if (isSecondary) {
      return styles.secondaryText;
    }
    if (isDanger) {
      return styles.dangerText;
    }
    return styles.primaryText;
  };

  const getSpinnerColor = () => {
    if (isHighlight || isSecondary) {
      return DayRibbonColors.ink;
    }
    if (isDanger) {
      return DayRibbonColors.warn;
    }
    return DayRibbonColors.white;
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
            {title}
          </Text>
          {rightIcon ? <View style={styles.rightIconWrapper}>{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    height: 52,
    borderRadius: DayRibbonShapes.buttonRadius,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    backgroundColor: DayRibbonColors.cobalt,
    ...DayRibbonShapes.shadow,
  },
  highlightContainer: {
    backgroundColor: DayRibbonColors.lemon,
    ...DayRibbonShapes.shadow,
  },
  secondaryContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: DayRibbonColors.ink,
  },
  dangerContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: DayRibbonColors.warn,
  },
  disabledContainer: {
    backgroundColor: DayRibbonColors.line,
  },
  baseText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  primaryText: {
    color: DayRibbonColors.white,
  },
  highlightText: {
    color: DayRibbonColors.ink,
  },
  secondaryText: {
    color: DayRibbonColors.ink,
  },
  dangerText: {
    color: DayRibbonColors.warn,
  },
  disabledText: {
    color: DayRibbonColors.mutedSoft,
  },
});

export default EditorialButton;
