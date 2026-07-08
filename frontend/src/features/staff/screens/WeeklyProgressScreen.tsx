import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Checkbox, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppTextInput } from '@components/common/AppTextInput';
import { AppButton } from '@components/common/AppButton';
import { SyllabusRepository } from '@database/repositories/SyllabusRepository';
import { SyncQueueRepository } from '@database/repositories/SyncQueueRepository';
import { SQLiteSyllabusNode } from '@database/types';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useReportStore } from '@features/cc/store/useReportStore';
import { Palette } from '@theme/colors';
import { StaffStackParamList } from '@navigation/types';
import { Feather } from '@expo/vector-icons';

type RouteParams = RouteProp<StaffStackParamList, 'WeeklyProgress'>;

const progressSchema = z.object({
  reasonsForPending: z.string().optional(),
  extraHoursRequested: z.boolean(),
});

type ProgressFormData = z.infer<typeof progressSchema>;

const SUBJECT_NAMES: Record<string, string> = {
  'CS8501': 'Theory of Computation',
  'CS8502': 'Database Systems',
  'CS8503': 'Computer Networks',
  'CS8504': 'OS Principles',
};

export const WeeklyProgressScreen = () => {
  const user = useAuthStore((state) => state.user);
  const addProgressLog = useReportStore((state) => state.addProgressLog);
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();

  // Safeguards for route parameters
  const subjectCode = route.params?.subjectCode || 'CS8502';
  const weekNumber = route.params?.weekNumber || 12;

  const [syllabusNodes, setSyllabusNodes] = useState<SQLiteSyllabusNode[]>([]);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const syllabusRepo = new SyllabusRepository();
  const syncQueueRepo = new SyncQueueRepository();

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      reasonsForPending: '',
      extraHoursRequested: false,
    },
  });

  useEffect(() => {
    const loadSyllabus = async () => {
      try {
        setLoading(true);
        const nodes = await syllabusRepo.getSyllabusBySubject(subjectCode);
        setSyllabusNodes(nodes);
        
        // Load initial completed topic IDs from SQLite table
        const completed = nodes.filter((n) => n.is_completed === 1).map((n) => n.topic_id);
        setCompletedTopics(completed);
      } catch (err) {
        console.error('Failed to load syllabus:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSyllabus();
  }, [subjectCode]);

  const handleTopicToggle = (topicId: string) => {
    setCompletedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const onSubmit = async (data: ProgressFormData) => {
    const pendingTopics = syllabusNodes
      .filter((n) => !completedTopics.includes(n.topic_id))
      .map((n) => n.topic_id);

    if (pendingTopics.length > 0 && !data.reasonsForPending?.trim()) {
      Alert.alert('Validation Error', 'You must provide a reason for the pending topics.');
      return;
    }

    setIsSubmitting(true);
    try {
      const classId = user?.assignedClassId || 'CSE-B';
      const completedCount = completedTopics.length;
      const totalCount = syllabusNodes.length;

      // 1. Log in global Zustand Report Store so CC consolidated screens see it
      addProgressLog(
        classId,
        weekNumber,
        subjectCode,
        completedCount,
        totalCount,
        data.reasonsForPending || '',
        data.extraHoursRequested
      );

      // 2. Queue for background synchronizing
      const progressPayload = {
        id: `progress_${subjectCode}_W${weekNumber}_${Date.now()}`,
        facultyId: user?.id,
        subjectCode,
        classId,
        academicWeekNumber: weekNumber,
        completedTopicIds: completedTopics,
        pendingTopicIds: pendingTopics,
        reasonsForPending: data.reasonsForPending || '',
        extraHoursRequested: data.extraHoursRequested,
        submittedAt: new Date().toISOString(),
      };
      await syncQueueRepo.enqueue('SUBMIT_PROGRESS', progressPayload);

      // 3. Update local SQLite DB syllabus progress completion values
      for (const node of syllabusNodes) {
        const isNowCompleted = completedTopics.includes(node.topic_id);
        await syllabusRepo.updateCompletionStatus(
          node.topic_id,
          isNowCompleted,
          isNowCompleted ? new Date().toISOString().split('T')[0] : undefined
        );
      }

      Alert.alert('Success', 'Weekly progress successfully enqueued & synced!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error('Progress submit failed:', err);
      Alert.alert('Error', 'Failed to log weekly progress.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Loading Syllabus...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.formCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={styles.subjectIconBox}>
              <Feather name="book" size={24} color={Palette.primary} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.subjectCode}>{subjectCode}</Text>
              <Text style={styles.subjectName}>{SUBJECT_NAMES[subjectCode] || 'Subject Course'}</Text>
              <Text style={styles.weekLabel}>Class: {user?.assignedClassId || 'CSE-B'} · Week {weekNumber}</Text>
            </View>
          </View>

          {/* Syllabus Topics Checklist */}
          <View style={styles.syllabusBlock}>
            <Text style={styles.syllabusLabel}>Check Covered Topics for Week {weekNumber}:</Text>
            {syllabusNodes.length === 0 ? (
              <Text style={styles.emptyText}>No topics found for this subject.</Text>
            ) : (
              syllabusNodes.map((node) => {
                const checked = completedTopics.includes(node.topic_id);
                return (
                  <TouchableOpacity
                    key={node.topic_id}
                    style={[styles.checkboxRow, checked && styles.checkboxRowChecked]}
                    onPress={() => handleTopicToggle(node.topic_id)}
                    activeOpacity={0.7}
                  >
                    <Checkbox.Android
                      status={checked ? 'checked' : 'unchecked'}
                      onPress={() => handleTopicToggle(node.topic_id)}
                      color={Palette.primary}
                    />
                    <View style={styles.topicTextContainer}>
                      <Text style={[styles.topicUnit, checked && styles.topicTextChecked]}>{node.unit}</Text>
                      <Text style={[styles.topicTitle, checked && styles.topicTextChecked]}>{node.topic_title}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Reasons for Pending Field */}
          <Controller
            control={control}
            name="reasonsForPending"
            render={({ field: { onChange, value } }) => (
              <AppTextInput
                label="Reasons for Pending Topics (Required if any left unchecked)"
                value={value || ''}
                onChangeText={onChange}
                error={errors.reasonsForPending?.message}
                multiline
                numberOfLines={3}
                style={styles.textInput}
              />
            )}
          />

          {/* Extra Hours Request Toggler */}
          <View style={styles.extraHoursRow}>
            <Controller
              control={control}
              name="extraHoursRequested"
              render={({ field: { onChange, value } }) => (
                <Checkbox.Android
                  status={value ? 'checked' : 'unchecked'}
                  onPress={() => onChange(!value)}
                  color={Palette.primary}
                />
              )}
            />
            <Text style={styles.extraHoursLabel}>Request Extra Teaching Slot for this class</Text>
          </View>

          <AppButton
            mode="contained"
            title="Log Weekly Progress"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={styles.submitBtn}
          />
        </Card.Content>
      </Card>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: Palette.textLight,
  },
  formCard: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
    paddingBottom: 16,
  },
  subjectIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EDF5FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  subjectCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Palette.primary,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Palette.textDark,
  },
  weekLabel: {
    fontSize: 13,
    color: Palette.textLight,
    marginTop: 2,
  },
  syllabusBlock: {
    marginBottom: 16,
  },
  syllabusLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.textDark,
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  checkboxRowChecked: {
    borderColor: '#D2E0F5',
    backgroundColor: '#EDF5FD',
  },
  topicTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  topicUnit: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Palette.textLight,
    textTransform: 'uppercase',
  },
  topicTitle: {
    fontSize: 14,
    color: Palette.textDark,
    fontWeight: '500',
  },
  topicTextChecked: {
    color: '#0B5ED7',
  },
  emptyText: {
    color: Palette.textLight,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  textInput: {
    marginTop: 10,
  },
  extraHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 4,
  },
  extraHoursLabel: {
    fontSize: 14,
    color: Palette.textDark,
    marginLeft: 8,
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: 24,
    backgroundColor: Palette.primary,
  },
});
