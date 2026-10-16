import React, { useState, useEffect, useMemo } from 'react';
import { Alert, StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppTextInput } from '@components/common/AppTextInput';
import { CreatableTopicSelect } from '@components/common/CreatableTopicSelect';
import { AppButton } from '@components/common/AppButton';
import { AppDropdown } from '@components/common/AppDropdown';
import { DatePickerField } from '@components/common/DatePickerField';
import { SyllabusRepository } from '@database/repositories/SyllabusRepository';
import { SyncQueueRepository } from '@database/repositories/SyncQueueRepository';
import { SQLiteSyllabusNode } from '@database/types';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useReportStore } from '@features/cc/store/useReportStore';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { Rule } from '@components/editorial/Rule';
import { Label } from '@components/editorial/Label';
import { syncEngine } from '@features/sync/syncEngine';
import { apiClient } from '@services/api/apiClient';
import { StaffStackParamList } from '@navigation/types';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ms } from '@theme/responsive';


type RouteParams = RouteProp<StaffStackParamList, 'WeeklyProgress'>;

const progressSchema = z.object({
  academicYear: z.string().optional(),
  department: z.string().optional(),
  classSection: z.string().optional(),
  subjectCode: z.string().optional(),
  subjectName: z.string().optional(),
  weekNumber: z.string().min(1, 'Please select the week number'),
  fromDate: z.string().min(10, 'Use DD/MM/YYYY format').regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Must be in DD/MM/YYYY format'),
  toDate: z.string().min(10, 'Use DD/MM/YYYY format').regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Must be in DD/MM/YYYY format'),
  unit: z.string().min(1, 'Please select the main unit'),
  tempUnit: z.string().optional(),
  topicsCovered: z.string().min(1, 'Please type the topics covered'),
  periodsPlanned: z.string().min(1, 'Please enter periods planned').refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: 'Must be a non-negative number',
  }),
  periodsHandled: z.string().min(1, 'Please enter periods handled').refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: 'Must be a non-negative number',
  }),
  periodsRequired: z.string().optional(),
  completedOnPlan: z.enum(['YES', 'NO']),
  reasonsForPending: z.string().optional(),
  cumulativePercent: z.string().min(1, 'Please enter cumulative completion progress (e.g. Unit 1 - 75%)'),
}).refine((data) => {
  const pPlan = parseInt(data.periodsPlanned) || 0;
  const pHandled = parseInt(data.periodsHandled) || 0;
  const isLagging = data.completedOnPlan === 'NO' || pHandled < pPlan;
  if (isLagging && (!data.reasonsForPending || data.reasonsForPending.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Please explain the reason for pending topics or period deficit',
  path: ['reasonsForPending'],
});

type ProgressFormData = z.infer<typeof progressSchema>;

const WEEK_OPTIONS = Array.from({ length: 16 }, (_, i) => ({
  label: `Week ${i + 1}`,
  value: (i + 1).toString(),
}));

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
  const subjectProgressList = useReportStore((state) => state.subjectProgressList);
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();

  // Initial parameters from navigation if provided
  const initialSubjectCode = route.params?.subjectCode || '';
  const initialClassSection = (route.params as any)?.classSection || user?.assignedClassId || '1st Year SEC-B';
  const initialWeekNumber = (route.params?.weekNumber || 12).toString();

  // Determine initial Year & Dept
  const is1stYear = initialClassSection.includes('1st Year') || initialClassSection.includes('SEC-');
  const initialYear = is1stYear ? '1st Year' : (initialClassSection.includes('2nd') ? '2nd Year' : initialClassSection.includes('3rd') ? '3rd Year' : '4th Year');
  const initialDept = is1stYear ? 'General Engineering' : 'CSE';

  const [syllabusNodes, setSyllabusNodes] = useState<SQLiteSyllabusNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const syllabusRepo = new SyllabusRepository();
  const syncQueueRepo = new SyncQueueRepository();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      academicYear: initialYear,
      department: initialDept,
      classSection: initialClassSection,
      subjectCode: initialSubjectCode || 'CS3591',
      subjectName: '',
      weekNumber: initialWeekNumber,
      unit: 'Unit 1',
      tempUnit: 'None',
      topicsCovered: '',
      completedOnPlan: 'YES',
      reasonsForPending: '',
      periodsPlanned: '4',
      periodsHandled: '4',
      periodsRequired: '0',
      fromDate: '',
      toDate: '',
      cumulativePercent: 'Unit 1 - 75%',
    },
  });

  const selectedYear = watch('academicYear');
  const selectedDept = watch('department');
  const selectedClass = watch('classSection');
  const selectedSubjectCode = watch('subjectCode');
  const completedOnPlan = watch('completedOnPlan');
  const periodsPlanned = watch('periodsPlanned');
  const periodsHandled = watch('periodsHandled');
  const unit = watch('unit');

  // Algorithm 1 Dynamic calculations in UI
  const paceRatio = useMemo(() => {
    const planned = parseInt(periodsPlanned) || 0;
    const handled = parseInt(periodsHandled) || 0;
    if (planned === 0) return 1.0;
    return Number((handled / planned).toFixed(2));
  }, [periodsPlanned, periodsHandled]);

  const periodsDeficit = useMemo(() => {
    const planned = parseInt(periodsPlanned) || 0;
    const handled = parseInt(periodsHandled) || 0;
    return Math.max(0, planned - handled);
  }, [periodsPlanned, periodsHandled]);

  const isLagging = completedOnPlan === 'NO' || periodsDeficit > 0;



  // Load syllabus topics if available for subject code
  useEffect(() => {
    const loadSyllabus = async () => {
      if (!selectedSubjectCode) return;
      try {
        setLoading(true);
        const nodes = await syllabusRepo.getSyllabusBySubject(selectedSubjectCode);
        setSyllabusNodes(nodes);
      } catch (err) {
        console.error('Failed to load syllabus:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSyllabus();
  }, [selectedSubjectCode]);

  // Pre-populate week-to-week carry-over progress from previous/current week logs
  useEffect(() => {
    const currentWeekNum = parseInt(watch('weekNumber') || '12');
    const activeClass = selectedClass || initialClassSection;
    const currentKey = `${activeClass}_${currentWeekNum}`;
    const prevKey = `${activeClass}_${currentWeekNum - 1}`;
    
    const currentLogs = subjectProgressList[currentKey];
    const prevLogs = subjectProgressList[prevKey];
    
    const subjectLog = (currentLogs && currentLogs.find(s => s.code === selectedSubjectCode)) ||
                       (prevLogs && prevLogs.find(s => s.code === selectedSubjectCode));
    
    if (subjectLog) {
      if (subjectLog.topicsCoveredText) setValue('topicsCovered', subjectLog.topicsCoveredText);
      if (subjectLog.cumulativePercent) setValue('cumulativePercent', subjectLog.cumulativePercent);
      if (subjectLog.fromDate) setValue('fromDate', subjectLog.fromDate);
      if (subjectLog.toDate) setValue('toDate', subjectLog.toDate);
      if (subjectLog.reasonsForPending) setValue('reasonsForPending', subjectLog.reasonsForPending);
    }
  }, [selectedClass, selectedSubjectCode, watch('weekNumber'), subjectProgressList, setValue]);

  const onSubmit = async (data: ProgressFormData) => {
    setIsSubmitting(true);
    try {
      const classId = data.classSection || initialClassSection || '3rd Year CSE-A';
      const finalSubjectCode = data.subjectCode || initialSubjectCode || (user?.role === 'STAFF' ? 'CCS370' : 'CS3591');
      const finalSubjectName = data.subjectName || (finalSubjectCode === 'CCS370' ? 'UI and UX Design' : 'Course Subject');
      const finalYear = data.academicYear || initialYear || '3rd Year';
      const finalDept = data.department || initialDept || 'CSE';
      const finalWeekNumber = parseInt(data.weekNumber) || parseInt(initialWeekNumber) || 12;
      const pPlanned = parseInt(data.periodsPlanned);
      const pHandled = parseInt(data.periodsHandled);
      const pRequired = data.periodsRequired ? parseInt(data.periodsRequired) : periodsDeficit;

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

      // Re-read DB completion states
      const updatedNodes = await syllabusRepo.getSyllabusBySubject(finalSubjectCode);
      const totalCount = updatedNodes.length || 5;
      const completedCount = updatedNodes.filter((n) => n.is_completed === 1).length;

      // 2. Update Consolidated Report Store
      addProgressLog(
        classId,
        finalWeekNumber,
        finalSubjectCode,
        completedCount,
        totalCount,
        data.reasonsForPending || '',
        data.completedOnPlan === 'NO' || pHandled < pPlanned,
        pPlanned,
        pHandled,
        pRequired,
        data.topicsCovered,
        undefined,
        data.fromDate,
        data.toDate,
        data.cumulativePercent,
        data.completedOnPlan
      );

      // 3. Sync Queue logging
      const progressPayload = {
        id: `progress_${finalSubjectCode}_W${finalWeekNumber}_${Date.now()}`,
        facultyId: user?.id,
        facultyName: user?.name,
        facultyEmail: user?.email,
        academicYear: finalYear,
        department: finalDept,
        subjectCode: finalSubjectCode,
        subjectName: finalSubjectName,
        classId,
        academicWeekNumber: finalWeekNumber,
        unitSelected: data.unit,
        temporaryUnit: data.tempUnit !== 'None' ? data.tempUnit : null,
        topicsCoveredText: data.topicsCovered,
        completedOnPlan: data.completedOnPlan,
        completedTopicIds,
        pendingTopicIds,
        reasonsForPending: data.reasonsForPending || '',
        submittedAt: new Date().toISOString(),
        periodsPlanned: pPlanned,
        periodsHandled: pHandled,
        periodsRequired: pRequired,
        fromDate: data.fromDate,
        toDate: data.toDate,
        cumulativePercent: data.cumulativePercent,
        extraHoursRequested: isLagging,
      };
      
      await syncQueueRepo.enqueue('SUBMIT_PROGRESS', progressPayload);

      // 4. Also call the ERP CCR API endpoint directly
      try {
        await apiClient.post('/erp/ccr/submit-log', progressPayload);
      } catch (erpErr) {
        console.warn('ERP API direct submit failed, queued for background sync:', erpErr);
      }

      // Trigger background sync
      syncEngine.triggerSync().catch((err) => {
        console.error('Trigger sync after submission failed:', err);
      });

      Alert.alert(
        'Submission Successful',
        `Course coverage for ${finalSubjectCode} (${classId}) has been logged and sent to the CC / HOD CCR dashboard!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('Progress submit failed:', err);
      Alert.alert('Error', 'Failed to log course coverage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── HEADER ── */}
      <View style={styles.headerBox}>
        <Label text="ACADEMIC PROGRESS ENTRY" />
        <Text style={styles.headingText}>Weekly Coverage</Text>
        <Text style={styles.subHeadingText}>
          Lesson plan verification and syllabus pace audit.
        </Text>
      </View>

      {/* ── SECTION 1: COURSE DURATION & LESSON PLAN COVERAGE ── */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionNumber}>01</Text>
          <Text style={styles.sectionTitle}>WEEKLY DURATION & COVERAGE</Text>
        </View>

        {/* Academic Week Dropdown */}
        <Controller
          control={control}
          name="weekNumber"
          render={({ field: { onChange, value } }) => (
            <AppDropdown
              label="Academic Week"
              value={value}
              options={WEEK_OPTIONS}
              onSelect={onChange}
              error={errors.weekNumber?.message}
            />
          )}
        />

        {/* Date Range Row */}
        <View style={[styles.periodsRow, styles.fieldSpacing]}>
          <View style={styles.periodCol}>
            <Controller
              control={control}
              name="fromDate"
              render={({ field: { onChange, value } }) => (
                <DatePickerField
                  label="From Date"
                  value={value}
                  onChange={onChange}
                  error={errors.fromDate?.message}
                />
              )}
            />
          </View>
          <View style={styles.periodCol}>
            <Controller
              control={control}
              name="toDate"
              render={({ field: { onChange, value } }) => (
                <DatePickerField
                  label="To Date"
                  value={value}
                  onChange={onChange}
                  error={errors.toDate?.message}
                />
              )}
            />
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
              style={styles.fieldSpacing}
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
              style={styles.fieldSpacing}
            />
          )}
        />

        {/* Cumulative % Completed Input */}
        <Controller
          control={control}
          name="cumulativePercent"
          render={({ field: { onChange, value } }) => (
            <AppTextInput
              label="Cumulative % Completed"
              value={value || ''}
              onChangeText={onChange}
              error={errors.cumulativePercent?.message}
              placeholder="e.g. Unit 1 - 75%, 2/12"
              style={styles.fieldSpacing}
            />
          )}
        />

        {/* Topics Covered Box */}
        <View style={styles.fieldSpacing}>
          <Controller
            control={control}
            name="topicsCovered"
            render={({ field: { onChange, value } }) => (
              <CreatableTopicSelect
                label="Topics Covered"
                unit={unit}
                syllabusNodes={syllabusNodes}
                value={value || ''}
                onChangeText={onChange}
                error={errors.topicsCovered?.message}
              />
            )}
          />
        </View>
      </View>

      {/* ── SECTION 2: PERIODS & ALGORITHM 1 PACE CALCULATOR ── */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionNumber}>02</Text>
          <Text style={styles.sectionTitle}>PERIODS & SYLLABUS PACE</Text>
        </View>

        {/* Planned vs Handled Periods */}
        <View style={styles.periodsRow}>
          <View style={styles.periodCol}>
            <Controller
              control={control}
              name="periodsPlanned"
              render={({ field: { onChange, value } }) => (
                <AppTextInput
                  label="No. of Periods Planned"
                  value={value !== undefined ? value.toString() : ''}
                  onChangeText={onChange}
                  error={errors.periodsPlanned?.message}
                  keyboardType="numeric"
                />
              )}
            />
          </View>
          <View style={styles.periodCol}>
            <Controller
              control={control}
              name="periodsHandled"
              render={({ field: { onChange, value } }) => (
                <AppTextInput
                  label="No. of Periods Handled"
                  value={value !== undefined ? value.toString() : ''}
                  onChangeText={onChange}
                  error={errors.periodsHandled?.message}
                  keyboardType="numeric"
                />
              )}
            />
          </View>
        </View>

        {/* Algorithm 1 Real-Time Analytics Badge */}
        <View style={[styles.paceBadge, isLagging && styles.paceBadgeWarning]}>
          <View style={{ flex: 1 }}>
            <Label text="ALGORITHM 1 PACE AUDIT" color={isLagging ? DayRibbonColors.warn : DayRibbonColors.muted} />
            <Text style={[styles.paceBadgeTitle, isLagging && { color: DayRibbonColors.warn }]}>
              PACE RATIO: {paceRatio} · {isLagging ? 'BEHIND SCHEDULE' : 'ON TRACK'}
            </Text>
            {periodsDeficit > 0 && (
              <Text style={styles.paceBadgeSub}>
                Deficit of {periodsDeficit} period(s). Extra compensation hours recommended.
              </Text>
            )}
          </View>
        </View>

        {/* Completed Based on Plan Toggle */}
        <View style={styles.radioBlock}>
          <Label text="COMPLETED BASED ON PLAN?" />
          <View style={styles.radioRow}>
            <TouchableOpacity
              style={[styles.radioCard, completedOnPlan === 'YES' && styles.radioCardSelected]}
              onPress={() => setValue('completedOnPlan', 'YES')}
              activeOpacity={0.8}
            >
              <Text style={[styles.radioLabel, completedOnPlan === 'YES' && styles.radioLabelSelected]}>
                YES
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.radioCard, completedOnPlan === 'NO' && styles.radioCardSelectedNo]}
              onPress={() => setValue('completedOnPlan', 'NO')}
              activeOpacity={0.8}
            >
              <Text style={[styles.radioLabel, completedOnPlan === 'NO' && styles.radioLabelSelectedNo]}>
                NO
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reasons for Pending if Deficit or NO */}
        {isLagging && (
          <View style={styles.deviationBlock}>
            <Label text="EXPLANATION FOR DEFICIT *" color={DayRibbonColors.warn} />
            <Controller
              control={control}
              name="reasonsForPending"
              render={({ field: { onChange, value } }) => (
                <AppTextInput
                  label="Reason for Pending Topics / Deficit"
                  value={value || ''}
                  onChangeText={onChange}
                  error={errors.reasonsForPending?.message}
                  multiline
                  numberOfLines={2}
                  placeholder="e.g. Topics postponed due to college holiday / comprehension speed"
                  style={styles.fieldSpacing}
                />
              )}
            />

            <Controller
              control={control}
              name="periodsRequired"
              render={({ field: { onChange, value } }) => (
                <AppTextInput
                  label="Extra Periods Required to Compensate"
                  value={value !== undefined ? value.toString() : periodsDeficit.toString()}
                  onChangeText={onChange}
                  error={errors.periodsRequired?.message}
                  keyboardType="numeric"
                  style={styles.fieldSpacing}
                />
              )}
            />
          </View>
        )}
      </View>

      {/* ── SUBMIT BUTTON ── */}
      <View style={styles.buttonContainer}>
        <AppButton
          mode="contained"
          title="SUBMIT COURSE COVERAGE"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  content: {
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
    paddingTop: DayRibbonSpacing.topSafeArea,
    paddingBottom: ms(48),
  },
  headerBox: {
    marginBottom: ms(16),
  },
  headingText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(28),
    lineHeight: ms(34),
    color: DayRibbonColors.ink,
    marginTop: ms(4),
  },
  subHeadingText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    color: DayRibbonColors.muted,
    lineHeight: 18,
    marginTop: ms(4),
  },
  sectionBlock: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: ms(16),
    marginBottom: ms(16),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: DayRibbonColors.line,
    paddingBottom: ms(10),
    marginBottom: ms(16),
  },
  sectionNumber: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(18),
    color: DayRibbonColors.cobalt,
    marginRight: ms(8),
  },
  sectionTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(13),
    letterSpacing: 1,
    color: DayRibbonColors.ink,
  },
  fieldSpacing: {
    marginTop: ms(14),
  },
  ccBanner: {
    backgroundColor: DayRibbonColors.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: ms(12),
    marginTop: ms(14),
  },
  ccBannerText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(14),
    color: DayRibbonColors.ink,
    marginTop: ms(4),
  },
  chipsSection: {
    marginBottom: ms(14),
  },
  chipsScroll: {
    flexDirection: 'row',
    marginTop: ms(8),
  },
  subjectChip: {
    backgroundColor: DayRibbonColors.surface,
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
    borderRadius: DayRibbonShapes.chipRadius,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    marginRight: ms(8),
  },
  subjectChipActive: {
    backgroundColor: DayRibbonColors.ink,
    borderColor: DayRibbonColors.ink,
  },
  subjectChipText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(12),
    color: DayRibbonColors.ink,
  },
  subjectChipTextActive: {
    color: DayRibbonColors.surface,
  },
  periodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodCol: {
    flex: 0.48,
  },
  paceBadge: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.bg,
    padding: ms(14),
    marginTop: ms(14),
  },
  paceBadgeWarning: {
    borderColor: DayRibbonColors.warn,
    backgroundColor: DayRibbonColors.warnBg,
  },
  paceBadgeTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(13),
    color: DayRibbonColors.ink,
    marginTop: ms(4),
  },
  paceBadgeSub: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(12),
    color: DayRibbonColors.warn,
    marginTop: ms(4),
  },
  radioBlock: {
    marginTop: ms(16),
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: ms(8),
  },
  radioCard: {
    flex: 0.48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.surface,
  },
  radioCardSelected: {
    backgroundColor: DayRibbonColors.cobalt,
    borderColor: DayRibbonColors.cobalt,
  },
  radioCardSelectedNo: {
    backgroundColor: DayRibbonColors.warn,
    borderColor: DayRibbonColors.warn,
  },
  radioLabel: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(14),
    letterSpacing: 1,
    color: DayRibbonColors.ink,
  },
  radioLabelSelected: {
    color: DayRibbonColors.surface,
  },
  radioLabelSelectedNo: {
    color: DayRibbonColors.surface,
  },
  deviationBlock: {
    marginTop: ms(14),
    borderLeftWidth: 3,
    borderLeftColor: DayRibbonColors.warn,
    paddingLeft: ms(12),
    paddingVertical: ms(6),
  },
  buttonContainer: {
    marginTop: ms(16),
    marginBottom: ms(24),
  },
});

