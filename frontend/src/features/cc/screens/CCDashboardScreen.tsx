import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Text, Card, Button, Chip, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useReportStore, ConsolidatedReport } from '../store/useReportStore';
import { CCStackParamList } from '@navigation/types';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

type CCNav = NativeStackNavigationProp<CCStackParamList>;

export const CCDashboardScreen = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<CCNav>();
  const reports = useReportStore((state) => state.reports);
  const subjectProgressList = useReportStore((state) => state.subjectProgressList);

  const classId = user?.assignedClassId || 'CSE-B';
  const currentWeek = 13; // Current Week we want to compile

  // Find subject progress for the current week to check how many are pending
  const currentProgress = subjectProgressList[`${classId}_${currentWeek}`] || [];
  const pendingFacultyCount = currentProgress.filter((s) => s.status === 'Pending').length;

  const getStatusChip = (status: ConsolidatedReport['status']) => {
    switch (status) {
      case 'SENT_TO_ADMIN':
        return { label: 'Approved & Sent to Admin', color: '#E6F4EA', textColor: Palette.success };
      case 'SUBMITTED_TO_HOD':
        return { label: 'Awaiting HOD Review', color: '#FFF3E0', textColor: Palette.warning };
      case 'RETURNED_BY_HOD':
        return { label: 'Returned by HOD', color: '#FCE8E6', textColor: Palette.error };
      case 'REJECTED_BY_HOD':
        return { label: 'Rejected', color: '#FCE8E6', textColor: Palette.error };
      default:
        return { label: 'Draft', color: '#F1F5F9', textColor: Palette.textLight };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Avatar.Icon size={50} icon="shield-star" style={styles.avatar} color="#FFFFFF" />
        <View style={styles.headerText}>
          <Text style={styles.welcome}>Class Coordinator Board</Text>
          <Text style={styles.className}>Section: {classId}</Text>
        </View>
      </View>

      {/* Week consolidation status card */}
      <Card style={styles.actionCard}>
        <Card.Content>
          <Text style={styles.actionCardTitle}>Week {currentWeek} Consolidated Report</Text>
          {pendingFacultyCount > 0 ? (
            <View style={styles.alertRow}>
              <Feather name="alert-circle" size={18} color={Palette.warning} />
              <Text style={styles.alertText}>
                {pendingFacultyCount} faculty member progress logs are pending for Week {currentWeek}.
              </Text>
            </View>
          ) : (
            <View style={styles.alertRow}>
              <Feather name="check-circle" size={18} color={Palette.success} />
              <Text style={[styles.alertText, { color: Palette.success }]}>
                All faculty have logged progress for Week {currentWeek}!
              </Text>
            </View>
          )}

          <Button
            mode="contained"
            style={styles.compileBtn}
            onPress={() => navigation.navigate('ConsolidatedReport', { classId, weekNumber: currentWeek })}
            icon="clipboard-text-outline"
          >
            Compile & Submit Report
          </Button>
        </Card.Content>
      </Card>

      {/* Previously Submitted Reports Section */}
      <Text style={styles.sectionTitle}>Submission History</Text>
      
      {reports.filter(r => r.classId === classId).length === 0 ? (
        <Text style={styles.emptyText}>No reports submitted yet.</Text>
      ) : (
        reports
          .filter(r => r.classId === classId)
          .map((report) => {
            const statusConfig = getStatusChip(report.status);
            return (
              <Card key={report.id} style={styles.reportCard}>
                <Card.Content>
                  <View style={styles.reportHeader}>
                    <Text style={styles.reportTitle}>Week {report.weekNumber} Report</Text>
                    <Chip
                      compact
                      style={{ backgroundColor: statusConfig.color }}
                      textStyle={{ fontSize: 11, color: statusConfig.textColor, fontWeight: '700' }}
                    >
                      {statusConfig.label}
                    </Chip>
                  </View>

                  <View style={styles.reportStatsRow}>
                    <Text style={styles.reportStatLabel}>Overall Coverage: </Text>
                    <Text style={styles.reportStatVal}>{report.overallCoverage}%</Text>
                    <Text style={styles.reportDate}> · Submitted: {report.submittedAt}</Text>
                  </View>

                  {report.ccRemarks && (
                    <Text style={styles.reportRemarks} numberOfLines={2}>
                      CC Remarks: <Text style={{ fontWeight: 'normal', color: Palette.textLight }}>{report.ccRemarks}</Text>
                    </Text>
                  )}

                  {report.hodRemarks && (
                    <View style={styles.hodRemarksContainer}>
                      <Text style={styles.hodRemarksTitle}>HOD Remarks:</Text>
                      <Text style={styles.hodRemarksText}>{report.hodRemarks}</Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          })
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: Palette.primary,
  },
  headerText: {
    marginLeft: 14,
  },
  welcome: {
    fontSize: 14,
    color: Palette.textLight,
  },
  className: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Palette.textDark,
  },
  actionCard: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Palette.textDark,
    marginBottom: 10,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingRight: 10,
  },
  alertText: {
    fontSize: 13,
    color: '#D97706',
    marginLeft: 8,
    lineHeight: 18,
    flex: 1,
  },
  compileBtn: {
    backgroundColor: Palette.primary,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  emptyText: {
    color: Palette.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  reportCard: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1.5,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Palette.textDark,
  },
  reportStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reportStatLabel: {
    fontSize: 13,
    color: Palette.textLight,
  },
  reportStatVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Palette.primary,
  },
  reportDate: {
    fontSize: 12,
    color: Palette.textLight,
  },
  reportRemarks: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Palette.textDark,
    lineHeight: 16,
  },
  hodRemarksContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: Palette.border,
  },
  hodRemarksTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Palette.error,
    textTransform: 'uppercase',
  },
  hodRemarksText: {
    fontSize: 12,
    color: Palette.textDark,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
