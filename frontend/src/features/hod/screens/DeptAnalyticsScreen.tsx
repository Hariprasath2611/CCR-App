import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

import { ms } from '@theme/responsive';

export const DeptAnalyticsScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Department Analytics</Text>
      <Text variant="bodyMedium">Track completion status and trends across classes and faculty.</Text>
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
export default DeptAnalyticsScreen;
