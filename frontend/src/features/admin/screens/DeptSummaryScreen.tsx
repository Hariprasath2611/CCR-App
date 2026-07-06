import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

export const DeptSummaryScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Department Summaries</Text>
      <Text variant="bodyMedium">Monitor progress metrics across all departments.</Text>
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
export default DeptSummaryScreen;
