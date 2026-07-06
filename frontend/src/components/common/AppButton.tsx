import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { Palette } from '@theme/colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  textColor?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  mode = 'contained',
  loading = false,
  disabled = false,
  style,
  textColor,
}) => {
  const isContained = mode === 'contained';

  return (
    <Button
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      style={[
        styles.button,
        isContained && !disabled && styles.containedButton,
        style,
      ]}
      labelStyle={styles.label}
      textColor={textColor || (isContained ? Palette.surface : Palette.primary)}
    >
      {title}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    marginVertical: 6,
  },
  containedButton: {
    backgroundColor: Palette.primary,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 2,
  },
});
