import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppDropdown } from '@components/common/AppDropdown';
import { SyllabusRepository } from '@database/repositories/SyllabusRepository';
import { SyncQueueRepository } from '@database/repositories/SyncQueueRepository';
import { SQLiteSyllabusNode } from '@database/types';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { syncEngine } from '@features/sync/syncEngine';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { EditorialToggle } from '@components/editorial/EditorialToggle';
import { Feather } from '@expo/vector-icons';

const progressSchema = z.object({
  subjectCode: z.string().min(1, 'Subject code is required'),
  academicWeekNumber: z.string().min(1, 'Academic week number is required'),
  reasonsForPending: z.string().optional(),
  extraHoursRequested: z.boolean(),
});

type ProgressFormData = z.infer<typeof progressSchema>;

export const ProgressLogScreen = () => {
  const insets = useSafeAreaInsets();
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
      academicWeekNumber: '12',
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

      await syncQueueRepo.enqueue('SUBMIT_PROGRESS', progressPayload);

      syncEngine.triggerSync().catch((err) => {
        console.error('Trigger sync after submission failed:', err);
      });

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
          <Label text="SYLLABUS PROGRESS TRACKER" />
          <Text style={styles.headerTitle}>
            LOG PROGRESS<Text style={styles.accentDot}>.</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Record completed curriculum topics, delivery notes and extra hour requests.
          </Text>
        </View>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* Form Inputs */}
        <View style={styles.formSection}>
          <Controller
            control={control}
            name="subjectCode"
            render={({ field: { onChange, value } }) => (
              <View style={styles.dropdownBlock}>
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
              </View>
            )}
          />

          <Controller
            control={control}
            name="academicWeekNumber"
            render={({ field: { onChange, value } }) => (
              <View style={styles.dropdownBlock}>
                <AppDropdown
                  label="Academic Week Number"
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
              </View>
            )}
          />

          {syllabusNodes.length > 0 && (
            <View style={styles.syllabusBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>COMPLETED TOPICS THIS WEEK</Text>
                <Label text={`${completedTopics.length}/${syllabusNodes.length} DONE`} />
              </View>

              <View style={styles.topicList}>
                {syllabusNodes.map((node) => {
                  const checked = completedTopics.includes(node.topic_id);
                  return (
                    <TouchableOpacity
                      key={node.topic_id}
                      style={styles.topicRow}
                      onPress={() => handleTopicToggle(node.topic_id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.checkboxSquare,
                          checked ? styles.checkboxSquareChecked : null,
                        ]}
                      >
                        {checked && (
                          <Feather name="check" size={14} color={EditorialColors.white} />
                        )}
                      </View>

                      <View style={styles.topicInfo}>
                        <Text style={styles.topicText}>{node.topic_title}</Text>
                        <Label text={node.unit} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Reasons for Pending */}
          <Controller
            control={control}
            name="reasonsForPending"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>REASONS FOR PENDING TOPICS (IF ANY)</Text>
                <TextInput
                  style={[
                    styles.underlineInput,
                    errors.reasonsForPending ? styles.errorBorder : null,
                  ]}
                  value={value || ''}
                  onChangeText={onChange}
                  placeholder="Explain pedagogical adjustments, holidays or leave..."
                  placeholderTextColor={EditorialColors.muted}
                  multiline
                />
                {errors.reasonsForPending && (
                  <Text style={styles.errorText}>
                    {errors.reasonsForPending.message?.toUpperCase()}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Toggle for Extra Hours */}
          <Controller
            control={control}
            name="extraHoursRequested"
            render={({ field: { onChange, value } }) => (
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleLabel}>REQUEST EXTRA TEACHING HOURS</Text>
                  <Text style={styles.toggleSub}>
                    Notify Coordinator & HOD to allocate a revision slot.
                  </Text>
                </View>
                <EditorialToggle
                  value={value}
                  onValueChange={onChange}
                />
              </View>
            )}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryActionText}>
              {isSubmitting ? 'LOGGING...' : 'LOG WEEKLY PROGRESS'}
            </Text>
            <Feather name="arrow-right" size={16} color={EditorialColors.white} />
          </TouchableOpacity>
        </View>
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
  formSection: {
    marginBottom: 20,
  },
  dropdownBlock: {
    marginBottom: 16,
  },
  inputBlock: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
    marginBottom: 6,
  },
  underlineInput: {
    minHeight: 48,
    borderBottomWidth: 2,
    borderBottomColor: EditorialColors.ink,
    fontFamily: EditorialFonts.semibold,
    fontSize: 15,
    color: EditorialColors.ink,
    paddingVertical: 8,
  },
  errorBorder: {
    borderBottomColor: EditorialColors.accent,
  },
  errorText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.accent,
    marginTop: 6,
  },
  syllabusBlock: {
    marginTop: 10,
    marginBottom: 20,
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
  topicList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.track,
    gap: 12,
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareChecked: {
    backgroundColor: EditorialColors.ink,
  },
  topicInfo: {
    flex: 1,
  },
  topicText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: EditorialColors.ink,
    marginBottom: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.ink,
    marginBottom: 24,
  },
  toggleTextCol: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
    marginBottom: 2,
  },
  toggleSub: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
  },
  primaryActionButton: {
    height: 54,
    width: '100%',
    backgroundColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  primaryActionText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.white,
  },
});
