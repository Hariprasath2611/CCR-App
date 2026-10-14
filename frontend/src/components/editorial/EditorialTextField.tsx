import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { EditorialColors, EditorialFonts, EditorialType } from '@theme/editorial';

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
  ...rest
}) => {
  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, hasError && styles.labelError]}>
          {label.toUpperCase()}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputRow,
          hasError ? styles.inputRowError : styles.inputRowNormal,
        ]}
      >
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={EditorialColors.muted}
          selectionColor={EditorialColors.ink}
          {...rest}
        />
        {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
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
    marginBottom: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    paddingBottom: 6,
    paddingTop: 4,
  },
  inputRowNormal: {
    borderBottomColor: EditorialColors.ink,
  },
  inputRowError: {
    borderBottomColor: EditorialColors.accent,
  },
  input: {
    flex: 1,
    fontFamily: EditorialFonts.semibold,
    fontSize: 16,
    color: EditorialColors.ink,
    paddingVertical: 0,
  },
  accessory: {
    marginLeft: 8,
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
