import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Palette } from '@theme/colors';

export const ForgotPasswordScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Forgot Password</Text>
      <Text style={styles.text}>Please contact your institutional IT administrator to reset your CCMS password.</Text>
      <Button mode="outlined" style={styles.btn}>Back to Login</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Palette.background,
  },
  text: {
    textAlign: 'center',
    color: Palette.textLight,
    marginTop: 16,
    marginBottom: 24,
  },
  btn: {
    width: '100%',
  },
});
