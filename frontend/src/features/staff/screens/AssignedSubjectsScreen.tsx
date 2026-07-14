import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, ProgressBar, Button, ActivityIndicator } from 'react-native-paper';
import { SyllabusRepository } from '@database/repositories/SyllabusRepository';
import { TimetableRepository } from '@database/repositories/TimetableRepository';
import { Palette } from '@theme/colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StaffStackParamList } from '@navigation/types';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface SubjectInfo {
  code: string;
  name: string;
  year: string;
  description: string;
  color: string;
}

export const AssignedSubjectsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [syllabusProgress, setSyllabusProgress] = useState<Record<string, { completed: number; total: number; percent: number }>>({});
  const [loading, setLoading] = useState(true);

  const syllabusRepo = new SyllabusRepository();
  const timetableRepo = new TimetableRepository();

  const loadData = async () => {
    try {
      setLoading(true);
      const slots = await timetableRepo.getTimetable();
      
      const subjectMap: Record<string, SubjectInfo> = {};
      const colors = ['#0F52BA', '#1B9CFC', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
      let colorIdx = 0;

      for (const slot of slots) {
        if (!subjectMap[slot.subject_code]) {
          let year = 'Academic Course';
          if (slot.class_section.includes('1st')) year = '1st Year CSE';
          else if (slot.class_section.includes('2nd') || slot.class_section === 'CSE-B') year = '2nd Year CSE';
          else if (slot.class_section.includes('3rd')) year = '3rd Year CSE';
          else if (slot.class_section.includes('4th')) year = '4th Year CSE';

          subjectMap[slot.subject_code] = {
            code: slot.subject_code,
            name: slot.subject_name,
            year: `${year} (${slot.class_section})`,
            description: `Syllabus log coverage tracker for ${slot.subject_name}.`,
            color: colors[colorIdx % colors.length],
          };
          colorIdx++;
        }
      }

      const subjectsList = Object.values(subjectMap);
      setSubjects(subjectsList);

      const progressMap: Record<string, { completed: number; total: number; percent: number }> = {};
      for (const subject of subjectsList) {
        const nodes = await syllabusRepo.getSyllabusBySubject(subject.code);
        const completed = nodes.filter((n) => n.is_completed === 1).length;
        const total = nodes.length || 5;
        progressMap[subject.code] = {
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

  const handleUpdateProgress = (subjectCode: string) => {
    navigation.navigate('WeeklyProgress', { subjectCode, weekNumber: 12 });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assigned Courses</Text>
        <Text style={styles.headerSubtitle}>Monitor syllabus logs and academic target configurations</Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Palette.primary} />
          <Text style={styles.loaderText}>Loading course coverages...</Text>
        </View>
      ) : (
        subjects.map((subj) => {
          const prog = syllabusProgress[subj.code] || { completed: 0, total: 5, percent: 0 };
          const percentLabel = Math.round(prog.percent * 100);

          return (
            <Card key={subj.code} style={[styles.card, { borderLeftColor: subj.color }]}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.topRow}>
                  <Text style={styles.yearText}>{subj.year}</Text>
                  <View style={[styles.codeBadge, { backgroundColor: subj.color + '15' }]}>
                    <Text style={[styles.codeBadgeText, { color: subj.color }]}>{subj.code}</Text>
                  </View>
                </View>

                <Text style={styles.subjectName}>{subj.name}</Text>
                <Text style={styles.descriptionText}>{subj.description}</Text>

                {/* Progress bar info */}
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Syllabus Coverage</Text>
                  <Text style={[styles.progressPct, { color: subj.color }]}>{percentLabel}% Completed</Text>
                </View>

                <ProgressBar
                  progress={prog.percent}
                  color={subj.color}
                  style={styles.progressBar}
                />

                <View style={styles.detailsRow}>
                  <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={14} color={Palette.textLight} />
                  <Text style={styles.detailsText}>
                    {prog.completed} topics covered out of {prog.total} total syllabus nodes
                  </Text>
                </View>

                {/* Card Actions */}
                <View style={styles.actionsContainer}>
                  <Button
                    mode="outlined"
                    compact
                    icon="calendar-range"
                    style={styles.actionBtn}
                    textColor={Palette.textDark}
                    onPress={() => navigation.navigate('WeeklyPlanForm')}
                  >
                    Set Targets
                  </Button>
                  <Button
                    mode="contained"
                    compact
                    icon="plus"
                    style={[styles.actionBtn, { backgroundColor: subj.color }]}
                    onPress={() => handleUpdateProgress(subj.code)}
                  >
                    Log Progress
                  </Button>
                </View>
              </Card.Content>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Palette.textDark,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Palette.textLight,
    marginTop: 2,
  },
  loader: {
    paddingVertical: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: Palette.textLight,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    borderLeftWidth: 5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardContent: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  yearText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textLight,
    textTransform: 'uppercase',
  },
  codeBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  codeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.textDark,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 12,
    color: Palette.textLight,
    lineHeight: 18,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textDark,
  },
  progressPct: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsText: {
    fontSize: 11.5,
    color: Palette.textLight,
    marginLeft: 6,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  actionBtn: {
    flex: 0.48,
    borderRadius: 10,
  },
});

export default AssignedSubjectsScreen;
