import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

export const ClassProgressScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Class Weekly Progress</Text>
      <Text variant="bodyMedium">Monitor progress of all subjects for your assigned class.</Text>
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
