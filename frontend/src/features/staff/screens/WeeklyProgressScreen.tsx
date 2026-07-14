import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
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
import { useReportStore } from '@features/cc/store/useReportStore';
import { Palette } from '@theme/colors';
import { StaffStackParamList } from '@navigation/types';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

type RouteParams = RouteProp<StaffStackParamList, 'WeeklyProgress'>;


const progressSchema = z.object({
  unit: z.string().min(1, 'Please select the main unit'),
  tempUnit: z.string().optional(),
  topicsCovered: z.string().min(1, 'Please type the topics covered'),
  completedOnPlan: z.enum(['YES', 'NO']),
  reasonsForPending: z.string().optional(),
  periodsPlanned: z.string().min(1, 'Please enter periods planned').refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: 'Must be a non-negative number',
  }).transform((val) => parseInt(val)),
  periodsHandled: z.string().min(1, 'Please enter periods handled').refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: 'Must be a non-negative number',
  }).transform((val) => parseInt(val)),
  periodsRequired: z.string().optional().transform((val) => val ? parseInt(val) : 0),
}).refine((data) => {
  if (data.completedOnPlan === 'NO' && (!data.reasonsForPending || data.reasonsForPending.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Please explain the reason for pending topics',
  path: ['reasonsForPending'],
});

type ProgressFormData = z.infer<typeof progressSchema>;

const SUBJECT_NAMES: Record<string, string> = {
  'CS8501': 'Theory of Computation (OOPS)',
  'CS8502': 'Database Systems (Java)',
  'CS8503': 'Computer Networks (DBMS)',
  'CS8504': 'OS Principles',
};

const UNIT_OPTIONS = [
  { label: 'Unit 1', value: 'Unit 1' },
  { label: 'Unit 2', value: 'Unit 2' },
  { label: 'Unit 3', value: 'Unit 3' },
  { label: 'Unit 4', value: 'Unit 4' },
  { label: 'Unit 5', value: 'Unit 5' },
];

const TEMP_UNIT_OPTIONS = [
  { label: 'None (No temporary unit)', value: 'None' },
  { label: 'Unit 1 (Temporary)', value: 'Unit 1' },
  { label: 'Unit 2 (Temporary)', value: 'Unit 2' },
  { label: 'Unit 3 (Temporary)', value: 'Unit 3' },
  { label: 'Unit 4 (Temporary)', value: 'Unit 4' },
  { label: 'Unit 5 (Temporary)', value: 'Unit 5' },
];

export const WeeklyProgressScreen = () => {
  const user = useAuthStore((state) => state.user);
  const addProgressLog = useReportStore((state) => state.addProgressLog);
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();

  // Safeguards for route parameters
  const subjectCode = route.params?.subjectCode || 'CS8502';
  const weekNumber = route.params?.weekNumber || 12;

  const [syllabusNodes, setSyllabusNodes] = useState<SQLiteSyllabusNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const syllabusRepo = new SyllabusRepository();
  const syncQueueRepo = new SyncQueueRepository();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      unit: '',
      tempUnit: 'None',
      topicsCovered: '',
      completedOnPlan: 'YES',
      reasonsForPending: '',
      periodsPlanned: '4',
      periodsHandled: '4',
      periodsRequired: '0',
    },
  });

  const completedOnPlan = watch('completedOnPlan');

  useEffect(() => {
    const loadSyllabus = async () => {
      try {
        setLoading(true);
        const nodes = await syllabusRepo.getSyllabusBySubject(subjectCode);
        setSyllabusNodes(nodes);
      } catch (err) {
        console.error('Failed to load syllabus:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSyllabus();
  }, [subjectCode]);

  const onSubmit = async (data: ProgressFormData) => {
    setIsSubmitting(true);
    try {
      const classId = user?.assignedClassId || 'CSE-B';

      // 1. Mark topics in SQLite based on unit coverage
      const selectedUnitTopics = syllabusNodes.filter(
        (n) => n.unit.toLowerCase() === data.unit.toLowerCase()
      );
      
      const completedTopicIds = data.completedOnPlan === 'YES' 
        ? selectedUnitTopics.map((n) => n.topic_id) 
        : [];
      
      const pendingTopicIds = data.completedOnPlan === 'NO'
        ? selectedUnitTopics.map((n) => n.topic_id)
        : [];

      for (const node of syllabusNodes) {
        const isTargetUnit = node.unit.toLowerCase() === data.unit.toLowerCase();
        let finalStatus = node.is_completed === 1;

        if (isTargetUnit) {
          finalStatus = (data.completedOnPlan === 'YES');
        }

        await syllabusRepo.updateCompletionStatus(
          node.topic_id,
          finalStatus,
          finalStatus ? new Date().toISOString().split('T')[0] : undefined
        );
      }

      // Re-read DB completion states to compile correct overall summary counts
      const updatedNodes = await syllabusRepo.getSyllabusBySubject(subjectCode);
      const totalCount = updatedNodes.length || 5;
      const completedCount = updatedNodes.filter((n) => n.is_completed === 1).length;

      // 2. Update Consolidated Report Store
      addProgressLog(
        classId,
        weekNumber,
        subjectCode,
        completedCount,
        totalCount,
        data.reasonsForPending || '',
        data.completedOnPlan === 'NO',
        data.periodsPlanned,
        data.periodsHandled,
        data.periodsRequired || 0,
        data.topicsCovered
      );

      // 3. Sync Queue logging
      const progressPayload = {
        id: `progress_${subjectCode}_W${weekNumber}_${Date.now()}`,
        facultyId: user?.id,
        subjectCode,
        classId,
        academicWeekNumber: weekNumber,
        unitSelected: data.unit,
        temporaryUnit: data.tempUnit !== 'None' ? data.tempUnit : null,
        topicsCoveredText: data.topicsCovered,
        completedOnPlan: data.completedOnPlan,
        completedTopicIds,
        pendingTopicIds,
        reasonsForPending: data.reasonsForPending || '',
        submittedAt: new Date().toISOString(),
        periodsPlanned: data.periodsPlanned,
        periodsHandled: data.periodsHandled,
        periodsRequired: data.periodsRequired || 0,
      };
      await syncQueueRepo.enqueue('SUBMIT_PROGRESS', progressPayload);

      Alert.alert('Success', 'Course coverage successfully logged and synchronized!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error('Progress submit failed:', err);
      Alert.alert('Error', 'Failed to log course coverage.');
    } finally {
      setIsSubmitting(false);
    }
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
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.subjectIconBox}>
          <Feather name="book-open" size={24} color={Palette.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headingText}>Course Coverage</Text>
          <Text style={styles.subjectName}>{SUBJECT_NAMES[subjectCode] || 'Subject Course'}</Text>
          <Text style={styles.weekLabel}>
            Code: {subjectCode} · Class: {user?.assignedClassId || 'CSE-B'} · Week {weekNumber}
          </Text>
        </View>
      </View>

      {/* Main Unit Selector */}
      <Controller
        control={control}
        name="unit"
        render={({ field: { onChange, value } }) => (
          <AppDropdown
            label="Select Unit"
            value={value}
            options={UNIT_OPTIONS}
            onSelect={onChange}
            error={errors.unit?.message}
          />
        )}
      />

      {/* Temporary Unit Selector */}
      <Controller
        control={control}
        name="tempUnit"
        render={({ field: { onChange, value } }) => (
          <AppDropdown
            label="Select Unit (Temporary / Extra Hour)"
            value={value || 'None'}
            options={TEMP_UNIT_OPTIONS}
            onSelect={onChange}
            error={errors.tempUnit?.message}
            style={styles.dropdownSpacing}
          />
        )}
      />

      {/* Topics Covered Typing Box */}
      <Controller
        control={control}
        name="topicsCovered"
        render={({ field: { onChange, value } }) => (
          <AppTextInput
            label="Topics Covered (Type topics covered)"
            value={value || ''}
            onChangeText={onChange}
            error={errors.topicsCovered?.message}
            multiline
            numberOfLines={8}
            style={styles.textInput}
          />
        )}
      />

      {/* Completed Based on Plan Toggle */}
      <Text style={styles.radioGroupLabel}>Completed based on plan?</Text>
      <View style={styles.radioRow}>
        <TouchableOpacity
          style={[styles.radioCard, completedOnPlan === 'YES' && styles.radioCardSelected]}
          onPress={() => setValue('completedOnPlan', 'YES')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons 
            name={completedOnPlan === 'YES' ? 'checkbox-marked-circle' : 'circle-outline'} 
            size={20} 
            color={completedOnPlan === 'YES' ? Palette.success : Palette.textLight} 
          />
          <Text style={[styles.radioLabel, completedOnPlan === 'YES' && styles.radioLabelSelected]}>Yes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.radioCard, completedOnPlan === 'NO' && styles.radioCardSelectedNo]}
          onPress={() => setValue('completedOnPlan', 'NO')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons 
            name={completedOnPlan === 'NO' ? 'close-circle' : 'circle-outline'} 
            size={20} 
            color={completedOnPlan === 'NO' ? Palette.error : Palette.textLight} 
          />
          <Text style={[styles.radioLabel, completedOnPlan === 'NO' && styles.radioLabelSelectedNo]}>No</Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Reason for Pending Topics Typing Box */}
      {completedOnPlan === 'NO' && (
        <Controller
          control={control}
          name="reasonsForPending"
          render={({ field: { onChange, value } }) => (
            <AppTextInput
              label="Reason for pending topics"
              value={value || ''}
              onChangeText={onChange}
              error={errors.reasonsForPending?.message}
              multiline
              numberOfLines={3}
              style={styles.textInputReason}
            />
          )}
        />
      )}

      <AppButton
        mode="contained"
        title="Log Course Coverage"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={styles.submitBtn}
      />
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
    marginBottom: 24,
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
  headingText: {
    fontSize: 20,
    fontWeight: '900',
    color: Palette.textDark,
    letterSpacing: -0.4,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.primary,
    marginTop: 2,
  },
  weekLabel: {
    fontSize: 12,
    color: Palette.textLight,
    marginTop: 2,
    fontWeight: '500',
  },
  dropdownSpacing: {
    marginTop: 12,
  },
  textInput: {
    marginTop: 14,
  },
  radioGroupLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textDark,
    marginTop: 20,
    marginBottom: 10,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  radioCard: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Palette.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  radioCardSelected: {
    borderColor: Palette.success,
    backgroundColor: '#ECFDF5',
  },
  radioCardSelectedNo: {
    borderColor: Palette.error,
    backgroundColor: '#FEF2F2',
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textLight,
    marginLeft: 8,
  },
  radioLabelSelected: {
    color: Palette.success,
  },
  radioLabelSelectedNo: {
    color: Palette.error,
  },
  textInputReason: {
    marginTop: 8,
  },
  submitBtn: {
    marginTop: 24,
    backgroundColor: Palette.primary,
  },
});
