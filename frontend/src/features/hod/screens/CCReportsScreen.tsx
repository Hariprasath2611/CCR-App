import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

import { ms } from '@theme/responsive';

export const CCReportsScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">CC Consolidated Reports</Text>
      <Text variant="bodyMedium">Weekly consolidated class progress reports submitted by Class Coordinators.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: ms(16),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.background,
  },
});
export default CCReportsScreen;
