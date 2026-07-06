import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

export const AssignedSubjectsScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Assigned Subjects</Text>
      <Text variant="bodyMedium">View syllabus details and status for your subjects.</Text>
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
