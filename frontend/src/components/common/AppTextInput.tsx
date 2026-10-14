import React from 'react';
import { StyleSheet, View, Text, TextInput, ViewStyle, TextStyle } from 'react-native';
import { EditorialColors, EditorialFonts } from '@theme/editorial';

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
  const hasError = !!error;

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={[styles.label, hasError && styles.labelError]}>
          {label.toUpperCase()}
        </Text>
      ) : null}
      <View style={[styles.inputRow, hasError ? styles.inputRowError : styles.inputRowNormal]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={EditorialColors.muted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          selectionColor={EditorialColors.ink}
          style={[
            styles.input,
            multiline && { height: 24 * (numberOfLines || 3), textAlignVertical: 'top' },
            inputStyle,
          ]}
        />
      </View>
      {hasError ? (
        <Text style={styles.errorText}>
          {error.toUpperCase()}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 18,
  },
  label: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  labelError: {
    color: EditorialColors.accent,
  },
  inputRow: {
    borderBottomWidth: 2,
    paddingBottom: 6,
    paddingTop: 4,
    backgroundColor: 'transparent',
  },
  inputRowNormal: {
    borderBottomColor: EditorialColors.ink,
  },
  inputRowError: {
    borderBottomColor: EditorialColors.accent,
  },
  input: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 16,
    color: EditorialColors.ink,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  errorText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1,
    color: EditorialColors.accent,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
