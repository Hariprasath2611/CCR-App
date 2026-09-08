import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

import { ms } from '@theme/responsive';

export const ExtraHourRequestsScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Extra Hour Requests</Text>
      <Text variant="bodyMedium">Review and approve extra teaching hour requests submitted by faculty.</Text>
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
export default ExtraHourRequestsScreen;
