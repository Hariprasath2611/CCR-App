import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

export const ReportExportScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Print / Export Report</Text>
      <Text variant="bodyMedium">View, print, or download weekly academic reports.</Text>
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
