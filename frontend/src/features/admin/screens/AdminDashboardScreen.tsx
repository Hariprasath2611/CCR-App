import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, Divider, Button } from 'react-native-paper';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useReportStore } from '@features/cc/store/useReportStore';
import { Palette } from '@theme/colors';
import { cardStyles } from '@theme/styles/cards';

export const AdminDashboardScreen = () => {
  const { logout } = useAuthStore();
  const reports = useReportStore((state) => state.reports);

  // Filter reports that have been approved and sent to the admin by the HOD
  const adminReports = reports.filter((r) => r.status === 'SENT_TO_ADMIN');

  const getProgressColor = (pct: number) => {
    if (pct >= 75) return Palette.success;
    if (pct >= 50) return Palette.warning;
    return Palette.error;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>Institution Audit Panel</Text>
      <Text style={styles.subtitle}>Super Administrator Console</Text>

      {/* Syllabus Completion Summary Card */}
      <Card style={cardStyles.dashboardCard}>
        <Card.Content>
          <Text style={cardStyles.cardTitle}>Syllabus Completion Index</Text>
          <Text style={cardStyles.cardSubtitle}>
            Current institution average completion rate: 74.2% (Target: 80%).
          </Text>
        </Card.Content>
      </Card>

      {/* CC/HOD Reports Auditing List */}
      <Text style={styles.sectionTitle}>HOD Approved Weekly Reports</Text>

      {adminReports.length === 0 ? (
        <Text style={styles.emptyText}>No reports approved by HODs yet.</Text>
      ) : (
        adminReports.map((report) => (
          <Card key={report.id} style={styles.auditCard}>
            <Card.Content>
              <View style={styles.auditHeader}>
                <View>
                  <Text style={styles.classTitle}>{report.classId} · Week {report.weekNumber}</Text>
                  <Text style={styles.submittedBy}>CC: {report.submittedBy}</Text>
                </View>
                <Chip
                  compact
                  style={[styles.coverageChip, { backgroundColor: getProgressColor(report.overallCoverage) + '15' }]}
                  textStyle={{ color: getProgressColor(report.overallCoverage), fontWeight: 'bold' }}
                >
                  {report.overallCoverage}% Avg
                </Chip>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.remarkBox}>
                <Text style={styles.remarkTitle}>HOD Remarks & Approval:</Text>
                <Text style={styles.remarkContent}>
                  "{report.hodRemarks || 'Approved with no remarks.'}"
                </Text>
                <Text style={styles.approvalDate}>Approved Date: {report.approvedAt}</Text>
              </View>

              <Divider style={styles.divider} />

              <Text style={styles.subjectsTitle}>Subject Details:</Text>
              {report.subjects.map((subj) => (
                <View key={subj.code} style={styles.subjectRow}>
                  <Text style={styles.subjectText}>
                    {subj.code} - {subj.name}
                  </Text>
                  <Text style={[styles.subjectCoverage, { color: getProgressColor(subj.coverage) }]}>
                    {subj.coverage}%
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        ))
      )}

      <Button mode="text" onPress={logout} style={styles.logoutBtn} textColor={Palette.error}>
        Sign Out
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 16,
  },
  emptyText: {
    color: Palette.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  auditCard: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Palette.textDark,
  },
  submittedBy: {
    fontSize: 12,
    color: Palette.textLight,
    marginTop: 2,
  },
  coverageChip: {
    alignSelf: 'center',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: Palette.border,
  },
  remarkBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: Palette.success,
  },
  remarkTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Palette.success,
    textTransform: 'uppercase',
  },
  remarkContent: {
    fontSize: 13,
    color: Palette.textDark,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },
  approvalDate: {
    fontSize: 11,
    color: Palette.textLight,
    marginTop: 6,
  },
  subjectsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textLight,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  subjectText: {
    fontSize: 13,
    color: Palette.textDark,
    flex: 1,
  },
  subjectCoverage: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  logoutBtn: {
    marginVertical: 24,
  },
});
