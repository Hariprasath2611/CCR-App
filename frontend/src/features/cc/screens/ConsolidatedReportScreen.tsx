import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, List, Button, Divider, ProgressBar } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReportStore, ConsolidatedReport } from '../store/useReportStore';
import { CCStackParamList } from '@navigation/types';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { WeeklyCourseCoverageReportCard } from '../components/WeeklyCourseCoverageReportCard';

import { ms } from '@theme/responsive';

type RouteParams = RouteProp<CCStackParamList, 'ConsolidatedReport'>;
type CCNav = NativeStackNavigationProp<CCStackParamList>;

export const ConsolidatedReportScreen = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<CCNav>();
  const isFocused = useIsFocused();
  
  const classId = route.params?.classId || '3rd Year CSE-A';
  const weekNumber = route.params?.weekNumber || 13;

  const subjectProgressList = useReportStore((state) => state.subjectProgressList);
  const fetchWeeklyProgress = useReportStore((state) => state.fetchWeeklyProgress);

  React.useEffect(() => {
    if (isFocused) {
      fetchWeeklyProgress(classId, weekNumber);
    }
  }, [classId, weekNumber, isFocused]);

  const subjects = subjectProgressList[`${classId}_${weekNumber}`] || [];

  const completedSubmissions = subjects.filter((s) => s.status === 'Submitted').length;
  const totalSubjects = subjects.length;

  const averageCoverage = totalSubjects > 0 
    ? Math.round(subjects.reduce((sum, s) => sum + s.coverage, 0) / totalSubjects) 
    : 0;

  // Build a draft ConsolidatedReport representation for pre-submission review
  const draftReport: ConsolidatedReport = {
    id: `${classId}_W${weekNumber}`,
    classId,
    weekNumber,
    overallCoverage: averageCoverage,
    submittedBy: 'Class Coordinator',
    submittedAt: new Date().toLocaleDateString(),
    ccRemarks: 'Consolidated class coverage reports compiled. Ready for HOD audit.',
    status: 'PENDING_CC',
    subjects: subjects,
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 75) return Palette.success;
    if (pct >= 50) return Palette.warning;
    return Palette.error;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <WeeklyCourseCoverageReportCard report={draftReport} showDownloadButton={false} />

      <Button
        mode="contained"
        icon="send"
        style={styles.actionBtn}
        onPress={() => navigation.navigate('SubmitToHOD', { reportId: `${classId}_W${weekNumber}` })}
        disabled={totalSubjects === 0}
      >
        Proceed to Submit to HOD
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Off-white premium workspace canvas
  },
  content: {
    padding: ms(16),
    paddingBottom: ms(32),
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    marginBottom: ms(20),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(4) },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: ms(20),
    fontWeight: 'bold',
    color: '#1E293B',
  },
  summarySubtitle: {
    fontSize: ms(12),
    color: '#64748B',
    marginBottom: ms(16),
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ms(12),
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: ms(22),
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: ms(10),
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: ms(2),
  },
  dividerVertical: {
    width: ms(1),
    height: ms(40),
    backgroundColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: ms(13),
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: ms(12),
    marginTop: ms(8),
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    marginBottom: ms(12),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(2) },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subjectLeft: {
    flex: 1,
    paddingRight: ms(8),
  },
  subjectCode: {
    fontSize: ms(11),
    fontWeight: '800',
    color: '#0F52BA',
  },
  subjectName: {
    fontSize: ms(15),
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: ms(2),
  },
  facultyName: {
    fontSize: ms(12),
    color: '#64748B',
    marginTop: ms(2),
  },
  subjectRight: {
    alignItems: 'flex-end',
  },
  coverageText: {
    fontSize: ms(18),
    fontWeight: 'bold',
  },
  statusBadge: {
    borderRadius: ms(6),
    paddingHorizontal: ms(6),
    paddingVertical: ms(2),
    marginTop: ms(4),
  },
  statusText: {
    fontSize: ms(10),
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  progressSection: {
    marginTop: ms(12),
    paddingTop: ms(10),
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ms(6),
  },
  topicsCount: {
    fontSize: ms(12),
    color: '#1E293B',
    fontWeight: '500',
  },
  progressBar: {
    height: ms(6),
    borderRadius: ms(3),
  },
  pendingContainer: {
    marginTop: ms(8),
    backgroundColor: '#FFFBEB',
    borderRadius: ms(6),
    padding: ms(8),
    borderWidth: 0.5,
    borderColor: '#FEF3C7',
  },
  pendingLabel: {
    fontSize: ms(10),
    fontWeight: 'bold',
    color: '#B45309',
    textTransform: 'uppercase',
  },
  pendingValue: {
    fontSize: ms(12),
    color: '#78350F',
    marginTop: ms(2),
  },
  warningText: {
    fontSize: ms(12),
    color: '#EF4444',
    fontStyle: 'italic',
  },
  actionBtn: {
    marginTop: ms(20),
    backgroundColor: '#0F52BA',
    borderRadius: ms(12),
    paddingVertical: ms(6),
    shadowColor: '#0F52BA',
    shadowOffset: { width: ms(0), height: ms(4) },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
});
