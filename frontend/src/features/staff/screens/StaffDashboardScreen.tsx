import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';
import { Text } from 'react-native';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { SyllabusRepository } from '@database/repositories/SyllabusRepository';
import { TimetableRepository } from '@database/repositories/TimetableRepository';
import { matchFacultyName } from '../../../utils/facultyMatcher';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StaffStackParamList } from '@navigation/types';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DayRibbonColors,
  DayRibbonFonts,
  DayRibbonShapes,
  DayRibbonSpacing,
} from '@theme/dayRibbon';
import { getCCForSection } from '@config/facultyBoard';
import { DateHero } from '@components/editorial/DateHero';
import { WeekStrip } from '@components/editorial/WeekStrip';
import { ProgressBar } from '@components/editorial/ProgressBar';
import { ListRow } from '@components/editorial/ListRow';
import { BigNumber } from '@components/editorial/BigNumber';
import { StatTile } from '@components/editorial/StatTile';

interface SubjectInfo {
  code: string;
  name: string;
  section: string;
  sections: string[];
  yearDisplay: string;
  ccFacultyName: string;
  shortName: string;
  color: string;
  completedTopics: number;
  totalTopics: number;
  percent: number;
}

const PERIOD_TIMES: Record<number, string> = {
  1: '08:30 - 09:20',
  2: '09:20 - 10:10',
  3: '10:25 - 11:15',
  4: '11:15 - 12:05',
  5: '12:45 - 01:35',
  6: '01:35 - 02:25',
  7: '02:35 - 03:25',
};

