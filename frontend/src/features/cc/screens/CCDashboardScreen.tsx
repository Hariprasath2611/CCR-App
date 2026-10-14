import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useReportStore, ConsolidatedReport } from '../store/useReportStore';
import { CCStackParamList } from '@navigation/types';
import { WeeklyCourseCoverageReportCard } from '../components/WeeklyCourseCoverageReportCard';
import { getCCForSection, getHODForYear, FIRST_YEAR_CC_BOARD, CSE_3RD_YEAR_CC_BOARD } from '@config/facultyBoard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { BigNumber } from '@components/editorial/BigNumber';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { Feather } from '@expo/vector-icons';

type CCNav = NativeStackNavigationProp<CCStackParamList>;

export const CCDashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const reports = useReportStore((state) => state.reports);
  const subjectProgressList = useReportStore((state) => state.subjectProgressList);
  const fetchWeeklyProgress = useReportStore((state) => state.fetchWeeklyProgress);

  const userCC = FIRST_YEAR_CC_BOARD.find(cc => cc.email.toLowerCase() === user?.email?.toLowerCase())
    || CSE_3RD_YEAR_CC_BOARD.find(cc => cc.email.toLowerCase() === user?.email?.toLowerCase());

  const classId = user?.assignedClassId || userCC?.classId || '1st Year SEC-A';
  const selectedWeek = '12';
  const ccInfo = getCCForSection(classId) || userCC;
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
    <View style={styles.screenWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor={EditorialColors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, EditorialSpacing.topSafeArea),
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Meta Bar */}
        <View style={styles.topMetaRow}>
          <View>
            <Label text="CLASS COUNSELOR DASHBOARD" />
            <Text style={styles.screenHeadline}>{classId}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>WEEK {selectedWeek}</Text>
          </View>
        </View>

        <Text style={styles.metaSubtext}>
          COUNSELOR: {user?.name || ccInfo?.facultyName || 'FACULTY MEMBER'} • HOD: {hodInfo.hodName.toUpperCase()}
        </Text>

        {/* 1px Hairline Rule */}
        <Rule thickness="hairline" style={styles.hairlineSpacer} />

        {/* Hero Section: Average Class Coverage */}
        <View style={styles.heroSection}>
          <Label text="AVERAGE CLASS COVERAGE" />
          <View style={styles.heroRow}>
            <BigNumber value={averageCoverage} size="hero" showPercent />
          </View>
        </View>

        {/* 4px Heavy Ink Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* 3-Column Stat Row */}
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{currentProgress.length || 6}</Text>
            <Label text="COURSES" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>W-{selectedWeek}</Text>
            <Label text="PERIOD" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>100%</Text>
            <Label text="TARGET" />
          </View>
        </View>

        {/* 1px Hairline Rule */}
        <Rule thickness="hairline" style={styles.hairlineSpacer} />

        {/* Quick Action: Allocate Faculty */}
        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => navigation.navigate('FacultyAllocation')}
          activeOpacity={0.7}
        >
          <Text style={styles.outlineBtnText}>MANAGE & ALLOCATE FACULTY</Text>
          <Feather name="users" size={16} color={EditorialColors.ink} />
        </TouchableOpacity>

        {/* Section Title */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>WEEK {selectedWeek} CONSOLIDATED SPREADSHEET</Text>
          <Label text="ACADEMIC LOG" />
        </View>

        {/* Consolidated Report Card */}
        <View style={styles.reportCardWrapper}>
          <WeeklyCourseCoverageReportCard report={draftReport} showDownloadButton={false} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionBlock}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate('StaffHome', {
                screen: 'SubmitToHOD',
                params: { reportId: `${classId}_W${selectedWeek}` },
              })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>SUBMIT TO HOD</Text>
            <Feather name="send" size={16} color={EditorialColors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() =>
              navigation.navigate('StaffHome', {
                screen: 'ReportExport',
                params: { reportId: `${classId}_W${selectedWeek}` },
              })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.outlineBtnText}>EXPORT REPORT PDF</Text>
            <Feather name="download" size={16} color={EditorialColors.ink} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
  },
  content: {
    paddingHorizontal: EditorialSpacing.screenHorizontal,
  },
  topMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  screenHeadline: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 24,
    lineHeight: 28,
    color: EditorialColors.ink,
    marginTop: 2,
  },
  metaSubtext: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 10,
    letterSpacing: 1.5,
    color: EditorialColors.muted,
    marginTop: 4,
  },
  badge: {
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
  },
  hairlineSpacer: {
    marginVertical: 16,
  },
  heroSection: {
    marginTop: 4,
  },
  heroRow: {
    marginTop: 4,
  },
  heavySpacer: {
    marginVertical: 18,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: EditorialFonts.display,
    fontSize: 30,
    lineHeight: 34,
    color: EditorialColors.ink,
    marginBottom: 2,
  },
  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: EditorialColors.ink,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
  },
  reportCardWrapper: {
    marginBottom: 24,
  },
  actionBlock: {
    gap: 12,
    marginTop: 4,
  },
  primaryBtn: {
    height: 54,
    width: '100%',
    backgroundColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  primaryBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.white,
  },
  outlineBtn: {
    height: 54,
    width: '100%',
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  outlineBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.ink,
  },
});
