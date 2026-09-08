import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

import { ms } from '@theme/responsive';

export const InstitutionAnalyticsScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Institution Analytics</Text>
      <Text variant="bodyMedium">Track institute-wide completion trends and comparison charts.</Text>
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
export default InstitutionAnalyticsScreen;
