import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

export const DepartmentClassesScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Department Classes</Text>
      <Text variant="bodyMedium">View all academic classes mapped to your department.</Text>
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
export default DepartmentClassesScreen;
