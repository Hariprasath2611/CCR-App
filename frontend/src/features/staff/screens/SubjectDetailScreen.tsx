import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

import { ms } from '@theme/responsive';

export const SubjectDetailScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Subject Detail & Syllabus</Text>
      <Text variant="bodyMedium">Check off completed topics and view syllabus structure.</Text>
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
