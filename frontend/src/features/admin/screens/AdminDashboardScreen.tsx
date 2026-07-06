import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { Palette } from '@theme/colors';
import { cardStyles } from '@theme/styles/cards';

export const AdminDashboardScreen = () => {
  const { logout } = useAuthStore();

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Institution Audit Panel</Text>
      <Text style={styles.subtitle}>Super Administrator Console</Text>

      <Card style={cardStyles.dashboardCard}>
        <Text style={cardStyles.cardTitle}>Syllabus Completion Index</Text>
        <Text style={cardStyles.cardSubtitle}>Average completion rate: 74.2% (Target: 80%).</Text>
        <Button mode="contained" compact style={styles.btn}>
          View College Charts
        </Button>
      </Card>

      <Card style={cardStyles.dashboardCard}>
        <Text style={cardStyles.cardTitle}>Export Consolidated Archives</Text>
        <Text style={cardStyles.cardSubtitle}>Generate PDF/CSV dumps for accreditation documentation.</Text>
        <Button mode="outlined" compact style={styles.btn}>
          Generate Exports
        </Button>
      </Card>

      <Button mode="text" onPress={logout} style={styles.logoutBtn} textColor={Palette.error}>
        Sign Out
      </Button>
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
  logoutBtn: {
    marginVertical: 24,
  },
});
