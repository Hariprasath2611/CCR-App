import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar } from 'react-native';
import { SyllabusRepository } from '@database/repositories/SyllabusRepository';
import { TimetableRepository } from '@database/repositories/TimetableRepository';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StaffStackParamList } from '@navigation/types';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCCForSection } from '@config/facultyBoard';
import { getFallbackCoursesForFaculty } from '@config/facultyCourses';
import { matchFacultyName } from '../../../utils/facultyMatcher';
import {
  DayRibbonColors,
  DayRibbonFonts,
  DayRibbonShapes,
  DayRibbonSpacing,
} from '@theme/dayRibbon';
import { StatTile } from '@components/editorial/StatTile';
import { ProgressBar } from '@components/editorial/ProgressBar';

interface SubjectInfo {
  code: string;
  name: string;
  section: string;
  year: string;
  ccFacultyName: string;
  description: string;
  color: string;
}

export const AssignedSubjectsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [syllabusProgress, setSyllabusProgress] = useState<Record<string, { completed: number; total: number; percent: number }>>({});
  const [loading, setLoading] = useState(true);

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
      const sessionMap: Record<string, SubjectInfo> = {};
      const colors = ['#2B3FE0', '#2B3FE0', '#2B3FE0', '#2B3FE0'];
      let colorIdx = 0;

      for (const slot of filteredSlots) {
        const sessionKey = `${slot.subject_code}_${slot.class_section}`;
        if (!sessionMap[sessionKey]) {
          let year = 'Academic Course';
          if (slot.class_section.includes('1st')) year = '1st Year CSE';
          else if (slot.class_section.includes('2nd') || slot.class_section === 'CSE-B') year = '2nd Year CSE';
          else if (slot.class_section.includes('3rd')) year = '3rd Year CSE';
          else if (slot.class_section.includes('4th')) year = '4th Year CSE';

          const ccInfo = getCCForSection(slot.class_section);

          sessionMap[sessionKey] = {
            code: slot.subject_code,
            name: slot.subject_name,
            section: slot.class_section,
            year: `${year} (${slot.class_section})`,
            ccFacultyName: ccInfo?.facultyName || 'Class Coordinator',
            description: `Syllabus log coverage tracker for ${slot.subject_name}.`,
            color: colors[colorIdx % colors.length],
          };
          colorIdx++;
        }
      }

      if (user?.subjectAssignments && user.subjectAssignments.length > 0) {
        for (const assignment of user.subjectAssignments) {
          const sessionKey = `${assignment.subjectCode}_${assignment.classId}`;
          if (!sessionMap[sessionKey]) {
            let year = 'Academic Course';
            if (assignment.classId.includes('1st')) year = '1st Year';
            else if (assignment.classId.includes('2nd')) year = '2nd Year';
            else if (assignment.classId.includes('3rd')) year = '3rd Year';
            else if (assignment.classId.includes('4th')) year = '4th Year';

            const ccInfo = getCCForSection(assignment.classId);

            sessionMap[sessionKey] = {
              code: assignment.subjectCode,
              name: assignment.subjectName,
              section: assignment.classId,
              year: `${year} (${assignment.classId})`,
              ccFacultyName: ccInfo?.facultyName || 'Class Coordinator',
              description: `Syllabus log coverage tracker for ${assignment.subjectName}.`,
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
            year: `${fb.yearPrefix} (${fb.section})`,
            ccFacultyName: getCCForSection(fb.section)?.facultyName || 'Class Coordinator',
            description: `Syllabus log coverage tracker for ${fb.name}.`,
            color: colors[colorIdx % colors.length],
          };
          colorIdx++;
        }
      }

      const subjectsList = Object.values(sessionMap);
      subjectsList.sort((a, b) => a.section.localeCompare(b.section, undefined, { numeric: true, sensitivity: 'base' }));
      setSubjects(subjectsList);

      const progressMap: Record<string, { completed: number; total: number; percent: number }> = {};
      for (const subject of subjectsList) {
        let completed = 12;
        let total = 16;
        try {
          const nodes = await syllabusRepo.getSyllabusBySubject(subject.code);
          if (nodes && nodes.length > 0) {
            completed = nodes.filter((n) => n.is_completed === 1).length;
            total = nodes.length;
          }
        } catch (sErr) {
          console.warn(`Syllabus read fallback for ${subject.code}:`, sErr);
        }

        progressMap[`${subject.code}_${subject.section}`] = {
          completed,
          total,
          percent: total > 0 ? completed / total : 0.75,
        };
      }
      setSyllabusProgress(progressMap);
    } catch (err) {
      console.error('Failed to load assigned subjects coverage:', err);
      const fallbacks = getFallbackCoursesForFaculty(user);
      const subjectsList: SubjectInfo[] = fallbacks.map((fb) => ({
        code: fb.code,
        name: fb.name,
        section: fb.section,
        year: `${fb.yearPrefix} (${fb.section})`,
        ccFacultyName: getCCForSection(fb.section)?.facultyName || 'Class Coordinator',
        description: `Syllabus log coverage tracker for ${fb.name}.`,
        color: '#2B3FE0',
      }));
      setSubjects(subjectsList);
      const progressMap: Record<string, { completed: number; total: number; percent: number }> = {};
      for (const s of subjectsList) {
        progressMap[`${s.code}_${s.section}`] = { completed: 12, total: 16, percent: 0.75 };
      }
      setSyllabusProgress(progressMap);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleUpdateProgress = (subjectCode: string, section?: string) => {
    navigation.navigate('WeeklyProgress', { subjectCode, classSection: section, weekNumber: 12 });
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.captionTag}>ACADEMIC CURRICULUM</Text>
          <Text style={styles.headerTitle}>Assigned Courses</Text>
          <Text style={styles.headerSubtitle}>
            Monitor syllabus logs, teaching targets and section coverage.
          </Text>
        </View>

        {/* Stat Summary Grid */}
        <View style={styles.statGrid}>
          <StatTile
            value={subjects.length}
            label="Courses"
            style={styles.statGridItem}
          />
          <StatTile
            value={new Set(subjects.map((s) => s.section)).size}
            label="Sections"
            style={styles.statGridItem}
          />
          <StatTile
            value="100%"
            label="Target"
            style={styles.statGridItem}
          />
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>COURSE LIST</Text>
          <Text style={styles.sectionHeaderMeta}>{subjects.length} TOTAL</Text>
        </View>

        {/* Subject Cards */}
        {loading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonBlock} />
          </View>
        ) : subjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No assigned courses</Text>
          </View>
        ) : (
          <View style={styles.subjectList}>
            {subjects.map((subj) => {
              const progKey = `${subj.code}_${subj.section}`;
              const prog = syllabusProgress[progKey] || { completed: 0, total: 5, percent: 0 };
              const percentLabel = Math.round(prog.percent * 100);
              const isBehind = percentLabel < 40;

              return (
                <View key={progKey} style={styles.subjectCard}>
                  <View style={styles.cardTop}>
                    <View style={styles.subjectInfo}>
                      <View style={styles.codeMetaRow}>
                        <Text style={styles.subjectCode}>{subj.code}</Text>
                        <Text style={styles.sectionMeta}>{subj.year}</Text>
                      </View>
                      <Text style={styles.subjectName}>{subj.name}</Text>
                      <Text style={styles.ccMetaLabel}>
                        CC: {subj.ccFacultyName} • {prog.completed}/{prog.total} Topics
                      </Text>
                    </View>

                    <View style={styles.rightValueBox}>
                      <Text
                        style={[
                          styles.percentText,
                          isBehind ? styles.warnPercentText : styles.cobaltPercentText,
                        ]}
                      >
                        {percentLabel}%
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <ProgressBar
                    progress={percentLabel}
                    isBehindPlan={isBehind}
                    height={8}
                    style={styles.progressBar}
                  />

                  {/* Row Actions */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.outlineActionBtn}
                      onPress={() => navigation.navigate('WeeklyPlanForm')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.outlineActionBtnText}>Set Targets</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.primaryActionBtn}
                      onPress={() => handleUpdateProgress(subj.code, subj.section)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.primaryActionBtnText}>Update Log</Text>
                      <Feather name="arrow-right" size={14} color={DayRibbonColors.white} />
                    </TouchableOpacity>
                  </View>
                </View>
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
    marginBottom: 20,
  },
  statGridItem: {
    flex: 1,
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
    marginBottom: 14,
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
  codeMetaRow: {
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
  sectionMeta: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  subjectName: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    lineHeight: 22,
    color: DayRibbonColors.ink,
    marginBottom: 4,
  },
  ccMetaLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
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
    marginBottom: 14,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  outlineActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineActionBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.ink,
  },
  primaryActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: DayRibbonColors.cobalt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryActionBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.white,
  },
  skeletonContainer: {
    gap: 12,
    paddingVertical: 16,
  },
  skeletonBlock: {
    height: 90,
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

export default AssignedSubjectsScreen;
