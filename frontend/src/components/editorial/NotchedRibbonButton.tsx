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
import Svg, { Path } from 'react-native-svg';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';

export interface NotchedRibbonButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'amber' | 'coral' | 'secondary';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
}

export const NotchedRibbonButton: React.FC<NotchedRibbonButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  fullWidth = true,
  style,
  textStyle,
  icon,
  accessibilityLabel,
}) => {
  const getBgColor = () => {
    if (disabled) return DayRibbonColors.border;
    switch (variant) {
      case 'amber':
        return DayRibbonColors.amber;
      case 'coral':
        return DayRibbonColors.coral;
      case 'secondary':
        return 'transparent';
      case 'primary':
      default:
        return DayRibbonColors.blue;
    }
  };

  const getTextColor = () => {
    if (disabled) return DayRibbonColors.muted;
    if (variant === 'amber') return DayRibbonColors.ink;
    if (variant === 'secondary') return DayRibbonColors.ink;
    return DayRibbonColors.white;
  };

  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled, busy: loading }}
      activeOpacity={0.85}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.buttonContainer,
        { backgroundColor: getBgColor() },
        isSecondary && styles.secondaryBorder,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {/* Decorative Ribbon Notch on the right edge */}
      {!isSecondary && !disabled && (
        <View style={styles.notchWrapper} pointerEvents="none">
          <Svg width={14} height={20} viewBox="0 0 14 20">
            <Path
              d="M0 0 L14 10 L0 20 Z"
              fill={variant === 'amber' ? '#E59B15' : '#1D25B8'}
              opacity={0.35}
            />
          </Svg>
        </View>
      )}

      {loading ? (
        <View style={styles.contentRow}>
          <ActivityIndicator color={getTextColor()} size="small" />
          <Text style={[styles.buttonLabel, { color: getTextColor(), marginLeft: 10 }]}>
            Processing...
          </Text>
        </View>
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text
            style={[
              styles.buttonLabel,
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    minHeight: 52,
    minWidth: 44,
    borderRadius: DayRibbonShapes.buttonRadius,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
    ...DayRibbonShapes.shadow,
  },
  fullWidth: {
    width: '100%',
  },
  secondaryBorder: {
    borderWidth: 1.5,
    borderColor: DayRibbonColors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  buttonLabel: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 15,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  notchWrapper: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -10,
  },
});

export default NotchedRibbonButton;
