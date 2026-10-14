import React, { useState } from 'react';
import { Alert, StyleSheet, View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppTextInput } from '@components/common/AppTextInput';
import { AppButton } from '@components/common/AppButton';
import { AppDropdown } from '@components/common/AppDropdown';
import { DatePickerField } from '@components/common/DatePickerField';
import { SyncQueueRepository } from '@database/repositories/SyncQueueRepository';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { EditorialColors, EditorialFonts, EditorialSpacing } from '@theme/editorial';
import { Rule } from '@components/editorial/Rule';
import { Label } from '@components/editorial/Label';
import { syncEngine } from '@features/sync/syncEngine';
import { ms } from '@theme/responsive';

const ddmmToYyyymmdd = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm}-${dd}`;
  }
  return dateStr;
};

const requestSchema = z.object({
  subjectCode: z.string().min(1, 'Subject code is required'),
  requestedDate: z.string().min(10, 'Use DD/MM/YYYY format').regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Must be in DD/MM/YYYY format'),
  period: z.string().min(1, 'Period slot selection is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters long'),
});

type RequestFormData = z.infer<typeof requestSchema>;

export const ExtraHoursRequestScreen = () => {
  const user = useAuthStore((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const syncQueueRepo = new SyncQueueRepository();

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      subjectCode: '',
      requestedDate: '',
      period: '',
      reason: '',
    },
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    try {
      const extraHourPayload = {
        id: `extra_${data.subjectCode}_${Date.now()}`,
        facultyId: user?.id,
        subjectCode: data.subjectCode,
        classId: user?.assignedClassId || 'CSE-B',
        requestedDate: ddmmToYyyymmdd(data.requestedDate),
        period: parseInt(data.period),
        reason: data.reason,
        status: 'PENDING',
      };

      // Add request payload directly to Sync Queue
      await syncQueueRepo.enqueue('REQUEST_EXTRA_HOURS', extraHourPayload);

      // Trigger background sync immediately to send the log to MongoDB
      syncEngine.triggerSync().catch((err) => {
        console.error('Trigger sync after submission failed:', err);
      });

      Alert.alert('Success', 'Extra Teaching Hour Request Logged (Offline Sync Enqueued)!');
      setValue('subjectCode', '');
      setValue('requestedDate', '');
      setValue('period', '');
      setValue('reason', '');
    } catch (err) {
      console.error('Request failed:', err);
      Alert.alert('Error', 'Failed to log request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* ── HEADER ── */}
      <View style={styles.headerBox}>
        <Label text="FACULTY REQUISITION" />
        <Text style={styles.headingText}>EXTRA TEACHING HOURS.</Text>
        <Text style={styles.subHeadingText}>
          APPLY FOR COMPENSATORY CLASS PERIODS & DEFICIT RECOVERY
        </Text>
      </View>
      <Rule thick style={styles.heroRule} />

      {/* ── FORM CONTAINER ── */}
      <View style={styles.formBlock}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionNumber}>01</Text>
          <Text style={styles.sectionTitle}>REQUISITION DETAILS</Text>
        </View>

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

        <View style={styles.fieldSpacing}>
          <Controller
            control={control}
            name="requestedDate"
            render={({ field: { onChange, value } }) => (
              <DatePickerField
                label="Requested Date (DD/MM/YYYY)"
                value={value}
                onChange={onChange}
                error={errors.requestedDate?.message}
              />
            )}
          />
        </View>

        <View style={styles.fieldSpacing}>
          <Controller
            control={control}
            name="period"
            render={({ field: { onChange, value } }) => (
              <AppDropdown
                label="Select Period Slot"
                value={value}
                options={[
                  { label: 'Period 1 (08:30 AM)', value: '1' },
                  { label: 'Period 2 (09:30 AM)', value: '2' },
                  { label: 'Period 5 (01:30 PM)', value: '5' },
                  { label: 'Period 6 (02:30 PM)', value: '6' },
                ]}
                onSelect={onChange}
                error={errors.period?.message}
              />
            )}
          />
        </View>

        <View style={styles.fieldSpacing}>
          <Controller
            control={control}
            name="reason"
            render={({ field: { onChange, value } }) => (
              <AppTextInput
                label="Reason / Target Topic Coverage details"
                value={value || ''}
                onChangeText={onChange}
                error={errors.reason?.message}
                multiline
                numberOfLines={4}
              />
            )}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <AppButton
          mode="contained"
          title="SUBMIT EXTRA HOURS REQUISITION"
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
    backgroundColor: EditorialColors.bg,
  },
  contentContainer: {
    paddingHorizontal: EditorialSpacing.screenHorizontal,
    paddingTop: EditorialSpacing.topSafeArea,
    paddingBottom: ms(48),
  },
  headerBox: {
    marginBottom: ms(8),
  },
  headingText: {
    fontFamily: EditorialFonts.display,
    fontSize: ms(24),
    lineHeight: ms(28),
    color: EditorialColors.ink,
    marginTop: ms(4),
  },
  subHeadingText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: ms(11),
    color: EditorialColors.muted,
    letterSpacing: 0.5,
    marginTop: ms(4),
  },
  heroRule: {
    marginBottom: ms(24),
  },
  formBlock: {
    backgroundColor: EditorialColors.white,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    padding: ms(16),
    marginBottom: ms(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderBottomWidth: 1,
    borderBottomColor: EditorialColors.ink,
    paddingBottom: ms(8),
    marginBottom: ms(16),
  },
  sectionNumber: {
    fontFamily: EditorialFonts.display,
    fontSize: ms(18),
    color: EditorialColors.accent,
    marginRight: ms(8),
  },
  sectionTitle: {
    fontFamily: EditorialFonts.bold,
    fontSize: ms(13),
    letterSpacing: 1,
    color: EditorialColors.ink,
  },
  fieldSpacing: {
    marginTop: ms(16),
  },
  buttonContainer: {
    marginTop: ms(8),
  },
});

