import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
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
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { getCCForSection } from '@config/facultyBoard';
import { BigNumber } from '@components/editorial/BigNumber';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { SegBar } from '@components/editorial/SegBar';

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

export const StaffDashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>();

  const [handledSubjects, setHandledSubjects] = useState<SubjectInfo[]>([]);
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

      const sessionMap: Record<string, {
        code: string;
        name: string;
        section: string;
        yearPrefix: string;
        shortName: string;
        color: string;
      }> = {};

      const colors = ['#111111', '#111111', '#111111', '#111111', '#111111', '#111111'];
      let colorIdx = 0;

      for (const slot of filteredSlots) {
        const sessionKey = `${slot.subject_code}_${slot.class_section}`;
        if (!sessionMap[sessionKey]) {
          let yearPrefix = 'Academic Course';
          if (slot.class_section.includes('1st')) yearPrefix = '1st Year';
          else if (slot.class_section.includes('2nd') || slot.class_section === 'CSE-B') yearPrefix = '2nd Year';
          else if (slot.class_section.includes('3rd')) yearPrefix = '3rd Year';
          else if (slot.class_section.includes('4th')) yearPrefix = '4th Year';

          let shortName = slot.subject_name.split(' ').map(w => w[0]).join('').toUpperCase();
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

            let shortName = assignment.subjectName.split(' ').map(w => w[0]).join('').toUpperCase();

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
        const completedTopics = topics.filter(t => t.is_completed === 1).length;
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={EditorialColors.ink}
            colors={[EditorialColors.ink]}
          />
        }
      >
        {/* Top Meta Bar */}
        <View style={styles.topMetaRow}>
          <View>
            <Label text={getRoleLabel()} style={styles.roleLabel} />
            <Text style={styles.facultyName} numberOfLines={1}>
              {user?.name || 'Professor'}
            </Text>
          </View>
          <View style={styles.deptBadge}>
            <Text style={styles.deptText}>
              {user?.department ? user.department.toUpperCase() : 'CSE'}
            </Text>
          </View>
        </View>

        {/* 1px Hairline Rule */}
        <Rule thickness="hairline" style={styles.hairlineSpacer} />

        {/* Hero Section: Big Number 104 with Vermilion % */}
        <View style={styles.heroSection}>
          <Label text="OVERALL SYLLABUS COVERAGE" />
          <View style={styles.heroNumberRow}>
            <BigNumber value={overallProgress} size="hero" showPercent />
          </View>
        </View>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* 3-Column Stat Row */}
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{handledSubjects.length}</Text>
            <Label text="SUBJECTS" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>
              {new Set(handledSubjects.map((s) => s.section)).size}
            </Text>
            <Label text="SECTIONS" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>100%</Text>
            <Label text="TARGET" />
          </View>
        </View>

        {/* 1px Hairline Rule */}
        <Rule thickness="hairline" style={styles.hairlineSpacer} />

        {/* Primary Action Button: Log Course Coverage */}
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => navigation.navigate('WeeklyProgress', { subjectCode: '', weekNumber: 12 })}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryActionText}>LOG COURSE COVERAGE</Text>
          <Feather name="arrow-right" size={18} color={EditorialColors.white} />
        </TouchableOpacity>

        {/* Section Header: Subject Handling */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>ASSIGNED COURSES</Text>
          <Label text={`${handledSubjects.length} TOTAL`} />
        </View>

        {/* Subject Rows */}
        {loading && !refreshing ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonBlock} />
          </View>
        ) : handledSubjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Label text="NO ASSIGNED SUBJECTS FOUND" />
          </View>
        ) : (
          <View style={styles.subjectList}>
            {handledSubjects.map((subj, index) => {
              const isLagging = subj.percent < 40;
              return (
                <TouchableOpacity
                  key={`${subj.code}_${subj.section}`}
                  activeOpacity={0.7}
                  onPress={() => handleSubjectPress(subj.code, subj.section)}
                  style={styles.subjectRow}
                >
                  <View style={styles.rowTop}>
                    <View style={styles.subjectInfo}>
                      <View style={styles.codeMetaRow}>
                        <Text style={styles.subjectCode}>{subj.code}</Text>
                        <Text style={styles.sectionMeta}>{subj.yearDisplay}</Text>
                      </View>
                      <Text style={styles.subjectName} numberOfLines={1}>
                        {subj.name}
                      </Text>
                      <Label
                        text={`CC: ${subj.ccFacultyName} • ${subj.completedTopics}/${subj.totalTopics} TOPICS`}
                        style={styles.ccMetaLabel}
                      />
                    </View>

                    <View style={styles.rightValueBox}>
                      <Text
                        style={[
                          styles.percentText,
                          isLagging ? styles.accentPercentText : null,
                        ]}
                      >
                        {subj.percent}%
                      </Text>
                    </View>
                  </View>

                  {/* 25-Segment Bar */}
                  <View style={styles.segBarWrapper}>
                    <SegBar
                      totalSegments={25}
                      filledSegments={Math.round((subj.percent / 100) * 25)}
                      isLagging={isLagging}
                    />
                  </View>
                </TouchableOpacity>
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
    marginBottom: 16,
  },
  roleLabel: {
    marginBottom: 4,
  },
  facultyName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 22,
    lineHeight: 26,
    color: EditorialColors.ink,
  },
  deptBadge: {
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deptText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 10,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
  },
  hairlineSpacer: {
    marginVertical: 16,
  },
  heroSection: {
    marginTop: 8,
    marginBottom: 4,
  },
  heroNumberRow: {
    marginTop: 4,
  },
  heavySpacer: {
    marginVertical: 18,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
  primaryActionButton: {
    height: 54,
    width: '100%',
    backgroundColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 28,
  },
  primaryActionText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.white,
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
  codeMetaRow: {
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
  sectionMeta: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
  },
  subjectName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 17,
    lineHeight: 22,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  ccMetaLabel: {
    letterSpacing: 1.5,
  },
  rightValueBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  percentText: {
    fontFamily: EditorialFonts.display,
    fontSize: 30,
    lineHeight: 34,
    color: EditorialColors.ink,
  },
  accentPercentText: {
    color: EditorialColors.accent,
  },
  segBarWrapper: {
    marginTop: 2,
  },
  skeletonContainer: {
    gap: 12,
    paddingVertical: 16,
  },
  skeletonBlock: {
    height: 72,
    backgroundColor: EditorialColors.track,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
});
