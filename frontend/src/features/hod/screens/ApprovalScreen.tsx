import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

import { ms } from '@theme/responsive';

export const ApprovalScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">HOD Approval Queue</Text>
      <Text variant="bodyMedium">Approve, reject, or return weekly plans, progress, and extra-hour requests.</Text>
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
export default ApprovalScreen;
