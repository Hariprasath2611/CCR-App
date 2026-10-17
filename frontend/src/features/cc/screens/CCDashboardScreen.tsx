import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, StatusBar, Image } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useReportStore, ConsolidatedReport } from '../store/useReportStore';
import { WeeklyCourseCoverageReportCard } from '../components/WeeklyCourseCoverageReportCard';
import { getCCForSection, getHODForYear, FIRST_YEAR_CC_BOARD, CSE_3RD_YEAR_CC_BOARD } from '@config/facultyBoard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DayRibbonColors,
  DayRibbonFonts,
  DayRibbonShapes,
  DayRibbonSpacing,
} from '@theme/dayRibbon';
import { BigNumber } from '@components/editorial/BigNumber';
import { ProgressBar } from '@components/editorial/ProgressBar';
import { StatTile } from '@components/editorial/StatTile';
import { Feather } from '@expo/vector-icons';

export const CCDashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const subjectProgressList = useReportStore((state) => state.subjectProgressList);
  const fetchWeeklyProgress = useReportStore((state) => state.fetchWeeklyProgress);

  const userCC = FIRST_YEAR_CC_BOARD.find((cc) => cc.email.toLowerCase() === user?.email?.toLowerCase())
    || CSE_3RD_YEAR_CC_BOARD.find((cc) => cc.email.toLowerCase() === user?.email?.toLowerCase());

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
      <StatusBar barStyle="dark-content" backgroundColor={DayRibbonColors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, DayRibbonSpacing.screenTop),
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.logoSlot}>
            <Image
              source={require('../../../assets/logo-removebg-preview.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerMiddle}>
            <Text style={styles.roleLabel}>CLASS COORDINATOR</Text>
            <Text style={styles.screenHeadline}>{classId}</Text>
          </View>

          <View style={styles.weekBadge}>
            <Text style={styles.weekBadgeText}>WEEK {selectedWeek}</Text>
          </View>
        </View>

        <Text style={styles.metaSubtext}>
          Counselor: {user?.name || ccInfo?.facultyName || 'Faculty Member'} • HOD: {hodInfo.hodName}
        </Text>

        {/* Hero Section: Average Class Coverage */}
        <View style={styles.coverageHeroCard}>
          <Text style={styles.cardHeaderLabel}>AVERAGE CLASS COVERAGE</Text>
          <View style={styles.heroRow}>
            <BigNumber value={averageCoverage} size="hero" showPercent color={DayRibbonColors.cobalt} />
          </View>
          <ProgressBar progress={averageCoverage} height={10} style={{ marginTop: 12 }} />
        </View>

        {/* 3-Column Stat Grid */}
        <View style={styles.statGrid}>
          <StatTile
            value={currentProgress.length || 6}
            label="Courses"
            style={styles.statGridItem}
          />
          <StatTile
            value={`W-${selectedWeek}`}
            label="Period"
            style={styles.statGridItem}
          />
          <StatTile
            value="100%"
            label="Target"
            style={styles.statGridItem}
          />
        </View>

        {/* Main Action: Submit to HOD as Lemon Button */}
        <TouchableOpacity
          style={styles.lemonBtn}
          onPress={() =>
            navigation.navigate('SubmitToHOD', {
              reportId: `${classId}_W${selectedWeek}`,
            })
          }
          activeOpacity={0.85}
        >
          <Text style={styles.lemonBtnText}>Submit to HOD</Text>
          <Feather name="send" size={16} color={DayRibbonColors.ink} />
        </TouchableOpacity>

        {/* Secondary Actions Row */}
        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => navigation.navigate('FacultyAllocation')}
            activeOpacity={0.7}
          >
            <Feather name="users" size={16} color={DayRibbonColors.ink} />
            <Text style={styles.outlineBtnText}>Allocate Faculty</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() =>
              navigation.navigate('ReportExport', {
                reportId: `${classId}_W${selectedWeek}`,
              })
            }
            activeOpacity={0.7}
          >
            <Feather name="download" size={16} color={DayRibbonColors.ink} />
            <Text style={styles.outlineBtnText}>Export PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>
            WEEK {selectedWeek} CONSOLIDATED REPORT
          </Text>
          <Text style={styles.sectionHeaderMeta}>ACADEMIC LOG</Text>
        </View>

        {/* Consolidated Report Card */}
        <View style={styles.reportCardWrapper}>
          <WeeklyCourseCoverageReportCard report={draftReport} showDownloadButton={false} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  content: {
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logoSlot: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    ...DayRibbonShapes.shadow,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  headerMiddle: {
    flex: 1,
    marginHorizontal: 12,
  },
  roleLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 10,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
  },
  screenHeadline: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 18,
    color: DayRibbonColors.ink,
  },
  weekBadge: {
    backgroundColor: DayRibbonColors.cobaltTint,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  weekBadgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.cobalt,
  },
  metaSubtext: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
    marginBottom: 16,
  },
  coverageHeroCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 20,
    marginBottom: 14,
    ...DayRibbonShapes.shadow,
  },
  cardHeaderLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
  },
  heroRow: {
    marginTop: 4,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statGridItem: {
    flex: 1,
  },
  lemonBtn: {
    height: 52,
    backgroundColor: DayRibbonColors.lemon,
    borderRadius: DayRibbonShapes.buttonRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    ...DayRibbonShapes.shadow,
  },
  lemonBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    letterSpacing: 0.5,
    color: DayRibbonColors.ink,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  outlineBtn: {
    flex: 1,
    height: 48,
    borderRadius: DayRibbonShapes.buttonRadius,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    color: DayRibbonColors.ink,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    letterSpacing: 0.5,
    color: DayRibbonColors.ink,
  },
  sectionHeaderMeta: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    color: DayRibbonColors.muted,
  },
  reportCardWrapper: {
    marginBottom: 20,
  },
});

export default CCDashboardScreen;
