import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

export const WeeklyProgressScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Weekly Progress Log</Text>
      <Text variant="bodyMedium">Log the actual topics covered and complete units.</Text>
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
