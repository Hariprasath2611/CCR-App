import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

export const WeeklyReportsScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Institution Weekly Reports</Text>
      <Text variant="bodyMedium">View weekly academic plans and progress summaries for all classes.</Text>
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
export default WeeklyReportsScreen;
