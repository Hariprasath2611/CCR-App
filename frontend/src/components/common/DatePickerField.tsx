import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppTextInput } from './AppTextInput';

interface DatePickerFieldProps {
  label: string;
  value: string; // expects DD/MM/YYYY
  onChange: (dateStr: string) => void;
  error?: string;
  style?: any;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  error,
  style,
}) => {
  const handleTextChange = (text: string) => {
    let clean = text.replace(/[^0-9]/g, '');
    if (clean.length > 8) {
      clean = clean.substring(0, 8);
    }

    let formatted = clean;
    if (clean.length > 2) {
      formatted = `${clean.substring(0, 2)}/${clean.substring(2, 4)}`;
    }
    if (clean.length > 4) {
      formatted = `${clean.substring(0, 2)}/${clean.substring(2, 4)}/${clean.substring(4, 8)}`;
    }

    onChange(formatted);
  };

  return (
    <View style={[styles.container, style]}>
      <AppTextInput
        label={label}
        value={value}
        onChangeText={handleTextChange}
        error={error}
        keyboardType="numeric"
        placeholder="DD/MM/YYYY"
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    marginBottom: 0,
  },
});

export default DatePickerField;
