import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

export const FacultyProgressScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Faculty Syllabus Progress</Text>
      <Text variant="bodyMedium">View progress breakdown by subject faculty.</Text>
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
export default FacultyProgressScreen;
