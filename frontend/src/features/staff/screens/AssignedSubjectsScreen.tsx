import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, ProgressBar, Button, ActivityIndicator } from 'react-native-paper';
import { SyllabusRepository } from '@database/repositories/SyllabusRepository';
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

const SUBJECT_DETAILS: SubjectInfo[] = [
  { code: 'CS8501', name: 'Object Oriented Programming', year: '2nd Year CSE', description: 'Core OOPS concepts, interfaces, exception handling, polymorphism, multithreading and collections framework.', color: '#0F52BA' },
  { code: 'CS8502', name: 'Java Programming', year: '3rd Year CSE', description: 'Advanced Java fundamentals, GUI building, JDBC database connectivity, servlets and enterprise programming models.', color: '#1B9CFC' },
  { code: 'CS8503', name: 'Database Management Systems', year: '4th Year CSE', description: 'Relational database designs, normalization models, SQL querying, concurrency control and NoSQL indexing setups.', color: '#8B5CF6' },
  { code: 'CS8504', name: 'OS Principles', year: 'Academic Course', description: 'Process management, CPU task scheduling, synchronization semaphores, paging algorithms, memory paging & disk IO scheduling.', color: '#10B981' },
];

export const AssignedSubjectsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const [syllabusProgress, setSyllabusProgress] = useState<Record<string, { completed: number; total: number; percent: number }>>({});
  const [loading, setLoading] = useState(true);

  const syllabusRepo = new SyllabusRepository();

  const loadData = async () => {
    try {
      setLoading(true);
      const progressMap: Record<string, { completed: number; total: number; percent: number }> = {};
      for (const subject of SUBJECT_DETAILS) {
        const nodes = await syllabusRepo.getSyllabusBySubject(subject.code);
        const completed = nodes.filter((n) => n.is_completed === 1).length;
        const total = nodes.length || 5; // Default fallback count
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
        SUBJECT_DETAILS.map((subj) => {
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
