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
    <View style={styles.container}>
      {/* ── Abstract Background Designs & Orbs ── */}
      <View style={styles.topOrb} />
      <View style={styles.centerLeftOrb} />
      <View style={styles.bottomRightOrb} />
      <View style={styles.bottomLeftOrb} />

      {/* ── Header Banner ── */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTextCol}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.ccName}>
              {user?.name ? user.name.split(' ')[0] : 'Coordinator'} 👋
            </Text>
            <Text style={styles.roleText}>{classId} · Class Coordinator</Text>
          </View>
          <Avatar.Text
            size={44}
            label={user?.name ? user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'CC'}
            style={styles.avatar}
            color="#0F52BA"
          />
        </View>
      </View>

      {/* ── Content Card overlapping Header ── */}
      <View style={styles.contentWrapper}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Week consolidation status card */}
          <Card style={styles.actionCard}>
            <Card.Content>
              <Text style={styles.actionCardTitle}>Week {currentWeek} Consolidated Report</Text>
              
              {pendingFacultyCount > 0 ? (
                <View style={styles.alertRow}>
                  <View style={[styles.iconIndicator, { backgroundColor: '#FEF3C7' }]}>
                    <Feather name="alert-circle" size={18} color="#D97706" />
                  </View>
                  <Text style={styles.alertText}>
                    {pendingFacultyCount} faculty member progress logs are pending for Week {currentWeek}.
                  </Text>
                </View>
              ) : (
                <View style={styles.alertRow}>
                  <View style={[styles.iconIndicator, { backgroundColor: '#D1FAE5' }]}>
                    <Feather name="check-circle" size={18} color="#10B981" />
                  </View>
                  <Text style={[styles.alertText, { color: '#10B981', fontWeight: '600' }]}>
                    All faculty have logged progress for Week {currentWeek}!
                  </Text>
                </View>
              )}

              <Button
                mode="contained"
                style={styles.compileBtn}
                labelStyle={styles.compileBtnLabel}
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
                          textStyle={{ fontSize: 10, color: statusConfig.textColor, fontWeight: '800' }}
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
                          CC Remarks: <Text style={{ fontWeight: 'normal', color: '#64748B' }}>{report.ccRemarks}</Text>
                        </Text>
                      )}

                      {report.hodRemarks && (
                        <View style={styles.hodRemarksContainer}>
                          <Text style={styles.hodRemarksTitle}>HOD Feedback Remarks:</Text>
                          <Text style={styles.hodRemarksText}>"{report.hodRemarks}"</Text>
                        </View>
                      )}
                    </Card.Content>
                  </Card>
                );
              })
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F52BA', // Royal/Sapphire Blue matching design
  },
  // Abstract BG Shapes
  topOrb: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#3B82F6',
    opacity: 0.25,
    zIndex: 0,
  },
  centerLeftOrb: {
    position: 'absolute',
    top: 250,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#60A5FA',
    opacity: 0.15,
    zIndex: 0,
  },
  bottomRightOrb: {
    position: 'absolute',
    bottom: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#EEF2FF',
    opacity: 0.9,
    zIndex: 0,
  },
  bottomLeftOrb: {
    position: 'absolute',
    bottom: 120,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECFDF5',
    opacity: 0.6,
    zIndex: 0,
  },

  header: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 40,
    zIndex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  welcomeText: {
    color: '#C8D8F5',
    fontSize: 14,
    fontWeight: '500',
  },
  ccName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
  },
  roleText: {
    color: '#C8D8F5',
    fontSize: 14,
    marginTop: 2,
  },
  avatar: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  contentWrapper: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Premium off-white workspace canvas
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -15,
    zIndex: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },

  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FAF9F6',
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#F1F5F9',
  },
  iconIndicator: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  alertText: {
    fontSize: 13,
    color: '#D97706',
    lineHeight: 18,
    flex: 1,
  },
  compileBtn: {
    backgroundColor: '#0F52BA',
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: '#0F52BA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  compileBtnLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginTop: 8,
  },
  emptyText: {
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  reportStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportStatLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  reportStatVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F52BA',
  },
  reportDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  reportRemarks: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 16,
  },
  hodRemarksContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
  },
  hodRemarksTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  hodRemarksText: {
    fontSize: 12,
    color: '#DC2626',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
