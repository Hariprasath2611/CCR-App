import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, ScrollView } from 'react-native';
import { Text, Checkbox, Card } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppTextInput } from '@components/common/AppTextInput';
import { AppButton } from '@components/common/AppButton';
import { AppDropdown } from '@components/common/AppDropdown';
import { SyllabusRepository } from '@database/repositories/SyllabusRepository';
import { WeeklyPlanRepository } from '@database/repositories/WeeklyPlanRepository';
import { SyncQueueRepository } from '@database/repositories/SyncQueueRepository';
import { SQLiteSyllabusNode } from '@database/types';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { Palette } from '@theme/colors';
import { syncEngine } from '@features/sync/syncEngine';

const planSchema = z.object({
  weekNo: z.string().min(1, 'Academic week number is required'),
  subjectCode: z.string().min(1, 'Subject code is required'),
});

type PlanFormData = z.infer<typeof planSchema>;

export const WeeklyPlanFormScreen = () => {
  const user = useAuthStore((state) => state.user);
  const [syllabusNodes, setSyllabusNodes] = useState<SQLiteSyllabusNode[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const syllabusRepo = new SyllabusRepository();
  const planRepo = new WeeklyPlanRepository();
  const syncQueueRepo = new SyncQueueRepository();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      weekNo: '12',
      subjectCode: '',
    },
  });

  const subjectCodeVal = watch('subjectCode');

  // Load syllabus topics from database when subject changes
  useEffect(() => {
    const loadSyllabus = async () => {
      if (subjectCodeVal) {
        const nodes = await syllabusRepo.getSyllabusBySubject(subjectCodeVal);
        setSyllabusNodes(nodes);
      } else {
        setSyllabusNodes([]);
      }
    };
    loadSyllabus();
  }, [subjectCodeVal]);

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSaveDraft = async () => {
    const values = watch();
    if (!values.subjectCode || !values.weekNo) {
      Alert.alert('Validation', 'Please fill out Week Number and Subject Code first.');
      return;
    }
    const id = `draft_${values.subjectCode}_${values.weekNo}`;
    await planRepo.savePlanDraft(
      id,
      parseInt(values.weekNo),
      values.subjectCode,
      selectedTopics,
      'DRAFT',
      true
    );
    Alert.alert('Saved', 'Plan Draft Saved Locally!');
  };

  const onSubmit = async (data: PlanFormData) => {
    if (selectedTopics.length === 0) {
      Alert.alert('Validation', 'Please select at least one syllabus topic.');
      return;
    }
    setIsSubmitting(true);
    try {
      const planPayload = {
        id: `plan_${data.subjectCode}_${data.weekNo}_${Date.now()}`,
        facultyId: user?.id,
        subjectCode: data.subjectCode,
        academicWeekNumber: parseInt(data.weekNo),
        targetTopicIds: selectedTopics,
        status: 'SUBMITTED',
      };

      // Add to sync queue for background execution
      await syncQueueRepo.enqueue('CREATE_PLAN', planPayload);

      // Trigger background sync immediately to send the log to MongoDB
      syncEngine.triggerSync().catch((err) => {
        console.error('Trigger sync after submission failed:', err);
      });

      // Save locally to DB as a non-draft
      await planRepo.savePlanDraft(
        planPayload.id,
        planPayload.academicWeekNumber,
        planPayload.subjectCode,
        selectedTopics,
        'SUBMITTED',
        false
      );

      Alert.alert('Success', 'Weekly Target Plan Submitted Successfully (Offline Synchronized)!');
      // Reset selections
      setSelectedTopics([]);
      setValue('weekNo', '');
      setValue('subjectCode', '');
    } catch (err) {
      console.error('Plan submit failed:', err);
      Alert.alert('Error', 'Failed to submit weekly plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.formCard}>
        <Card.Title title="Weekly Plan Planner" subtitle="Design weekly syllabus completion targets" />
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

          {syllabusNodes.length > 0 && (
            <View style={styles.syllabusBlock}>
              <Text style={styles.syllabusLabel}>Select Syllabus Topics Targets:</Text>
              {syllabusNodes.map((node) => {
                const checked = selectedTopics.includes(node.topic_id);
                return (
                  <View key={node.topic_id} style={styles.checkboxRow}>
                    <Checkbox.Android
                      status={checked ? 'checked' : 'unchecked'}
                      onPress={() => handleTopicToggle(node.topic_id)}
                      color={Palette.primary}
                    />
                    <Text style={styles.topicText} onPress={() => handleTopicToggle(node.topic_id)}>
                      {node.topic_title} ({node.unit})
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <AppButton
              mode="outlined"
              title="Save Draft (Offline)"
              onPress={handleSaveDraft}
              style={styles.draftBtn}
            />
            <AppButton
              mode="contained"
              title="Submit Plan"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.submitBtn}
            />
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Palette.background,
  },
  formCard: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    marginBottom: 32,
  },
  syllabusBlock: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    paddingTop: 16,
  },
  syllabusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Palette.textDark,
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  topicText: {
    fontSize: 15,
    color: Palette.textDark,
    flex: 1,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  draftBtn: {
    flex: 0.48,
  },
  submitBtn: {
    flex: 0.48,
  },
});
