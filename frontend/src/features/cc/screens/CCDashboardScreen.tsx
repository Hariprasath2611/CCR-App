import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { Palette } from '@theme/colors';
import { cardStyles } from '@theme/styles/cards';

export const CCDashboardScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Class Coordinator Board</Text>
      <Text style={styles.subtitle}>Section CSE-B Report Consolidation</Text>

      <Card style={cardStyles.dashboardCard}>
        <Text style={cardStyles.cardTitle}>Section Progress Audit</Text>
        <Text style={cardStyles.cardSubtitle}>2 faculty submissions pending for Week 12.</Text>
        <Button mode="contained" compact style={styles.btn}>
          Audit Submissions
        </Button>
      </Card>

      <Card style={cardStyles.dashboardCard}>
        <Text style={cardStyles.cardTitle}>Consolidated Reports</Text>
        <Text style={cardStyles.cardSubtitle}>Generate and compile the weekly class completion report for HOD review.</Text>
        <Button mode="outlined" compact style={styles.btn}>
          Compile & Send to HOD
        </Button>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Palette.background,
  },
  title: {
    fontWeight: 'bold',
    color: Palette.primary,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: Palette.textLight,
    marginBottom: 24,
  },
  btn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
});
