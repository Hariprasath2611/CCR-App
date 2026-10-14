import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Checkbox } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppTextInput } from '@components/common/AppTextInput';
import { AppButton } from '@components/common/AppButton';
import { AppDropdown } from '@components/common/AppDropdown';
import { SyllabusRepository } from '@database/repositories/SyllabusRepository';
import { SyncQueueRepository } from '@database/repositories/SyncQueueRepository';
import { SQLiteSyllabusNode } from '@database/types';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { Palette } from '@theme/colors';
import { syncEngine } from '@features/sync/syncEngine';

import { ms } from '@theme/responsive';

const progressSchema = z.object({
  subjectCode: z.string().min(1, 'Subject code is required'),
  academicWeekNumber: z.string().min(1, 'Academic week number is required'),
  reasonsForPending: z.string().optional(),
  extraHoursRequested: z.boolean(),
});

type ProgressFormData = z.infer<typeof progressSchema>;

export const ProgressLogScreen = () => {
  const user = useAuthStore((state) => state.user);
  const [syllabusNodes, setSyllabusNodes] = useState<SQLiteSyllabusNode[]>([]);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const syllabusRepo = new SyllabusRepository();
  const syncQueueRepo = new SyncQueueRepository();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      subjectCode: '',
      academicWeekNumber: '',
      reasonsForPending: '',
      extraHoursRequested: false,
    },
  });

  const subjectCodeVal = watch('subjectCode');

  useEffect(() => {
    const loadSyllabus = async () => {
      if (subjectCodeVal) {
        const nodes = await syllabusRepo.getSyllabusBySubject(subjectCodeVal);
        setSyllabusNodes(nodes);
        
        // Initial setup for completed topics list
        const completed = nodes.filter((n) => n.is_completed === 1).map((n) => n.topic_id);
        setCompletedTopics(completed);
      } else {
        setSyllabusNodes([]);
        setCompletedTopics([]);
      }
    };
    loadSyllabus();
  }, [subjectCodeVal]);

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
      Alert.alert('Validation', 'You must provide a reason for the pending topics.');
      return;
    }

    setIsSubmitting(true);
    try {
      const progressPayload = {
        id: `progress_${data.subjectCode}_${data.academicWeekNumber}_${Date.now()}`,
        facultyId: user?.id,
        subjectCode: data.subjectCode,
        classId: user?.assignedClassId || 'CSE-B',
        academicWeekNumber: parseInt(data.academicWeekNumber),
        completedTopicIds: completedTopics,
        pendingTopicIds: pendingTopics,
        reasonsForPending: data.reasonsForPending || '',
        extraHoursRequested: data.extraHoursRequested,
        submittedAt: new Date().toISOString(),
      };

      // Add to sync queue for background syncing
      await syncQueueRepo.enqueue('SUBMIT_PROGRESS', progressPayload);

      // Trigger background sync immediately to send the log to MongoDB
      syncEngine.triggerSync().catch((err) => {
        console.error('Trigger sync after submission failed:', err);
      });

      // Locally update SQLite syllabus table checkbox status
      for (const node of syllabusNodes) {
        const isNowCompleted = completedTopics.includes(node.topic_id);
        await syllabusRepo.updateCompletionStatus(
          node.topic_id,
          isNowCompleted,
          isNowCompleted ? new Date().toISOString().split('T')[0] : undefined
        );
      }

      Alert.alert('Success', 'Syllabus Weekly Progress Logged (Offline Sync Enqueued)!');
      setValue('subjectCode', '');
      setValue('academicWeekNumber', '');
      setValue('reasonsForPending', '');
      setValue('extraHoursRequested', false);
      setCompletedTopics([]);
    } catch (err) {
      console.error('Progress submit failed:', err);
      Alert.alert('Error', 'Failed to log weekly progress.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.formCard}>
        <Card.Title title="Weekly Progress Log" subtitle="Log units & topics coverage progress" />
        <Card.Content>
          <Controller
            control={control}
            name="subjectCode"
            render={({ field: { onChange, value } }) => (
              <AppDropdown
                label="Course Subject"
                value={value}
                options={[
                  { label: 'CS8501 - Theory of Computation', value: 'CS8501' },
                  { label: 'CS8502 - Database Systems', value: 'CS8502' },
                  { label: 'CS8503 - Computer Networks', value: 'CS8503' },
                ]}
                onSelect={onChange}
                error={errors.subjectCode?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="academicWeekNumber"
            render={({ field: { onChange, value } }) => (
              <AppDropdown
                label="Current Week Number"
                value={value}
                options={[
                  { label: 'Week 11', value: '11' },
                  { label: 'Week 12', value: '12' },
                  { label: 'Week 13', value: '13' },
                  { label: 'Week 14', value: '14' },
                ]}
                onSelect={onChange}
                error={errors.academicWeekNumber?.message}
              />
            )}
          />

          {syllabusNodes.length > 0 && (
            <View style={styles.syllabusBlock}>
              <Text style={styles.syllabusLabel}>Mark Completed Topics this Week:</Text>
              {syllabusNodes.map((node) => {
                const checked = completedTopics.includes(node.topic_id);
                return (
                  <View key={node.topic_id} style={styles.checkboxRow}>
                    <Checkbox.Android
                      status={checked ? 'checked' : 'unchecked'}
                      onPress={() => handleTopicToggle(node.topic_id)}
                      color={Palette.primary}
                    />
                    <Text style={styles.topicText} onPress={() => handleTopicToggle(node.topic_id)}>
                      {node.topic_title}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <Controller
            control={control}
            name="reasonsForPending"
            render={({ field: { onChange, value } }) => (
              <AppTextInput
                label="Reasons for Pending Topics (Required if any)"
                value={value || ''}
                onChangeText={onChange}
                error={errors.reasonsForPending?.message}
                multiline
                numberOfLines={3}
                style={styles.textInput}
              />
            )}
          />

          <View style={styles.checkboxRow}>
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
            <Text style={styles.extraHoursLabel}>Request Extra Teaching Hours for Section</Text>
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
  contentContainer: {
    padding: ms(16),
    paddingBottom: ms(40),
  },
  formCard: {
    backgroundColor: Palette.surface,
    borderRadius: ms(12),
    marginBottom: ms(32),
  },
  syllabusBlock: {
    marginTop: ms(16),
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    paddingTop: ms(16),
    marginBottom: ms(16),
  },
  syllabusLabel: {
    fontSize: ms(16),
    fontWeight: 'bold',
    color: Palette.textDark,
    marginBottom: ms(10),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ms(4),
  },
  topicText: {
    fontSize: ms(15),
    color: Palette.textDark,
    flex: 1,
    marginLeft: ms(8),
  },
  textInput: {
    marginTop: ms(12),
  },
  extraHoursLabel: {
    fontSize: ms(15),
    color: Palette.textDark,
    marginLeft: ms(8),
  },
  submitBtn: {
    marginTop: ms(24),
  },
});
