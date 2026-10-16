import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';

interface EditorialTextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  rightAccessory?: React.ReactNode;
}

export const EditorialTextField: React.FC<EditorialTextFieldProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  rightAccessory,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!error;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, hasError && styles.labelError]}>
          {label.toUpperCase()}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
        ]}
      >
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={DayRibbonColors.mutedSoft}
          selectionColor={DayRibbonColors.cobalt}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
      </View>

      {hasError ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    marginBottom: 6,
  },
  labelError: {
    color: DayRibbonColors.warn,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DayRibbonColors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputFocused: {
    borderColor: DayRibbonColors.cobalt,
  },
  inputError: {
    borderColor: DayRibbonColors.warn,
  },
  input: {
    flex: 1,
    fontFamily: DayRibbonFonts.body600,
    fontSize: 15,
    color: DayRibbonColors.ink,
    paddingVertical: 10,
  },
  accessory: {
    marginLeft: 8,
  },
  errorText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 12,
    color: DayRibbonColors.warn,
    marginTop: 4,
    marginLeft: 2,
  },
});

export default EditorialTextField;
