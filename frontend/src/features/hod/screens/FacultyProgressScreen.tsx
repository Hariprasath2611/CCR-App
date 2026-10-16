import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, StatusBar } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReportStore } from '@features/cc/store/useReportStore';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { StaffStackParamList } from '@navigation/types';
import { WeeklyCourseCoverageReportCard } from '../../cc/components/WeeklyCourseCoverageReportCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DayRibbonColors,
  DayRibbonFonts,
  DayRibbonShapes,
  DayRibbonSpacing,
} from '@theme/dayRibbon';
import { StatTile } from '@components/editorial/StatTile';
import { EditorialChip } from '@components/editorial/EditorialChip';
import { ProgressBar } from '@components/editorial/ProgressBar';

type RouteParams = RouteProp<StaffStackParamList, 'FacultyProgress'>;
type HodNav = NativeStackNavigationProp<StaffStackParamList>;

export const FacultyProgressScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<HodNav>();
  const { user } = useAuthStore();
  const reports = useReportStore((state) => state.reports);
  const subjectProgressList = useReportStore((state) => state.subjectProgressList);

  const classId = route.params?.classId || 'CSE-B';
  const selectedWeek = '12';

  const getSubjectsProgressForClass = (clsId: string, week: string) => {
    const storeKey = `${clsId}_${week}`;
    return subjectProgressList[storeKey] || [];
  };

  const progressList = getSubjectsProgressForClass(classId, selectedWeek);
  const [viewMode, setViewMode] = useState<'list' | 'spreadsheet'>('list');

  const classPendingReports = reports.filter(
    (r) => r.classId === classId && r.status === 'SUBMITTED_TO_HOD'
  );
  const PENDING_REPORTS = classPendingReports.length;

  const existingReport = reports.find(
    (r) => r.classId === classId && r.weekNumber === parseInt(selectedWeek)
  );

  const avgCoverage = progressList.length > 0
    ? Math.round(progressList.reduce((sum, s) => sum + s.coverage, 0) / progressList.length)
    : 78;

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.captionTag}>SECTION AUDIT • WEEK {selectedWeek}</Text>
          <Text style={styles.headerTitle}>{classId}</Text>
          <Text style={styles.headerSubtitle}>
            Department: {user?.department || 'Computer Science Engineering'} • {avgCoverage}% Syllabus Coverage
          </Text>
        </View>

        {/* Stat Grid */}
        <View style={styles.statGrid}>
          <StatTile
            value={progressList.length || 6}
            label="Courses"
            style={styles.statGridItem}
          />
          <StatTile
            value={`${avgCoverage}%`}
            label="Coverage"
            style={styles.statGridItem}
          />
          <StatTile
            value={PENDING_REPORTS}
            label="Pending"
            isBehindPlan={PENDING_REPORTS > 0}
            style={styles.statGridItem}
          />
        </View>

        {/* View Mode Toggle Chips */}
        <View style={styles.tabToggleRow}>
          <EditorialChip
            label="List View"
            selected={viewMode === 'list'}
            onPress={() => setViewMode('list')}
          />
          <EditorialChip
            label="Spreadsheet"
            selected={viewMode === 'spreadsheet'}
            onPress={() => setViewMode('spreadsheet')}
          />
        </View>

        {viewMode === 'list' ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>FACULTY SYLLABUS LOGS</Text>
              <Text style={styles.sectionHeaderMeta}>{progressList.length} COURSES</Text>
            </View>

            {progressList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No faculty logs recorded</Text>
              </View>
            ) : (
              <View style={styles.subjectList}>
                {progressList.map((subj) => {
                  const isLogged = subj.status === 'Submitted';
                  const isBehind = subj.coverage < 70;

                  return (
                    <View key={subj.code} style={styles.subjectCard}>
                      <View style={styles.cardTop}>
                        <View style={styles.subjectInfo}>
                          <View style={styles.codeRow}>
                            <Text style={styles.subjectCode}>{subj.code}</Text>
                            <View
                              style={[
                                styles.statusBadge,
                                isLogged ? styles.loggedBadge : styles.pendingBadge,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusText,
                                  isLogged ? styles.loggedStatusText : styles.pendingStatusText,
                                ]}
                              >
                                {isLogged ? 'LOGGED' : 'PENDING'}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.subjectName}>{subj.name}</Text>
                          <Text style={styles.facultyMeta}>Faculty: {subj.faculty}</Text>
                        </View>

                        <View style={styles.rightValueBox}>
                          <Text
                            style={[
                              styles.percentText,
                              isBehind ? styles.warnPercentText : styles.cobaltPercentText,
                            ]}
                          >
                            {subj.coverage}%
                          </Text>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <ProgressBar
                        progress={subj.coverage}
                        isBehindPlan={isBehind}
                        height={8}
                        style={styles.progressBar}
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <View style={styles.spreadsheetWrapper}>
            {existingReport ? (
              <WeeklyCourseCoverageReportCard report={existingReport} showDownloadButton={true} />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No spreadsheet available for Week {selectedWeek}</Text>
              </View>
            )}
          </View>
        )}
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
    marginBottom: 16,
  },
  captionTag: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: DayRibbonColors.ink,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
    lineHeight: 18,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statGridItem: {
    flex: 1,
  },
  tabToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
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
  subjectList: {
    width: '100%',
  },
  subjectCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 16,
    marginBottom: 12,
    ...DayRibbonShapes.shadow,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subjectInfo: {
    flex: 1,
    marginRight: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  subjectCode: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.cobalt,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  loggedBadge: {
    backgroundColor: DayRibbonColors.cobaltTint,
  },
  pendingBadge: {
    backgroundColor: DayRibbonColors.warnBg,
  },
  statusText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  loggedStatusText: {
    color: DayRibbonColors.cobalt,
  },
  pendingStatusText: {
    color: DayRibbonColors.warn,
  },
  subjectName: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    lineHeight: 22,
    color: DayRibbonColors.ink,
    marginBottom: 4,
  },
  facultyMeta: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  rightValueBox: {
    alignItems: 'flex-end',
  },
  percentText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 26,
    lineHeight: 30,
  },
  cobaltPercentText: {
    color: DayRibbonColors.cobalt,
  },
  warnPercentText: {
    color: DayRibbonColors.warn,
  },
  progressBar: {
    marginTop: 12,
  },
  spreadsheetWrapper: {
    marginBottom: 20,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 14,
    color: DayRibbonColors.muted,
  },
});

export default FacultyProgressScreen;
