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
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { Label } from '@components/editorial/Label';
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
      <StatusBar barStyle="dark-content" backgroundColor={DayRibbonColors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, DayRibbonSpacing.topSafeArea),
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Label text="SYLLABUS PROGRESS TRACKER" />
          <Text style={styles.headerTitle}>Log Progress</Text>
          <Text style={styles.headerSubtitle}>
            Record completed curriculum topics, delivery notes and extra hour requests.
          </Text>
        </View>

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
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {completedTopics.length}/{syllabusNodes.length} DONE
                  </Text>
                </View>
              </View>

              <View style={styles.topicList}>
                {syllabusNodes.map((node) => {
                  const checked = completedTopics.includes(node.topic_id);
                  return (
                    <TouchableOpacity
                      key={node.topic_id}
                      style={styles.topicCard}
                      onPress={() => handleTopicToggle(node.topic_id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.checkboxCircle,
                          checked ? styles.checkboxCircleChecked : null,
                        ]}
                      >
                        {checked && (
                          <Feather name="check" size={14} color={DayRibbonColors.surface} />
                        )}
                      </View>

                      <View style={styles.topicInfo}>
                        <Text style={styles.topicText}>{node.topic_title}</Text>
                        <Text style={styles.topicUnit}>{node.unit}</Text>
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
                    styles.textInput,
                    errors.reasonsForPending ? styles.errorBorder : null,
                  ]}
                  value={value || ''}
                  onChangeText={onChange}
                  placeholder="Explain pedagogical adjustments, holidays or leave..."
                  placeholderTextColor={DayRibbonColors.mutedSoft}
                  multiline
                />
                {errors.reasonsForPending && (
                  <Text style={styles.errorText}>
                    {errors.reasonsForPending.message}
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
              <View style={styles.toggleCard}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleLabel}>Request Extra Teaching Hours</Text>
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
              {isSubmitting ? 'Logging...' : 'Log Weekly Progress'}
            </Text>
            <Feather name="arrow-right" size={16} color={DayRibbonColors.surface} />
          </TouchableOpacity>
        </View>
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
  headerTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: DayRibbonColors.ink,
    marginTop: 4,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
    lineHeight: 18,
  },
  formSection: {
    marginBottom: 20,
  },
  dropdownBlock: {
    marginBottom: 16,
  },
  inputBlock: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    letterSpacing: 1,
    color: DayRibbonColors.muted,
    marginBottom: 6,
  },
  textInput: {
    minHeight: 80,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.surface,
    fontFamily: DayRibbonFonts.body600,
    fontSize: 14,
    color: DayRibbonColors.ink,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  errorBorder: {
    borderColor: DayRibbonColors.warn,
  },
  errorText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    color: DayRibbonColors.warn,
    marginTop: 4,
  },
  syllabusBlock: {
    marginTop: 8,
    marginBottom: 20,
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
    letterSpacing: 1.2,
    color: DayRibbonColors.ink,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: DayRibbonShapes.chipRadius,
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  countBadgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.muted,
  },
  topicList: {
    gap: 8,
  },
  topicCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCircleChecked: {
    backgroundColor: DayRibbonColors.cobalt,
    borderColor: DayRibbonColors.cobalt,
  },
  topicInfo: {
    flex: 1,
  },
  topicText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 14,
    lineHeight: 20,
    color: DayRibbonColors.ink,
    marginBottom: 2,
  },
  topicUnit: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: DayRibbonShapes.cardRadius,
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    marginBottom: 20,
  },
  toggleTextCol: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.ink,
    marginBottom: 2,
  },
  toggleSub: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  primaryActionButton: {
    height: 52,
    width: '100%',
    borderRadius: DayRibbonShapes.buttonRadius,
    backgroundColor: DayRibbonColors.cobalt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryActionText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.surface,
  },
});
