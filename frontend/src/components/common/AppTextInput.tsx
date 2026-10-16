import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ViewStyle, TextStyle } from 'react-native';
import { DayRibbonColors, DayRibbonFonts } from '@theme/dayRibbon';

interface AppTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle;
  inputStyle?: TextStyle;
  multiline?: boolean;
  numberOfLines?: number;
  placeholder?: string;
}

export const AppTextInput: React.FC<AppTextInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
  inputStyle,
  multiline = false,
  numberOfLines = 1,
  placeholder,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!error;

  return (
    <View style={[styles.container, style]}>
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
          multiline && { minHeight: 24 * (numberOfLines || 3), alignItems: 'flex-start' },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={DayRibbonColors.mutedSoft}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          selectionColor={DayRibbonColors.cobalt}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            multiline && { textAlignVertical: 'top' },
            inputStyle,
          ]}
        />
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
    backgroundColor: DayRibbonColors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    paddingHorizontal: 14,
    minHeight: 50,
    justifyContent: 'center',
  },
  inputFocused: {
    borderColor: DayRibbonColors.cobalt,
  },
  inputError: {
    borderColor: DayRibbonColors.warn,
  },
  input: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 15,
    color: DayRibbonColors.ink,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  errorText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 12,
    color: DayRibbonColors.warn,
    marginTop: 4,
    marginLeft: 2,
  },
});

export default AppTextInput;
