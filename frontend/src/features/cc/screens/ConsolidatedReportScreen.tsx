import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

export const ConsolidatedReportScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Consolidated Weekly Report</Text>
      <Text variant="bodyMedium">Review and compile the class weekly progress summary.</Text>
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
