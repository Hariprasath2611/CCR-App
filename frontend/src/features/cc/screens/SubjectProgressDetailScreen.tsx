import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

import { ms } from '@theme/responsive';

export const SubjectProgressDetailScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Subject Progress Detail</Text>
      <Text variant="bodyMedium">Review details of a specific subject's weekly submission.</Text>
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
