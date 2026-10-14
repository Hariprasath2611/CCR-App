import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, ProgressBar, Badge, Button, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CCStackParamList } from '@navigation/types';
import { useReportStore, SubjectProgress } from '../store/useReportStore';
import { getSectionTemplate } from '@config/sectionTemplates';
import { getCCForSection } from '@config/facultyBoard';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ms } from '@theme/responsive';

type RouteParams = RouteProp<CCStackParamList, 'ClassProgress'>;
type NavProp = NativeStackNavigationProp<CCStackParamList>;

export const ClassProgressScreen = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavProp>();
  const classId = route.params?.classId || '1st Year SEC-A';
  const selectedWeek = 12;

  const subjectProgressList = useReportStore((state) => state.subjectProgressList);
  const fetchWeeklyProgress = useReportStore((state) => state.fetchWeeklyProgress);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWeeklyProgress(classId, selectedWeek);
  }, [classId, selectedWeek]);

  const tmpl = getSectionTemplate(classId);
  const ccInfo = getCCForSection(classId);
  const subjects: SubjectProgress[] = subjectProgressList[`${classId}_${selectedWeek}`] || [];

  const completedCount = subjects.filter((s) => s.status === 'Submitted').length;
  const avgCoverage =
    subjects.length > 0
      ? Math.round(subjects.reduce((sum, s) => sum + s.coverage, 0) / subjects.length)
      : 80;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Class Overview Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.classBadge}>
            <Text style={styles.classBadgeText}>{classId}</Text>
          </View>
          <View style={styles.coverageBadge}>
            <Text style={styles.coverageBadgeText}>{avgCoverage}% Avg Coverage</Text>
          </View>
        </View>

        <Text style={styles.title}>Class Course Coverage Tracker</Text>
        <Text style={styles.subtitle}>
          Class Coordinator: <Text style={{ fontWeight: '700', color: Palette.primary }}>{ccInfo?.facultyName || 'Designated CC'}</Text>
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{subjects.length}</Text>
            <Text style={styles.statLabel}>Total Subjects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: Palette.success }]}>{completedCount}</Text>
            <Text style={styles.statLabel}>Logged this Week</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: subjects.length - completedCount > 0 ? Palette.warning : Palette.success }]}>
              {subjects.length - completedCount}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Quick CC Navigation Buttons */}
        <View style={styles.quickActions}>
          <Button
            mode="contained-tonal"
            icon="account-multiple-plus"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('FacultyAllocation')}
          >
            Allocate Teachers
          </Button>

          <Button
            mode="contained-tonal"
            icon="clock-alert-outline"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('PendingSubmissions', { classId })}
          >
            Pending List
          </Button>
        </View>
      </View>

      {/* Subjects Roster */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Curriculum Subjects & Progress</Text>
        <Text style={styles.weekTag}>Week {selectedWeek}</Text>
      </View>

      {subjects.map((sub, idx) => {
        const isLogged = sub.status === 'Submitted';
        return (
          <TouchableOpacity
            key={sub.code}
            onPress={() =>
              navigation.navigate('SubjectProgressDetail', { progressId: `${classId}_${sub.code}` })
            }
            activeOpacity={0.85}
          >
            <Card style={styles.subjectCard}>
              <Card.Content>
                <View style={styles.subCardHeader}>
                  <View style={styles.codePill}>
                    <Text style={styles.codePillText}>{sub.code}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: isLogged ? '#ECFDF5' : '#FEF2F2' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: isLogged ? Palette.success : Palette.error },
                      ]}
                    >
                      {isLogged ? 'LOGGED' : 'PENDING'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.subName}>{sub.name}</Text>
                <Text style={styles.facultyName}>Teacher: {sub.faculty}</Text>

                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Coverage Completion</Text>
                  <Text style={styles.progressPercent}>{sub.coverage}%</Text>
                </View>

                <ProgressBar
                  progress={sub.coverage / 100}
                  color={sub.coverage >= 75 ? Palette.primary : Palette.warning}
                  style={styles.progressBar}
                />

                <View style={styles.subFooter}>
                  <Text style={styles.topicsCount}>
                    {sub.completedTopicsCount} Topics Recorded
                  </Text>
                  <Feather name="chevron-right" size={16} color={Palette.textLight} />
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        );
      })}

      {/* Action to submit to HOD */}
      <Button
        mode="contained"
        icon="file-document-check"
        style={styles.consolidateBtn}
        onPress={() => navigation.navigate('ConsolidatedReport', { classId, weekNumber: selectedWeek })}
      >
        View Consolidated Spreadsheet & Submit to HOD
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: ms(16),
    paddingBottom: ms(40),
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    padding: ms(18),
    marginBottom: ms(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(10),
  },
  classBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: ms(12),
    paddingVertical: ms(4),
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  classBadgeText: {
    fontSize: ms(13),
    fontWeight: '800',
    color: Palette.primary,
  },
  coverageBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: ms(10),
    paddingVertical: ms(4),
    borderRadius: ms(8),
  },
  coverageBadgeText: {
    fontSize: ms(12),
    fontWeight: '800',
    color: Palette.success,
  },
  title: {
    fontSize: ms(19),
    fontWeight: '900',
    color: Palette.textDark,
  },
  subtitle: {
    fontSize: ms(12.5),
    color: Palette.textLight,
    marginTop: ms(2),
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: ms(14),
    paddingVertical: ms(10),
    marginTop: ms(14),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    fontSize: ms(18),
    fontWeight: '900',
    color: Palette.textDark,
  },
  statLabel: {
    fontSize: ms(11),
    color: Palette.textLight,
    marginTop: ms(2),
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: ms(24),
    backgroundColor: '#CBD5E1',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: ms(14),
  },
  quickBtn: {
    flex: 0.48,
    borderRadius: ms(10),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(12),
  },
  sectionTitle: {
    fontSize: ms(15),
    fontWeight: '800',
    color: Palette.textDark,
  },
  weekTag: {
    fontSize: ms(12),
    fontWeight: '700',
    color: Palette.primary,
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    marginBottom: ms(12),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
  },
  subCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(6),
  },
  codePillText: {
    fontSize: ms(12),
    fontWeight: '800',
    color: Palette.textDark,
  },
  statusPill: {
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(6),
  },
  statusPillText: {
    fontSize: ms(10.5),
    fontWeight: '800',
  },
  subName: {
    fontSize: ms(14.5),
    fontWeight: '800',
    color: Palette.textDark,
    marginTop: ms(8),
  },
  facultyName: {
    fontSize: ms(12),
    color: Palette.textLight,
    marginTop: ms(2),
    fontWeight: '500',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: ms(10),
  },
  progressLabel: {
    fontSize: ms(11.5),
    color: Palette.textLight,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: ms(12),
    fontWeight: '800',
    color: Palette.primary,
  },
  progressBar: {
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: '#E2E8F0',
    marginTop: ms(4),
  },
  subFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: ms(10),
    paddingTop: ms(6),
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  topicsCount: {
    fontSize: ms(11.5),
    color: Palette.textLight,
  },
  consolidateBtn: {
    backgroundColor: Palette.primary,
    borderRadius: ms(12),
    marginTop: ms(12),
    paddingVertical: ms(4),
  },
});

export default ClassProgressScreen;
