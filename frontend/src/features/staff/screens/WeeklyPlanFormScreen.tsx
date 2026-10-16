import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppDropdown } from '@components/common/AppDropdown';
import { SyllabusRepository } from '@database/repositories/SyllabusRepository';
import { WeeklyPlanRepository } from '@database/repositories/WeeklyPlanRepository';
import { SyncQueueRepository } from '@database/repositories/SyncQueueRepository';
import { SQLiteSyllabusNode } from '@database/types';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { syncEngine } from '@features/sync/syncEngine';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { Label } from '@components/editorial/Label';
import { Feather } from '@expo/vector-icons';

const planSchema = z.object({
  weekNo: z.string().min(1, 'Academic week number is required'),
  subjectCode: z.string().min(1, 'Subject code is required'),
});

type PlanFormData = z.infer<typeof planSchema>;

export const WeeklyPlanFormScreen = () => {
  const insets = useSafeAreaInsets();
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

      await syncQueueRepo.enqueue('CREATE_PLAN', planPayload);

      syncEngine.triggerSync().catch((err) => {
        console.error('Trigger sync after submission failed:', err);
      });

      await planRepo.savePlanDraft(
        planPayload.id,
        planPayload.academicWeekNumber,
        planPayload.subjectCode,
        selectedTopics,
        'SUBMITTED',
        false
      );

      Alert.alert('Success', 'Weekly Target Plan Submitted Successfully (Offline Synchronized)!');
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
          <Label text="ACADEMIC TARGETING" />
          <Text style={styles.headerTitle}>Weekly Plan</Text>
          <Text style={styles.headerSubtitle}>
            Configure weekly syllabus targets and teaching topic coverage milestones.
          </Text>
        </View>

        {/* Form Inputs */}
        <View style={styles.formSection}>
          <Controller
            control={control}
            name="weekNo"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>ACADEMIC WEEK NUMBER</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors.weekNo ? styles.errorBorder : null,
                  ]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g. 12"
                  placeholderTextColor={DayRibbonColors.mutedSoft}
                  keyboardType="numeric"
                />
                {errors.weekNo && (
                  <Text style={styles.errorText}>
                    {errors.weekNo.message}
                  </Text>
                )}
              </View>
            )}
          />

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

          {syllabusNodes.length > 0 && (
            <View style={styles.syllabusBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>SYLLABUS TARGETS</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {selectedTopics.length}/{syllabusNodes.length} SELECTED
                  </Text>
                </View>
              </View>

              <View style={styles.topicList}>
                {syllabusNodes.map((node) => {
                  const checked = selectedTopics.includes(node.topic_id);
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

          {/* Action Buttons */}
          <View style={styles.actionButtonGroup}>
            <TouchableOpacity
              style={styles.outlineActionBtn}
              onPress={handleSaveDraft}
              activeOpacity={0.7}
            >
              <Text style={styles.outlineActionBtnText}>Save Draft (Offline)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionBtnText}>
                {isSubmitting ? 'Submitting...' : 'Submit Plan'}
              </Text>
              <Feather name="arrow-right" size={16} color={DayRibbonColors.surface} />
            </TouchableOpacity>
          </View>
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
  inputBlock: {
    marginBottom: 16,
  },
  dropdownBlock: {
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
    height: 52,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.surface,
    fontFamily: DayRibbonFonts.body600,
    fontSize: 15,
    color: DayRibbonColors.ink,
    paddingHorizontal: 16,
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
  actionButtonGroup: {
    gap: 12,
    marginTop: 10,
  },
  outlineActionBtn: {
    height: 52,
    width: '100%',
    borderRadius: DayRibbonShapes.buttonRadius,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.ink,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineActionBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.ink,
  },
  primaryActionBtn: {
    height: 52,
    width: '100%',
    borderRadius: DayRibbonShapes.buttonRadius,
    backgroundColor: DayRibbonColors.cobalt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryActionBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.surface,
  },
});
