import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReportStore, ConsolidatedReport } from '../store/useReportStore';
import { CCStackParamList } from '@navigation/types';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { AppButton } from '@components/common/AppButton';
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={styles.headerBox}>
        <Text style={styles.captionText}>CONSOLIDATED REVIEW</Text>
        <Text style={styles.headingText}>Class Coverage Audit</Text>
        <Text style={styles.subHeadingText}>
          {classId} · Academic Week {weekNumber}
        </Text>
      </View>

      {/* ── REPORT CARD PREVIEW ── */}
      <WeeklyCourseCoverageReportCard report={draftReport} showDownloadButton={false} />

      {/* ── ACTION BUTTON ── */}
      <View style={styles.buttonContainer}>
        <AppButton
          mode="contained"
          title="Proceed to Submit to HOD"
          onPress={() => navigation.navigate('SubmitToHOD', { reportId: `${classId}_W${weekNumber}` })}
          disabled={totalSubjects === 0}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  content: {
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
    paddingTop: DayRibbonSpacing.screenTop,
    paddingBottom: ms(48),
  },
  headerBox: {
    marginBottom: ms(16),
  },
  captionText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headingText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(26),
    color: DayRibbonColors.ink,
    marginTop: ms(4),
  },
  subHeadingText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    color: DayRibbonColors.muted,
    marginTop: ms(4),
  },
  buttonContainer: {
    marginTop: ms(20),
  },
});

export default ConsolidatedReportScreen;
