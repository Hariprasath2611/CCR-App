import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, List, Button, Divider, ProgressBar } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReportStore, ConsolidatedReport } from '../store/useReportStore';
import { CCStackParamList } from '@navigation/types';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { WeeklyCourseCoverageReportCard } from '../components/WeeklyCourseCoverageReportCard';

type RouteParams = RouteProp<CCStackParamList, 'ConsolidatedReport'>;
type CCNav = NativeStackNavigationProp<CCStackParamList>;

export const ConsolidatedReportScreen = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<CCNav>();
  
  const classId = route.params?.classId || '3rd Year CSE-A';
  const weekNumber = route.params?.weekNumber || 13;

  const subjectProgressList = useReportStore((state) => state.subjectProgressList);
  const fetchWeeklyProgress = useReportStore((state) => state.fetchWeeklyProgress);

  React.useEffect(() => {
    fetchWeeklyProgress(classId, weekNumber);
  }, [classId, weekNumber]);

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
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  dividerVertical: {
    width: 1,
    height: 40,
    backgroundColor: '#F1F5F9',
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
  subjectCard: {
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
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subjectLeft: {
    flex: 1,
    paddingRight: 8,
  },
  subjectCode: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F52BA',
  },
  subjectName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 2,
  },
  facultyName: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  subjectRight: {
    alignItems: 'flex-end',
  },
  coverageText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  progressSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  topicsCount: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  pendingContainer: {
    marginTop: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 6,
    padding: 8,
    borderWidth: 0.5,
    borderColor: '#FEF3C7',
  },
  pendingLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#B45309',
    textTransform: 'uppercase',
  },
  pendingValue: {
    fontSize: 12,
    color: '#78350F',
    marginTop: 2,
  },
  warningText: {
    fontSize: 12,
    color: '#EF4444',
    fontStyle: 'italic',
  },
  actionBtn: {
    marginTop: 20,
    backgroundColor: '#0F52BA',
    borderRadius: 12,
    paddingVertical: 6,
    shadowColor: '#0F52BA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
});
