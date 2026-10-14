import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReportStore, ConsolidatedReport } from '@features/cc/store/useReportStore';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { StaffStackParamList } from '@navigation/types';
import { WeeklyCourseCoverageReportCard } from '../../cc/components/WeeklyCourseCoverageReportCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { SegBar } from '@components/editorial/SegBar';
import { EditorialChip } from '@components/editorial/EditorialChip';

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
        {/* Header */}
        <View style={styles.header}>
          <Label text={`SECTION AUDIT • WEEK ${selectedWeek}`} />
          <Text style={styles.headerTitle}>
            {classId.toUpperCase()}
            <Text style={styles.accentDot}>.</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Department: {user?.department || 'Computer Science Engineering'} • {avgCoverage}% Syllabus Coverage
          </Text>
        </View>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* Stat Row */}
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{progressList.length || 6}</Text>
            <Label text="COURSES" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{avgCoverage}%</Text>
            <Label text="COVERAGE" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text
              style={[
                styles.statNum,
                PENDING_REPORTS > 0 ? styles.accentStatNum : null,
              ]}
            >
              {PENDING_REPORTS}
            </Text>
            <Label text="PENDING" />
          </View>
        </View>

        {/* 1px Hairline Rule */}
        <Rule thickness="hairline" style={styles.hairlineSpacer} />

        {/* View Mode Toggle Chips */}
        <View style={styles.tabToggleRow}>
          <EditorialChip
            label="LIST VIEW"
            selected={viewMode === 'list'}
            onPress={() => setViewMode('list')}
          />
          <EditorialChip
            label="SPREADSHEET"
            selected={viewMode === 'spreadsheet'}
            onPress={() => setViewMode('spreadsheet')}
          />
        </View>

        {viewMode === 'list' ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>FACULTY SYLLABUS LOGS</Text>
              <Label text={`${progressList.length} COURSES`} />
            </View>

            {progressList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Label text="NO FACULTY LOGS RECORDED" />
              </View>
            ) : (
              <View style={styles.subjectList}>
                {progressList.map((subj) => {
                  const isLogged = subj.status === 'Submitted';
                  const isLagging = subj.coverage < 70;
                  return (
                    <View key={subj.code} style={styles.subjectRow}>
                      <View style={styles.rowTop}>
                        <View style={styles.subjectInfo}>
                          <View style={styles.codeRow}>
                            <Text style={styles.subjectCode}>{subj.code}</Text>
                            <View style={styles.statusBadge}>
                              <Text
                                style={[
                                  styles.statusText,
                                  !isLogged ? styles.accentStatusText : null,
                                ]}
                              >
                                {isLogged ? 'LOGGED' : 'PENDING'}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.subjectName}>{subj.name}</Text>
                          <Label text={`FACULTY: ${subj.faculty?.toUpperCase()}`} style={styles.facultyMeta} />
                        </View>

                        <View style={styles.rightValueBox}>
                          <Text
                            style={[
                              styles.percentText,
                              isLagging ? styles.accentPercentText : null,
                            ]}
                          >
                            {subj.coverage}%
                          </Text>
                        </View>
                      </View>

                      {/* 25-Segment Bar */}
                      <View style={styles.segBarWrapper}>
                        <SegBar
                          totalSegments={25}
                          filledSegments={Math.round((subj.coverage / 100) * 25)}
                          isLagging={isLagging}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <View style={styles.spreadsheetWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>WEEK {selectedWeek} SPREADSHEET</Text>
              <Label text="CONSOLIDATED" />
            </View>

            {existingReport ? (
              <WeeklyCourseCoverageReportCard report={existingReport} showDownloadButton={true} />
            ) : (
              <View style={styles.emptyContainer}>
                <Label text="NO CONSOLIDATED REPORT SUBMITTED" />
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
    backgroundColor: EditorialColors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
  },
  content: {
    paddingHorizontal: EditorialSpacing.screenHorizontal,
  },
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: EditorialFonts.display,
    fontSize: 36,
    lineHeight: 40,
    color: EditorialColors.ink,
    letterSpacing: -0.5,
    marginTop: 4,
    marginBottom: 4,
  },
  accentDot: {
    color: EditorialColors.accent,
  },
  headerSubtitle: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
    lineHeight: 18,
  },
  heavySpacer: {
    marginVertical: 18,
  },
  hairlineSpacer: {
    marginVertical: 16,
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
  accentStatNum: {
    color: EditorialColors.accent,
  },
  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: EditorialColors.ink,
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
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.ink,
  },
  subjectList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
  },
  subjectRow: {
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.ink,
    paddingVertical: 14,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
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
    fontFamily: EditorialFonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    color: EditorialColors.muted,
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  statusText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 9,
    letterSpacing: 1,
    color: EditorialColors.ink,
  },
  accentStatusText: {
    color: EditorialColors.accent,
  },
  subjectName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 16,
    lineHeight: 20,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  facultyMeta: {
    letterSpacing: 1.5,
  },
  rightValueBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  percentText: {
    fontFamily: EditorialFonts.display,
    fontSize: 28,
    lineHeight: 32,
    color: EditorialColors.ink,
  },
  accentPercentText: {
    color: EditorialColors.accent,
  },
  segBarWrapper: {
    marginTop: 2,
  },
  spreadsheetWrapper: {
    marginTop: 4,
  },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: 'center',
  },
});
