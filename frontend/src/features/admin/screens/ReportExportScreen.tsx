import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '@theme/colors';

export const ReportExportScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Institution Export Center</Text>
      <Text variant="bodyMedium">Export consolidated departmental syllabus reports in PDF/Excel format.</Text>
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
export default ReportExportScreen;
