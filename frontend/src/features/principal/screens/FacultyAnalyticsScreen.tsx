import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

import { ms } from '@theme/responsive';

export const FacultyAnalyticsScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Faculty Performance Analytics</Text>
      <Text variant="bodyMedium">View average completion rates and submission timeline audits.</Text>
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
export default FacultyAnalyticsScreen;
