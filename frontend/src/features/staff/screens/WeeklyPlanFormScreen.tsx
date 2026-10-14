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
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
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
          <Label text="ACADEMIC TARGETING" />
          <Text style={styles.headerTitle}>
            WEEKLY PLAN<Text style={styles.accentDot}>.</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Configure weekly syllabus targets and teaching topic coverage milestones.
          </Text>
        </View>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

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
                    styles.underlineInput,
                    errors.weekNo ? styles.errorBorder : null,
                  ]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g. 12"
                  placeholderTextColor={EditorialColors.muted}
                  keyboardType="numeric"
                />
                {errors.weekNo && (
                  <Text style={styles.errorText}>
                    {errors.weekNo.message?.toUpperCase()}
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
                <Label text={`${selectedTopics.length}/${syllabusNodes.length} SELECTED`} />
              </View>

              <View style={styles.topicList}>
                {syllabusNodes.map((node) => {
                  const checked = selectedTopics.includes(node.topic_id);
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

          {/* Action Buttons */}
          <View style={styles.actionButtonGroup}>
            <TouchableOpacity
              style={styles.outlineActionBtn}
              onPress={handleSaveDraft}
              activeOpacity={0.7}
            >
              <Text style={styles.outlineActionBtnText}>SAVE DRAFT (OFFLINE)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionBtnText}>
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT PLAN'}
              </Text>
              <Feather name="arrow-right" size={16} color={EditorialColors.white} />
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
  inputBlock: {
    marginBottom: 20,
  },
  dropdownBlock: {
    marginBottom: 10,
  },
  inputLabel: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
    marginBottom: 6,
  },
  underlineInput: {
    height: 48,
    borderBottomWidth: 2,
    borderBottomColor: EditorialColors.ink,
    fontFamily: EditorialFonts.semibold,
    fontSize: 16,
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
    marginTop: 16,
    marginBottom: 24,
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
  actionButtonGroup: {
    gap: 12,
    marginTop: 10,
  },
  outlineActionBtn: {
    height: 54,
    width: '100%',
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineActionBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.ink,
  },
  primaryActionBtn: {
    height: 54,
    width: '100%',
    backgroundColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  primaryActionBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.white,
  },
});
