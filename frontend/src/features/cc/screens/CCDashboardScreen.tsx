import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Avatar, Button } from 'react-native-paper';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useReportStore, ConsolidatedReport } from '../store/useReportStore';
import { CCStackParamList } from '@navigation/types';
import { Palette } from '@theme/colors';
import { WeeklyCourseCoverageReportCard } from '../components/WeeklyCourseCoverageReportCard';
import { getCCForSection, getHODForYear } from '@config/facultyBoard';

import { ms } from '@theme/responsive';

type CCNav = NativeStackNavigationProp<CCStackParamList>;

export const CCDashboardScreen = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  
  const reports = useReportStore((state) => state.reports);
  const subjectProgressList = useReportStore((state) => state.subjectProgressList);
  const fetchWeeklyProgress = useReportStore((state) => state.fetchWeeklyProgress);

  const classId = user?.assignedClassId || '1st Year SEC-B';
  const selectedWeek = '12'; // Default consolidated view week
  const ccInfo = getCCForSection(classId);
  const hodInfo = getHODForYear(classId);

  React.useEffect(() => {
    if (isFocused) {
      fetchWeeklyProgress(classId, parseInt(selectedWeek));
    }
  }, [classId, selectedWeek, isFocused]);

  const currentProgress = subjectProgressList[`${classId}_${selectedWeek}`] || [];

  const averageCoverage = currentProgress.length > 0 
    ? Math.round(currentProgress.reduce((sum, s) => sum + s.coverage, 0) / currentProgress.length) 
    : 80;

  // Build the draft report representation for the class counselor dashboard content
  const draftReport: ConsolidatedReport = {
    id: `${classId}_W${selectedWeek}`,
    classId,
    weekNumber: parseInt(selectedWeek),
    overallCoverage: averageCoverage,
    submittedBy: user?.name || ccInfo?.facultyName || 'Class Counselor',
    submittedAt: new Date().toLocaleDateString(),
    ccRemarks: 'Consolidated class course coverage reports compiled.',
    status: 'PENDING_CC',
    subjects: currentProgress,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── HEADER BANNER ── */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.headerInfo}>
            <Text style={styles.welcomeGreeting}>Class Counselor Dashboard</Text>
            <Text style={styles.classLabel}>Class: {classId}</Text>
            <Text style={styles.ccName}>CC Counselor: {user?.name || ccInfo?.facultyName || 'Faculty Member'}</Text>
            <Text style={{ fontSize: ms(12), color: '#64748B', fontWeight: '600', marginTop: ms(2) }}>
              HOD: {hodInfo.hodName} ({hodInfo.department})
            </Text>
          </View>
          <Avatar.Text
            size={48}
            label={user?.name ? user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'CC'}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
        </View>

        {/* Dynamic Class Summary Box */}
        <View style={styles.statsSummaryBox}>
          <View style={styles.statItem}>
            <Text style={styles.statItemNum}>{currentProgress.length || 6}</Text>
            <Text style={styles.statItemLabel}>Class Subjects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statItemNum, { color: Palette.primary }]}>{averageCoverage}%</Text>
            <Text style={styles.statItemLabel}>Average Coverage</Text>
          </View>
        </View>
      </View>

      {/* ── CONSOLIDATED REPORT CONTENT ── */}
      <Text style={styles.sectionTitle}>Week {selectedWeek} Consolidated Spreadsheet</Text>
      <WeeklyCourseCoverageReportCard report={draftReport} showDownloadButton={false} />

      {/* ── ACTIONS BUTTON ROW ── */}
      <View style={styles.buttonRow}>
        <Button
          mode="contained"
          icon="send"
          style={[styles.actionBtn, styles.submitBtn]}
          onPress={() => navigation.navigate('StaffHome', {
            screen: 'SubmitToHOD',
            params: { reportId: `${classId}_W${selectedWeek}` }
          })}
          labelStyle={styles.btnLabel}
        >
          Submit to HOD
        </Button>
        
        <Button
          mode="outlined"
          icon="file-pdf-box"
          style={[styles.actionBtn, styles.exportBtn]}
          onPress={() => navigation.navigate('StaffHome', {
            screen: 'ReportExport',
            params: { reportId: `${classId}_W${selectedWeek}` }
          })}
          textColor={Palette.primary}
          labelStyle={styles.btnLabelOutlined}
        >
          Export Report
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: ms(16),
    paddingBottom: ms(40),
  },

  // Header Banner
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(24),
    padding: ms(20),
    marginBottom: ms(20),
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(8) },
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
    fontSize: ms(12),
    fontWeight: '700',
    color: Palette.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  classLabel: {
    fontSize: ms(22),
    fontWeight: '900',
    color: Palette.textDark,
    marginTop: ms(2),
    letterSpacing: -0.4,
  },
  ccName: {
    fontSize: ms(13),
    color: Palette.primary,
    fontWeight: '700',
    marginTop: ms(2),
  },
  avatar: {
    backgroundColor: Palette.primary,
    elevation: 2,
  },
  avatarLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Dynamic Summary Stats Box
  statsSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: ms(16),
    paddingVertical: ms(12),
    paddingHorizontal: ms(16),
    marginTop: ms(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statItemNum: {
    fontSize: ms(20),
    fontWeight: '900',
    color: Palette.textDark,
  },
  statItemLabel: {
    fontSize: ms(11),
    fontWeight: '600',
    color: Palette.textLight,
    marginTop: ms(2),
  },
  statDivider: {
    width: 1,
    height: ms(24),
    backgroundColor: '#CBD5E1',
  },

  // Section title
  sectionTitle: {
    fontSize: ms(12),
    fontWeight: '800',
    color: Palette.textLight,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    marginBottom: ms(12),
    paddingLeft: ms(4),
  },

  // Action Buttons Row
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: ms(20),
    width: '100%',
  },
  actionBtn: {
    flex: 0.48,
    borderRadius: ms(12),
    paddingVertical: ms(4),
  },
  submitBtn: {
    backgroundColor: Palette.primary,
  },
  exportBtn: {
    borderColor: Palette.primary,
    borderWidth: 1.5,
  },
  btnLabel: {
    fontSize: ms(13),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnLabelOutlined: {
    fontSize: ms(13),
    fontWeight: '800',
  },
});

export default CCDashboardScreen;
