import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

import { ms } from '@theme/responsive';

export const PendingSubmissionsScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Pending Submissions</Text>
      <Text variant="bodyMedium">Track subjects that have not yet submitted progress for this week.</Text>
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
