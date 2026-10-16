import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CCStackParamList } from '@navigation/types';
import { useReportStore, SubjectProgress } from '../store/useReportStore';
import { getCCForSection } from '@config/facultyBoard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DayRibbonColors,
  DayRibbonFonts,
  DayRibbonShapes,
  DayRibbonSpacing,
} from '@theme/dayRibbon';
import { StatTile } from '@components/editorial/StatTile';
import { ProgressBar } from '@components/editorial/ProgressBar';
import { Feather } from '@expo/vector-icons';

type RouteParams = RouteProp<CCStackParamList, 'ClassProgress'>;
type NavProp = NativeStackNavigationProp<CCStackParamList>;

export const ClassProgressScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavProp>();
  const classId = route.params?.classId || '1st Year SEC-A';
  const selectedWeek = 12;

  const subjectProgressList = useReportStore((state) => state.subjectProgressList);
  const fetchWeeklyProgress = useReportStore((state) => state.fetchWeeklyProgress);

  useEffect(() => {
    fetchWeeklyProgress(classId, selectedWeek);
  }, [classId, selectedWeek]);

  const ccInfo = getCCForSection(classId);
  const subjects: SubjectProgress[] = subjectProgressList[`${classId}_${selectedWeek}`] || [];

  const completedCount = subjects.filter((s) => s.status === 'Submitted').length;
  const avgCoverage =
    subjects.length > 0
      ? Math.round(subjects.reduce((sum, s) => sum + s.coverage, 0) / subjects.length)
      : 80;

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
          <Text style={styles.captionTag}>SECTION CURRICULUM • WEEK {selectedWeek}</Text>
          <Text style={styles.headerTitle}>{classId}</Text>
          <Text style={styles.headerSubtitle}>
            Coordinator: {ccInfo?.facultyName || 'Designated CC'} • {avgCoverage}% Average Coverage
          </Text>
        </View>

        {/* 3-Column Stat Grid */}
        <View style={styles.statGrid}>
          <StatTile
            value={subjects.length}
            label="Subjects"
            style={styles.statGridItem}
          />
          <StatTile
            value={completedCount}
            label="Logged"
            style={styles.statGridItem}
          />
          <StatTile
            value={subjects.length - completedCount}
            label="Pending"
            isBehindPlan={subjects.length - completedCount > 0}
            style={styles.statGridItem}
          />
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={styles.quickOutlineBtn}
            onPress={() => navigation.navigate('FacultyAllocation')}
            activeOpacity={0.7}
          >
            <Feather name="users" size={14} color={DayRibbonColors.ink} />
            <Text style={styles.quickOutlineBtnText}>Allocate Teachers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickOutlineBtn}
            onPress={() => navigation.navigate('PendingSubmissions', { classId })}
            activeOpacity={0.7}
          >
            <Feather name="clock" size={14} color={DayRibbonColors.ink} />
            <Text style={styles.quickOutlineBtnText}>Pending List</Text>
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>CURRICULUM ROSTER</Text>
          <Text style={styles.sectionHeaderMeta}>WEEK {selectedWeek} LOGS</Text>
        </View>

        {/* Subjects Roster */}
        <View style={styles.subjectList}>
          {subjects.map((sub) => {
            const isLogged = sub.status === 'Submitted';
            const isBehind = sub.coverage < 70;

            return (
              <TouchableOpacity
                key={sub.code}
                onPress={() =>
                  navigation.navigate('SubjectProgressDetail', { progressId: `${classId}_${sub.code}` })
                }
                style={styles.subjectCard}
                activeOpacity={0.75}
              >
                <View style={styles.cardTop}>
                  <View style={styles.subjectInfo}>
                    <View style={styles.codeRow}>
                      <Text style={styles.subjectCode}>{sub.code}</Text>
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
                    <Text style={styles.subjectName}>{sub.name}</Text>
                    <Text style={styles.facultyMeta}>
                      Faculty: {sub.faculty || 'Staff'} • {sub.periodsHandled || 0}/{sub.periodsPlanned || 4} Periods
                    </Text>
                  </View>

                  <View style={styles.rightValueBox}>
                    <Text
                      style={[
                        styles.percentText,
                        isBehind ? styles.warnPercentText : styles.cobaltPercentText,
                      ]}
                    >
                      {sub.coverage}%
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <ProgressBar
                  progress={sub.coverage}
                  isBehindPlan={isBehind}
                  height={8}
                  style={styles.progressBar}
                />
              </TouchableOpacity>
            );
          })}
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
    marginBottom: 16,
  },
  statGridItem: {
    flex: 1,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickOutlineBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...DayRibbonShapes.shadow,
  },
  quickOutlineBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
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
});

export default ClassProgressScreen;
