import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

import { ms } from '@theme/responsive';

export const ApprovalStatusScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Approval Status</Text>
      <Text variant="bodyMedium">Check HOD review status on teaching plans and extra hours requests.</Text>
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
