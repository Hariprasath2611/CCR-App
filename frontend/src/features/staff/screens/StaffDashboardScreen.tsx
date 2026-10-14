import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, Avatar, ProgressBar, ActivityIndicator, Button } from 'react-native-paper';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { SyllabusRepository } from '@database/repositories/SyllabusRepository';
import { TimetableRepository } from '@database/repositories/TimetableRepository';
import { matchFacultyName } from '../../../utils/facultyMatcher';
import { Palette } from '@theme/colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ms } from '@theme/responsive';

const { width } = Dimensions.get('window');

import { getCCForSection } from '@config/facultyBoard';

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
  
  // Local state
  const [handledSubjects, setHandledSubjects] = useState<SubjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  // Repository
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
      
      // Group slots by (subject_code, class_section) so sessions for different sections show separately
      const sessionMap: Record<string, {
        code: string;
        name: string;
        section: string;
        yearPrefix: string;
        shortName: string;
        color: string;
      }> = {};

      const colors = ['#0F52BA', '#1B9CFC', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
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

      // Merge dynamically allocated subjects from CC
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

      // Fetch syllabus progress for each section session
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

  // Reload data every time this screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getInitials = (name?: string) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .filter((w) => w.length > 0)
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleSubjectPress = (code: string, section?: string) => {
    navigation.navigate('WeeklyProgress', { subjectCode: code, classSection: section, weekNumber: 12 });
  };

  // Determine user role badge label
  const getRoleLabel = () => {
    if (user?.role === 'HOD') return 'Head of Department (HOD)';
    if (user?.isClassCoordinator) return `Class Coordinator (${user.assignedClassId || 'CSE-B'})`;
    return 'Subject Faculty Professor';
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Palette.primary]} />
      }
    >
      {/* ── HEADER BLOCK ── */}
      <View style={[styles.headerBackground, { paddingTop: Math.max(insets.top, ms(16)) + ms(16) }]}>
        <View style={styles.headerTop}>
          <Avatar.Text 
            size={56} 
            label={getInitials(user?.name)} 
            style={styles.avatar} 
            labelStyle={styles.avatarLabel}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeGreeting}>Welcome,</Text>
            <Text style={styles.facultyName}>{user?.name || 'Professor'}</Text>
            <Text style={styles.roleTag}>{getRoleLabel()} • {user?.department || 'Computer Science Engineering'}</Text>
          </View>
        </View>

        {/* Dynamic Summary Stats Box */}
        <View style={styles.statsSummaryBox}>
          <View style={styles.statItem}>
            <Text style={styles.statItemNum}>{handledSubjects.length}</Text>
            <Text style={styles.statItemLabel}>Assigned Subjects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statItemNum, { color: Palette.primary }]}>{overallProgress}%</Text>
            <Text style={styles.statItemLabel}>Overall Progress</Text>
          </View>
        </View>
      </View>

      {/* ── QUICK ACTION: LOG MANUAL COURSE COVERAGE (ALL DEPTS & YEARS) ── */}
      <View style={{ paddingHorizontal: ms(16), marginBottom: ms(16) }}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('WeeklyProgress', { subjectCode: '', weekNumber: 12 })}
          style={{
            backgroundColor: Palette.primary,
            borderRadius: ms(16),
            padding: ms(16),
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: Palette.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View
            style={{
              width: ms(44),
              height: ms(44),
              borderRadius: ms(22),
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: ms(12),
            }}
          >
            <MaterialCommunityIcons name="playlist-edit" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: ms(15), fontWeight: '800', color: '#FFFFFF' }}>
              Log Course Coverage
            </Text>
            <Text style={{ fontSize: ms(11.5), color: 'rgba(255, 255, 255, 0.85)', marginTop: ms(2) }}>
              Select any Department, 1st - 4th Year, or Section
            </Text>
          </View>
          <Feather name="arrow-right-circle" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ── SUBJECT HANDLING SECTION ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Subject Handling</Text>
        <Text style={styles.sectionSubtitle}>Tap card to update weekly syllabus logs</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Palette.primary} />
          <Text style={styles.loaderText}>Loading handled subjects...</Text>
        </View>
      ) : (
        <View style={styles.subjectsContainer}>
          {handledSubjects.map((subj) => {
            return (
              <TouchableOpacity
                key={`${subj.code}_${subj.section}`}
                activeOpacity={0.9}
                onPress={() => handleSubjectPress(subj.code, subj.section)}
                style={styles.subjectCardWrapper}
              >
                <Card style={[styles.subjectCard, { borderLeftColor: subj.color }]}>
                  <Card.Content style={styles.subjectCardContent}>
                    <View style={styles.subjHeader}>
                      <Text style={styles.subjYear}>{subj.yearDisplay}</Text>
                      <View style={[styles.codeBadge, { backgroundColor: subj.color + '15' }]}>
                        <Text style={[styles.codeBadgeText, { color: subj.color }]}>{subj.code}</Text>
                      </View>
                    </View>

                    <Text style={styles.subjName} numberOfLines={1}>
                      {subj.name} ({subj.shortName})
                    </Text>
                    <Text style={{ fontSize: ms(11.5), color: Palette.primary, fontWeight: '700', marginTop: ms(2) }}>
                      CC: {subj.ccFacultyName}
                    </Text>

                    {/* Live Progress Bar */}
                    <View style={styles.progressRow}>
                      <Text style={styles.progressLabel}>Syllabus Completion</Text>
                      <Text style={[styles.progressVal, { color: subj.color }]}>{subj.percent}%</Text>
                    </View>
                    <ProgressBar 
                      progress={subj.percent / 100} 
                      color={subj.color} 
                      style={styles.progressBar} 
                    />

                    <View style={styles.cardFooter}>
                      <Text style={styles.topicsCount}>
                        {subj.totalTopics > 0 ? `${subj.completedTopics}/${subj.totalTopics} Topics Completed` : 'Tap to log weekly progress'}
                      </Text>
                      <Feather name="chevron-right" size={16} color={Palette.textLight} />
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingBottom: ms(40),
  },
  
  // Header styles
  headerBackground: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: ms(32),
    borderBottomRightRadius: ms(32),
    padding: ms(24),
    paddingTop: ms(36),
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(10) },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    borderBottomWidth: 1,
    borderColor: 'rgba(15, 82, 186, 0.05)',
    marginBottom: ms(20),
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: Palette.primary,
    shadowColor: Palette.primary,
    shadowOffset: { width: ms(0), height: ms(8) },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarLabel: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerTextContainer: {
    marginLeft: ms(16),
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: ms(13),
    color: Palette.textLight,
    fontWeight: '500',
  },
  facultyName: {
    fontSize: ms(22),
    fontWeight: '900',
    color: Palette.textDark,
    letterSpacing: -0.4,
  },
  roleTag: {
    fontSize: ms(12),
    color: Palette.primary,
    fontWeight: '700',
    marginTop: ms(2),
    marginBottom: ms(4),
  },

  // Dynamic Summary Stats Box
  statsSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: ms(16),
    paddingVertical: ms(12),
    paddingHorizontal: ms(16),
    marginTop: ms(18),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statItemNum: {
    fontSize: ms(20),
    fontWeight: '900',
    color: Palette.textDark,
  },
  statItemLabel: {
    fontSize: ms(11),
    fontWeight: '600',
    color: Palette.textLight,
    marginTop: ms(2),
  },
  statDivider: {
    width: 1,
    height: ms(24),
    backgroundColor: '#CBD5E1',
  },
  headerDashboardBtn: {
    marginTop: ms(8),
    alignSelf: 'flex-start',
    borderRadius: ms(8),
    backgroundColor: Palette.primary,
  },
  headerDashboardBtnLabel: {
    fontSize: ms(11),
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: ms(1),
    marginHorizontal: ms(4),
  },
  syncStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: ms(20),
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: ms(16),
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ms(5),
    paddingHorizontal: ms(10),
    borderRadius: ms(20),
  },
  syncingBadge: {
    backgroundColor: Palette.primary,
  },
  pendingBadge: {
    backgroundColor: Palette.warning,
  },
  syncedBadge: {
    backgroundColor: Palette.success,
  },
  spinner: {
    marginRight: ms(6),
  },
  syncText: {
    fontSize: ms(11),
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: ms(4),
  },
  deptSub: {
    fontSize: ms(11),
    color: Palette.textLight,
    fontWeight: '600',
  },

  // Subjects Section styles
  sectionHeader: {
    paddingHorizontal: ms(20),
    marginBottom: ms(16),
  },
  sectionTitle: {
    fontSize: ms(18),
    fontWeight: '900',
    color: Palette.textDark,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: ms(12),
    color: Palette.textLight,
    marginTop: ms(2),
  },
  subjectsContainer: {
    paddingHorizontal: ms(20),
  },
  subjectCardWrapper: {
    marginBottom: ms(14),
    width: '100%',
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    borderLeftWidth: 5,
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(6) },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  subjectCardContent: {
    padding: ms(16),
  },
  subjHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(8),
  },
  subjYear: {
    fontSize: ms(12),
    fontWeight: '700',
    color: Palette.textLight,
    textTransform: 'uppercase',
  },
  codeBadge: {
    paddingVertical: ms(3),
    paddingHorizontal: ms(8),
    borderRadius: ms(8),
  },
  codeBadgeText: {
    fontSize: ms(11),
    fontWeight: '800',
  },
  subjName: {
    fontSize: ms(15),
    fontWeight: '800',
    color: Palette.textDark,
    marginBottom: ms(12),
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(6),
  },
  progressLabel: {
    fontSize: ms(11),
    color: Palette.textLight,
    fontWeight: '600',
  },
  progressVal: {
    fontSize: ms(13),
    fontWeight: '800',
  },
  progressBar: {
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: '#E2E8F0',
    marginBottom: ms(12),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: ms(10),
  },
  topicsCount: {
    fontSize: ms(11),
    color: Palette.textLight,
    fontWeight: '500',
  },
  loader: {
    paddingVertical: ms(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: ms(12),
    fontSize: ms(13),
    color: Palette.textLight,
    fontWeight: '500',
  },
});
