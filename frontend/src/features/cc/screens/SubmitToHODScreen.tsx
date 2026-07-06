import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

export const SubmitToHODScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Submit to HOD</Text>
      <Text variant="bodyMedium">Finalize and submit the consolidated weekly report to HOD.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.background,
  },
});
