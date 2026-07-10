import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

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
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.background,
  },
});
export default InstitutionAnalyticsScreen;
