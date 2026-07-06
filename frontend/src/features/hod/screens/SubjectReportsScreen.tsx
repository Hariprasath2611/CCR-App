import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

export const SubjectReportsScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Subject Reports</Text>
      <Text variant="bodyMedium">Weekly syllabus progress reports submitted by subject staff.</Text>
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
export default SubjectReportsScreen;
