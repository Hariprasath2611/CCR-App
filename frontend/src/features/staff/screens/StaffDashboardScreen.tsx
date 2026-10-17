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
import { getFallbackCoursesForFaculty } from '@config/facultyCourses';
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

      if (Object.keys(sessionMap).length === 0) {
        const fallbacks = getFallbackCoursesForFaculty(user);
        for (const fb of fallbacks) {
          const sessionKey = `${fb.code}_${fb.section}`;
          sessionMap[sessionKey] = {
            code: fb.code,
            name: fb.name,
            section: fb.section,
            yearPrefix: fb.yearPrefix,
            shortName: fb.shortName,
            color: colors[colorIdx % colors.length],
          };
          colorIdx++;
        }
      }

      const subjectList: SubjectInfo[] = [];
      let totalCompletedAll = 0;
      let totalTopicsAll = 0;

      for (const key of Object.keys(sessionMap)) {
        const item = sessionMap[key];
        let totalTopics = 16;
        let completedTopics = 12;
        try {
          const topics = await syllabusRepo.getSyllabusBySubject(item.code);
          if (topics && topics.length > 0) {
            totalTopics = topics.length;
            completedTopics = topics.filter((t) => t.is_completed === 1).length;
          }
        } catch (sErr) {
          console.warn(`Syllabus read fallback for ${item.code}:`, sErr);
        }

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
      const fallbacks = getFallbackCoursesForFaculty(user);
      const subjectList: SubjectInfo[] = fallbacks.map((fb) => ({
        code: fb.code,
        name: fb.name,
        section: fb.section,
        sections: [fb.section],
        yearDisplay: `${fb.yearPrefix} (${fb.section})`,
        ccFacultyName: getCCForSection(fb.section)?.facultyName || 'Section Class Coordinator',
        shortName: fb.shortName,
        color: '#2B3FE0',
        completedTopics: 12,
        totalTopics: 16,
        percent: 75,
      }));
      setOverallProgress(75);
      setHandledSubjects(subjectList);
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

  const isCC = Boolean(user?.isClassCoordinator);
  const isHOD = user?.role === 'HOD';

  const roleTitle = isHOD
    ? 'Head of Department (HOD)'
    : isCC
    ? 'Class Coordinator (CC)'
    : 'Subject Teacher';

  const roleBadgeLabel = isHOD
    ? 'HEAD OF DEPARTMENT (HOD)'
    : isCC
    ? `CLASS COORDINATOR (CC) · ${user?.assignedClassId || 'CSE-B'}`
    : `SUBJECT TEACHER · ${user?.department || 'CSE'}`;

  const roleSubtitle = isHOD
    ? `${user?.department || 'Computer Science'} Department`
    : isCC
    ? `Class In-Charge: ${user?.assignedClassId || 'CSE-B'} • Department of ${user?.department || 'Computer Science'}`
    : `Teaching Faculty • Department of ${user?.department || 'Computer Science'}`;

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
            <View style={styles.roleTagRow}>
              <View
                style={[
                  styles.roleBadgePill,
                  isCC && styles.roleBadgePillCC,
                  isHOD && styles.roleBadgePillHOD,
                ]}
              >
                <Feather
                  name={isHOD ? 'award' : isCC ? 'shield' : 'book-open'}
                  size={10}
                  color={isHOD ? '#059669' : isCC ? DayRibbonColors.cobalt : '#334155'}
                />
                <Text
                  style={[
                    styles.roleBadgeText,
                    isCC && styles.roleBadgeTextCC,
                    isHOD && styles.roleBadgeTextHOD,
                  ]}
                  numberOfLines={1}
                >
                  {roleBadgeLabel}
                </Text>
              </View>
            </View>
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

        {/* Role Designation Card denoting CC, Subject Teacher, or HOD */}
        <View
          style={[
            styles.roleDesignationCard,
            isCC && styles.roleDesignationCardCC,
            isHOD && styles.roleDesignationCardHOD,
          ]}
        >
          <View
            style={[
              styles.roleDesignationIconCircle,
              isCC && styles.roleDesignationIconCircleCC,
              isHOD && styles.roleDesignationIconCircleHOD,
            ]}
          >
            <Feather
              name={isHOD ? 'award' : isCC ? 'shield' : 'book-open'}
              size={20}
              color={isHOD ? '#059669' : isCC ? DayRibbonColors.cobalt : '#2563EB'}
            />
          </View>
          <View style={styles.roleDesignationTextWrap}>
            <View style={styles.roleDesignationHeaderRow}>
              <Text style={styles.roleDesignationRoleTitle}>{roleTitle}</Text>
              <View
                style={[
                  styles.roleDesignationPill,
                  isCC && styles.roleDesignationPillCC,
                  isHOD && styles.roleDesignationPillHOD,
                ]}
              >
                <Text
                  style={[
                    styles.roleDesignationPillText,
                    isCC && styles.roleDesignationPillTextCC,
                    isHOD && styles.roleDesignationPillTextHOD,
                  ]}
                >
                  {isHOD ? 'HOD' : isCC ? 'CC IN-CHARGE' : 'SUBJECT TEACHER'}
                </Text>
              </View>
            </View>
            <Text style={styles.roleDesignationSubtitle}>{roleSubtitle}</Text>
          </View>
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
  roleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  roleBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleBadgePillCC: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  roleBadgePillHOD: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  roleBadgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 9.5,
    letterSpacing: 0.4,
    color: '#475569',
  },
  roleBadgeTextCC: {
    color: DayRibbonColors.cobalt,
  },
  roleBadgeTextHOD: {
    color: '#059669',
  },
  roleDesignationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    ...DayRibbonShapes.shadow,
  },
  roleDesignationCardCC: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FAFF',
  },
  roleDesignationCardHOD: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  roleDesignationIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleDesignationIconCircleCC: {
    backgroundColor: '#EFF6FF',
  },
  roleDesignationIconCircleHOD: {
    backgroundColor: '#DCFCE7',
  },
  roleDesignationTextWrap: {
    flex: 1,
  },
  roleDesignationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  roleDesignationRoleTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 15,
    color: DayRibbonColors.ink,
  },
  roleDesignationPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleDesignationPillCC: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD',
  },
  roleDesignationPillHOD: {
    backgroundColor: '#D1FAE5',
    borderColor: '#6EE7B7',
  },
  roleDesignationPillText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 10,
    color: '#475569',
    letterSpacing: 0.3,
  },
  roleDesignationPillTextCC: {
    color: '#1D4ED8',
  },
  roleDesignationPillTextHOD: {
    color: '#047857',
  },
  roleDesignationSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
    lineHeight: 16,
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
