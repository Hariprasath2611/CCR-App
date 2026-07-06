import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

export const WeeklyTimetableScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Weekly Timetable</Text>
      <Text variant="bodyMedium">View your academic teaching schedule by day.</Text>
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
