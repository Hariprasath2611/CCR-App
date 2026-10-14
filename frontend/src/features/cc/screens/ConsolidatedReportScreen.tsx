import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReportStore, ConsolidatedReport } from '../store/useReportStore';
import { CCStackParamList } from '@navigation/types';
import { EditorialColors, EditorialFonts, EditorialSpacing } from '@theme/editorial';
import { Rule } from '@components/editorial/Rule';
import { Label } from '@components/editorial/Label';
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── HEADER ── */}
      <View style={styles.headerBox}>
        <Label text="CONSOLIDATED REVIEW" />
        <Text style={styles.headingText}>CLASS COVERAGE AUDIT.</Text>
        <Text style={styles.subHeadingText}>
          CLASS: {classId.toUpperCase()} · ACADEMIC WEEK {weekNumber}
        </Text>
      </View>
      <Rule thick style={styles.heroRule} />

      {/* ── REPORT CARD PREVIEW ── */}
      <WeeklyCourseCoverageReportCard report={draftReport} showDownloadButton={false} />

      {/* ── ACTION BUTTON ── */}
      <View style={styles.buttonContainer}>
        <AppButton
          mode="contained"
          title="PROCEED TO SUBMIT TO HOD"
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
    backgroundColor: EditorialColors.bg,
  },
  content: {
    paddingHorizontal: EditorialSpacing.screenHorizontal,
    paddingTop: EditorialSpacing.topSafeArea,
    paddingBottom: ms(48),
  },
  headerBox: {
    marginBottom: ms(8),
  },
  headingText: {
    fontFamily: EditorialFonts.display,
    fontSize: ms(24),
    lineHeight: ms(28),
    color: EditorialColors.ink,
    marginTop: ms(4),
  },
  subHeadingText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: ms(11),
    color: EditorialColors.muted,
    letterSpacing: 0.5,
    marginTop: ms(4),
  },
  heroRule: {
    marginBottom: ms(20),
  },
  buttonContainer: {
    marginTop: ms(24),
  },
});

