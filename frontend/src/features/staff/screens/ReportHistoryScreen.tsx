import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

export const ReportHistoryScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Report History</Text>
      <Text variant="bodyMedium">View historical syllabus completion submissions.</Text>
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