export const StaffDashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>();

  const [handledSubjects, setHandledSubjects] = useState<SubjectInfo[]>([]);
  const [todaySlots, setTodaySlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  const syllabusRepo = new SyllabusRepository();
  const timetableRepo = new TimetableRepository();

  const loadData = async () => {
    try {
      setLoading(true);
      const slots = await timetableRepo.getTimetable();

      const userFilteredSlots = user?.role === 'ADMIN'
        ? slots
        : slots.filter((s) => matchFacultyName(s.faculty_name, user?.name));
      const filteredSlots = (userFilteredSlots.length === 0 && slots.length > 0) ? slots : userFilteredSlots;

      // Extract today's timetable slots
      const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const currentDaySlots = filteredSlots.filter(
        (s) => s.day_of_week.toLowerCase() === todayDayName.toLowerCase()
      );
      setTodaySlots(currentDaySlots.length > 0 ? currentDaySlots : filteredSlots.slice(0, 3));

      const sessionMap: Record<string, {
        code: string;
        name: string;
        section: string;
        yearPrefix: string;
        shortName: string;
        color: string;
      }> = {};

      const colors = ['#2B3FE0', '#2B3FE0', '#2B3FE0', '#2B3FE0'];
      let colorIdx = 0;

      for (const slot of filteredSlots) {
        const sessionKey = `${slot.subject_code}_${slot.class_section}`;
        if (!sessionMap[sessionKey]) {
          let yearPrefix = 'Academic Course';
          if (slot.class_section.includes('1st')) yearPrefix = '1st Year';
          else if (slot.class_section.includes('2nd') || slot.class_section === 'CSE-B') yearPrefix = '2nd Year';
          else if (slot.class_section.includes('3rd')) yearPrefix = '3rd Year';
          else if (slot.class_section.includes('4th')) yearPrefix = '4th Year';

          let shortName = slot.subject_name.split(' ').map((w) => w[0]).join('').toUpperCase();
          if (slot.subject_code === 'CS8501') shortName = 'TOC';
          if (slot.subject_code === 'CS8502') shortName = 'DBMS';
          if (slot.subject_code === 'CS8503') shortName = 'CN';
          if (slot.subject_code === 'CS8504') shortName = 'OS';

          sessionMap[sessionKey] = {
            code: slot.subject_code,
            name: slot.subject_name,
            section: slot.class_section,
            yearPrefix,
            shortName,
            color: colors[colorIdx % colors.length],
          };
          colorIdx++;
        }
      }

      if (user?.subjectAssignments && user.subjectAssignments.length > 0) {
        for (const assignment of user.subjectAssignments) {
          const sessionKey = `${assignment.subjectCode}_${assignment.classId}`;
          if (!sessionMap[sessionKey]) {
            let yearPrefix = 'Academic Course';
            if (assignment.classId.includes('1st')) yearPrefix = '1st Year';
            else if (assignment.classId.includes('2nd')) yearPrefix = '2nd Year';
            else if (assignment.classId.includes('3rd')) yearPrefix = '3rd Year';
            else if (assignment.classId.includes('4th')) yearPrefix = '4th Year';

            let shortName = assignment.subjectName.split(' ').map((w) => w[0]).join('').toUpperCase();

            sessionMap[sessionKey] = {
              code: assignment.subjectCode,
              name: assignment.subjectName,
              section: assignment.classId,
              yearPrefix,
              shortName,
              color: colors[colorIdx % colors.length],
            };
            colorIdx++;
          }
        }
      }

      const subjectList: SubjectInfo[] = [];
      let totalCompletedAll = 0;
      let totalTopicsAll = 0;

      for (const key of Object.keys(sessionMap)) {
        const item = sessionMap[key];
        const topics = await syllabusRepo.getSyllabusBySubject(item.code);
        const totalTopics = topics.length;
        const completedTopics = topics.filter((t) => t.is_completed === 1).length;
        const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

        totalCompletedAll += completedTopics;
        totalTopicsAll += totalTopics;

        const ccInfo = getCCForSection(item.section);
        const ccFacultyName = ccInfo?.facultyName || 'Section Class Coordinator';

        subjectList.push({
          code: item.code,
          name: item.name,
          section: item.section,
          sections: [item.section],
          yearDisplay: `${item.yearPrefix} (${item.section})`,
          ccFacultyName,
          shortName: item.shortName,
          color: item.color,
          completedTopics,
          totalTopics,
          percent,
        });
      }

      subjectList.sort((a, b) =>
        a.section.localeCompare(b.section, undefined, { numeric: true, sensitivity: 'base' })
      );

      const overall = totalTopicsAll > 0 ? Math.round((totalCompletedAll / totalTopicsAll) * 100) : 0;
      setOverallProgress(overall);
      setHandledSubjects(subjectList);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSubjectPress = (code: string, section?: string) => {
    navigation.navigate('WeeklyProgress', { subjectCode: code, classSection: section, weekNumber: 12 });
  };

  const getRoleLabel = () => {
    if (user?.role === 'HOD') return 'HEAD OF DEPARTMENT';
    if (user?.isClassCoordinator) return `CLASS COORDINATOR (${user.assignedClassId || 'CSE-B'})`;
    return 'SUBJECT FACULTY PROFESSOR';
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={DayRibbonColors.cobalt}
            colors={[DayRibbonColors.cobalt]}
          />
        }
      >
        {/* Header with Logo slot on left, user info, and circular bell button on right */}
        <View style={styles.header}>
          <View style={styles.logoSlot}>
            <Image
              source={require('../../../assets/logo-removebg-preview.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerMiddle}>
            <Text style={styles.roleLabel}>{getRoleLabel()}</Text>
            <Text style={styles.facultyName} numberOfLines={1}>
              {user?.name || 'Professor'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => (navigation as any).navigate('Notifications')}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
          >
            <Feather name="bell" size={18} color={DayRibbonColors.ink} />
          </TouchableOpacity>
        </View>

        {/* DateHero component */}
        <DateHero />

        {/* WeekStrip component */}
        <WeekStrip />


        {/* Hero Syllabus Coverage Card */}
        <View style={styles.coverageHeroCard}>
          <Text style={styles.cardHeaderLabel}>OVERALL SYLLABUS COVERAGE</Text>
          <View style={styles.heroNumberRow}>
            <BigNumber value={overallProgress} size="hero" showPercent color={DayRibbonColors.cobalt} />
          </View>
          <ProgressBar progress={overallProgress} height={10} style={{ marginTop: 12 }} />
        </View>

        {/* 3-Column Stat Grid */}
        <View style={styles.statGrid}>
          <StatTile
            value={handledSubjects.length}
            label="Subjects"
            style={styles.statGridItem}
          />
          <StatTile
            value={new Set(handledSubjects.map((s) => s.section)).size}
            label="Sections"
            style={styles.statGridItem}
          />
          <StatTile
            value="100%"
            label="Target"
            style={styles.statGridItem}
          />
        </View>

        {/* Single Main Call to Action: Lemon Highlight Button */}
        <TouchableOpacity
          style={styles.lemonActionButton}
          onPress={() => navigation.navigate('WeeklyProgress', { subjectCode: '', weekNumber: 12 })}
          activeOpacity={0.85}
        >
          <Text style={styles.lemonActionText}>Log Course Coverage</Text>
          <Feather name="arrow-right" size={18} color={DayRibbonColors.ink} />
        </TouchableOpacity>

        {/* Section Header: Assigned Courses */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>ASSIGNED COURSES</Text>
          <Text style={styles.sectionHeaderMeta}>{handledSubjects.length} TOTAL</Text>
        </View>

        {/* Course List using Day Ribbon ListRow */}
        {loading && !refreshing ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonBlock} />
          </View>
        ) : handledSubjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No assigned subjects found</Text>
          </View>
        ) : (
          <View style={styles.subjectList}>
            {handledSubjects.map((subj) => {
              const isBehind = subj.percent < 40;
              return (
                <ListRow
                  key={`${subj.code}_${subj.section}`}
                  indexOrCode={subj.code}
                  name={subj.name}
                  caption={`${subj.yearDisplay} • CC: ${subj.ccFacultyName}`}
                  value={`${subj.percent}%`}
                  progress={subj.percent}
                  isBehindPlan={isBehind}
                  onPress={() => handleSubjectPress(subj.code, subj.section)}
                />
              );
            })}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  facultyName: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 18,
    lineHeight: 22,
    color: DayRibbonColors.ink,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...DayRibbonShapes.shadow,
  },
  periodSection: {
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
  heroNumberRow: {
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
  lemonActionButton: {
    height: 52,
    width: '100%',
    backgroundColor: DayRibbonColors.lemon,
    borderRadius: DayRibbonShapes.buttonRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
    ...DayRibbonShapes.shadow,
  },
  lemonActionText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    letterSpacing: 0.5,
    color: DayRibbonColors.ink,
  },
  subjectList: {
    width: '100%',
  },
  skeletonContainer: {
    gap: 12,
    paddingVertical: 12,
  },
  skeletonBlock: {
    height: 72,
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
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

export default StaffDashboardScreen;
