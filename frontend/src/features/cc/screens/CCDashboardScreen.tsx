import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, Button, Chip, Avatar, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useReportStore, ConsolidatedReport } from '../store/useReportStore';
import { CCStackParamList } from '@navigation/types';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

type CCNav = NativeStackNavigationProp<CCStackParamList>;

const WEEKS = ['11', '12', '13'];

export const CCDashboardScreen = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<CCNav>();
  
  const reports = useReportStore((state) => state.reports);
  const subjectProgressList = useReportStore((state) => state.subjectProgressList);

  const [selectedWeek, setSelectedWeek] = useState('12');

  const classId = user?.assignedClassId || 'CSE-B';
  const currentProgress = subjectProgressList[`${classId}_${selectedWeek}`] || [];
  const pendingFacultyCount = currentProgress.filter((s) => s.status === 'Pending').length;

  // Status Chip config helper
  const getStatusConfig = (status: string) => {
    if (status === 'Submitted') {
      return { label: 'LOGGED', bgColor: '#ECFDF5', textColor: Palette.success };
    }
    return { label: 'PENDING', bgColor: '#FEF2F2', textColor: Palette.error };
  };

  const getReportStatusLabel = (status: ConsolidatedReport['status']) => {
    switch (status) {
      case 'SENT_TO_ADMIN':
        return { label: 'Approved by Principal', color: '#E6F4EA', textColor: Palette.success };
      case 'SUBMITTED_TO_HOD':
        return { label: 'Awaiting HOD Approval', color: '#FFF3E0', textColor: Palette.warning };
      case 'RETURNED_BY_HOD':
        return { label: 'Revision Required', color: '#FCE8E6', textColor: Palette.error };
      case 'REJECTED_BY_HOD':
        return { label: 'Rejected by HOD', color: '#FCE8E6', textColor: Palette.error };
      default:
        return { label: 'Pending CC Submission', color: '#F1F5F9', textColor: Palette.textLight };
    }
  };

  // Find if a consolidated report has already been created/submitted for the selected week
  const compiledReport = reports.find((r) => r.classId === classId && r.weekNumber === parseInt(selectedWeek));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── HEADER BANNER ── */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.headerInfo}>
            <Text style={styles.welcomeGreeting}>Class Coordinator Dashboard</Text>
            <Text style={styles.classLabel}>Class: {classId}</Text>
            <Text style={styles.ccName}>Coordinator: {user?.name || 'Faculty Member'}</Text>
          </View>
          <Avatar.Text
            size={48}
            label={user?.name ? user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'CC'}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
        </View>
      </View>

      {/* ── WEEK SELECTOR BAR ── */}
      <Text style={styles.sectionTitle}>Select Academic Week</Text>
      <View style={styles.weekSelectorContainer}>
        {WEEKS.map((wk) => {
          const isSelected = selectedWeek === wk;
          return (
            <TouchableOpacity
              key={wk}
              onPress={() => setSelectedWeek(wk)}
              style={[styles.weekBtn, isSelected && styles.weekBtnActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.weekBtnText, isSelected && styles.weekBtnTextActive]}>
                Week {wk}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── SUBJECT CARDS PROGRESS OVERVIEW ── */}
      <Text style={styles.sectionTitle}>Handled Subjects Summary</Text>
      <View style={styles.subjectsGrid}>
        {currentProgress.length === 0 ? (
          <Text style={styles.emptyText}>No subjects progress recorded for Week {selectedWeek}.</Text>
        ) : (
          currentProgress.map((subj) => (
            <Card key={subj.code} style={styles.subjectMiniCard}>
              <Card.Content style={styles.miniCardContent}>
                <View style={styles.miniCardTop}>
                  <Text style={styles.miniCode}>{subj.code}</Text>
                  <Chip 
                    compact 
                    style={{ backgroundColor: getStatusConfig(subj.status).bgColor }}
                    textStyle={{ fontSize: 9, color: getStatusConfig(subj.status).textColor, fontWeight: '800' }}
                  >
                    {getStatusConfig(subj.status).label}
                  </Chip>
                </View>
                <Text style={styles.miniName} numberOfLines={1}>{subj.name}</Text>
                <View style={styles.progressRow}>
                  <Text style={styles.progressText}>Coverage: {subj.coverage}%</Text>
                  <Text style={styles.unitText}>{subj.completedTopicsCount}/{subj.totalTopicsCount} topics</Text>
                </View>
                <ProgressBar progress={subj.coverage / 100} color={subj.status === 'Submitted' ? Palette.primary : Palette.error} style={styles.miniProgress} />
              </Card.Content>
            </Card>
          ))
        )}
      </View>

      {/* ── DETAIL STATUS TABLE ── */}
      <Text style={styles.sectionTitle}>Faculty Status Table Details</Text>
      <Card style={styles.tableCard}>
        <Card.Content style={styles.tableContent}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.cellSubject, styles.headerCellText]}>Subject / Code</Text>
            <Text style={[styles.tableCell, styles.cellFaculty, styles.headerCellText]}>Assigned Faculty</Text>
            <Text style={[styles.tableCell, styles.cellCoverage, styles.headerCellText]}>Coverage</Text>
            <Text style={[styles.tableCell, styles.cellStatus, styles.headerCellText]}>Status</Text>
          </View>
          
          {/* Table Rows */}
          {currentProgress.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyRowText}>No progress data to display.</Text>
            </View>
          ) : (
            currentProgress.map((item, index) => {
              const statusCfg = getStatusConfig(item.status);
              const isEven = index % 2 === 0;
              return (
                <View key={item.code} style={[styles.tableRow, isEven && styles.rowAlternate]}>
                  {/* Subject */}
                  <View style={styles.cellSubject}>
                    <Text style={styles.rowSubjectName}>{item.name}</Text>
                    <Text style={styles.rowSubjectCode}>{item.code}</Text>
                  </View>
                  {/* Faculty */}
                  <Text style={[styles.tableCell, styles.cellFaculty, styles.rowFacultyText]}>
                    {item.faculty}
                  </Text>
                  {/* Coverage */}
                  <View style={styles.cellCoverage}>
                    <Text style={styles.rowCoverageText}>{item.coverage}%</Text>
                    <ProgressBar progress={item.coverage / 100} color={Palette.primary} style={styles.rowProgressBar} />
                  </View>
                  {/* Status */}
                  <View style={styles.cellStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.bgColor }]}>
                      <Text style={[styles.statusBadgeText, { color: statusCfg.textColor }]}>
                        {statusCfg.label}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </Card.Content>
      </Card>

      {/* ── WEEKLY REPORT CONSOLIDATION CONTROL ── */}
      <Text style={styles.sectionTitle}>Weekly Report Submission</Text>
      <Card style={styles.consolidationCard}>
        <Card.Content>
          <View style={styles.consolidationTop}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Submission Status:</Text>
              {compiledReport ? (
                <Chip
                  compact
                  style={{ backgroundColor: getReportStatusLabel(compiledReport.status).color }}
                  textStyle={{ fontSize: 11, color: getReportStatusLabel(compiledReport.status).textColor, fontWeight: '800' }}
                >
                  {getReportStatusLabel(compiledReport.status).label}
                </Chip>
              ) : (
                <Chip compact style={{ backgroundColor: '#F1F5F9' }} textStyle={{ fontSize: 11, color: Palette.textLight, fontWeight: '800' }}>
                  NOT COMPILED
                </Chip>
              )}
            </View>

            {pendingFacultyCount > 0 ? (
              <View style={[styles.notificationBox, styles.warningBox]}>
                <Feather name="alert-triangle" size={16} color="#D97706" />
                <Text style={styles.notificationText}>
                  {pendingFacultyCount} faculty members are yet to log progress.
                </Text>
              </View>
            ) : (
              <View style={[styles.notificationBox, styles.successBox]}>
                <Feather name="check-circle" size={16} color="#10B981" />
                <Text style={[styles.notificationText, { color: '#10B981' }]}>
                  All faculty logs have been successfully submitted for this week.
                </Text>
              </View>
            )}
          </View>

          {compiledReport ? (
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('ConsolidatedReport', { classId, weekNumber: parseInt(selectedWeek) })}
              style={styles.actionBtn}
              textColor={Palette.primary}
              icon="eye-outline"
            >
              View Consolidated Report
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ConsolidatedReport', { classId, weekNumber: parseInt(selectedWeek) })}
              style={[styles.actionBtn, { backgroundColor: Palette.primary }]}
              icon="clipboard-edit-outline"
            >
              Compile & Submit to HOD
            </Button>
          )}
        </Card.Content>
      </Card>
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

  // Header Banner
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerInfo: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  classLabel: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.textDark,
    marginTop: 2,
    letterSpacing: -0.4,
  },
  ccName: {
    fontSize: 13,
    color: Palette.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  avatar: {
    backgroundColor: Palette.primary,
    elevation: 2,
  },
  avatarLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Section titles
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.textLight,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingLeft: 4,
  },

  // Week Selector
  weekSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
  },
  weekBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#F1F5F9',
  },
  weekBtnActive: {
    backgroundColor: Palette.primary,
  },
  weekBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textLight,
  },
  weekBtnTextActive: {
    color: '#FFFFFF',
  },

  // Subjects Grid
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  subjectMiniCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  miniCardContent: {
    padding: 12,
  },
  miniCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  miniCode: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.primary,
  },
  miniName: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.textDark,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 10,
    color: Palette.textLight,
    fontWeight: '700',
  },
  unitText: {
    fontSize: 10,
    color: Palette.textLight,
    fontWeight: '500',
  },
  miniProgress: {
    height: 4,
    borderRadius: 2,
  },
  emptyText: {
    color: Palette.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 20,
  },

  // Table styling
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 1,
    overflow: 'hidden',
  },
  tableContent: {
    padding: 0,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  tableHeader: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1.5,
    borderBottomColor: '#CBD5E1',
  },
  rowAlternate: {
    backgroundColor: '#F8FAFC',
  },
  headerCellText: {
    fontWeight: '800',
    color: Palette.textLight,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 12.5,
    color: Palette.textDark,
  },
  cellSubject: {
    width: '28%',
    paddingRight: 6,
  },
  cellFaculty: {
    width: '32%',
    paddingRight: 6,
  },
  cellCoverage: {
    width: '24%',
    paddingRight: 6,
  },
  cellStatus: {
    width: '16%',
    alignItems: 'center',
  },
  rowSubjectName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Palette.textDark,
  },
  rowSubjectCode: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.primary,
    marginTop: 1,
  },
  rowFacultyText: {
    fontWeight: '600',
    color: Palette.textDark,
  },
  rowCoverageText: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.textDark,
    textAlign: 'left',
  },
  rowProgressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  emptyRow: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyRowText: {
    fontSize: 13,
    color: Palette.textLight,
    fontStyle: 'italic',
  },

  // Consolidation Submission
  consolidationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
  },
  consolidationTop: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textDark,
  },
  notificationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  warningBox: {
    backgroundColor: '#FFFBEB',
  },
  successBox: {
    backgroundColor: '#ECFDF5',
  },
  notificationText: {
    fontSize: 12,
    color: '#D97706',
    marginLeft: 8,
    fontWeight: '600',
    flex: 1,
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 4,
  },
});

export default CCDashboardScreen;
