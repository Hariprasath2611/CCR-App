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
import { matchFacultyName } from '../../../utils/facultyMatcher';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { SegBar } from '@components/editorial/SegBar';

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
      const colors = ['#111111', '#111111', '#111111', '#111111', '#111111', '#111111'];
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

      const subjectsList = Object.values(sessionMap);
      subjectsList.sort((a, b) => a.section.localeCompare(b.section, undefined, { numeric: true, sensitivity: 'base' }));
      setSubjects(subjectsList);

      const progressMap: Record<string, { completed: number; total: number; percent: number }> = {};
      for (const subject of subjectsList) {
        const nodes = await syllabusRepo.getSyllabusBySubject(subject.code);
        const completed = nodes.filter((n) => n.is_completed === 1).length;
        const total = nodes.length || 5;
        progressMap[`${subject.code}_${subject.section}`] = {
          completed,
          total,
          percent: completed / total,
        };
      }
      setSyllabusProgress(progressMap);
    } catch (err) {
      console.error('Failed to load assigned subjects coverage:', err);
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
          <Label text="ACADEMIC CURRICULUM" />
          <Text style={styles.headerTitle}>
            ASSIGNED COURSES<Text style={styles.accentDot}>.</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Monitor syllabus logs, teaching targets and section coverage.
          </Text>
        </View>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* Stat Summary Row */}
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{subjects.length}</Text>
            <Label text="COURSES" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>
              {new Set(subjects.map((s) => s.section)).size}
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

        {/* Subject Rows */}
        {loading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonBlock} />
          </View>
        ) : subjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Label text="NO ASSIGNED COURSES" />
          </View>
        ) : (
          <View style={styles.subjectList}>
            {subjects.map((subj) => {
              const progKey = `${subj.code}_${subj.section}`;
              const prog = syllabusProgress[progKey] || { completed: 0, total: 5, percent: 0 };
              const percentLabel = Math.round(prog.percent * 100);
              const isLagging = percentLabel < 40;

              return (
                <View key={progKey} style={styles.subjectRow}>
                  <View style={styles.rowTop}>
                    <View style={styles.subjectInfo}>
                      <View style={styles.codeMetaRow}>
                        <Text style={styles.subjectCode}>{subj.code}</Text>
                        <Text style={styles.sectionMeta}>{subj.year}</Text>
                      </View>
                      <Text style={styles.subjectName}>{subj.name}</Text>
                      <Label
                        text={`CC: ${subj.ccFacultyName} • ${prog.completed}/${prog.total} TOPICS`}
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
                        {percentLabel}%
                      </Text>
                    </View>
                  </View>

                  {/* 25-Segment Bar */}
                  <View style={styles.segBarWrapper}>
                    <SegBar
                      totalSegments={25}
                      filledSegments={Math.round((percentLabel / 100) * 25)}
                      isLagging={isLagging}
                    />
                  </View>

                  {/* Row Action Buttons */}
                  <View style={styles.rowActions}>
                    <TouchableOpacity
                      style={styles.actionOutlineBtn}
                      onPress={() => navigation.navigate('WeeklyPlanForm')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionOutlineBtnText}>SET TARGETS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionPrimaryBtn}
                      onPress={() => handleUpdateProgress(subj.code, subj.section)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.actionPrimaryBtnText}>LOG PROGRESS</Text>
                      <Feather name="arrow-right" size={14} color={EditorialColors.white} />
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
    fontSize: 13,
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
  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: EditorialColors.ink,
  },
  subjectList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
  },
  subjectRow: {
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.ink,
    paddingVertical: 16,
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
    marginBottom: 14,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  actionOutlineBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionOutlineBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
  },
  actionPrimaryBtn: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionPrimaryBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.white,
  },
  skeletonContainer: {
    gap: 12,
    paddingVertical: 16,
  },
  skeletonBlock: {
    height: 90,
    backgroundColor: EditorialColors.track,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
});
