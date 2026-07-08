import React, { useState } from 'react';
import { Alert, StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Button, Chip, Divider, TextInput } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppTextInput } from '@components/common/AppTextInput';
import { AppButton } from '@components/common/AppButton';
import { Palette } from '@theme/colors';
import { HodStackParamList } from '@navigation/types';

type RouteParams = RouteProp<HodStackParamList, 'RequestDetails'>;

const decisionSchema = z.object({
  remarks: z.string().min(5, 'Remarks must be at least 5 characters'),
});

type DecisionFormData = z.infer<typeof decisionSchema>;

// ─── Mock data structures ────────────────────────────────────────────────────
const MOCK_PLAN_REPORT = {
  id: 'sample-report-001',
  type: 'CC Consolidated Report',
  week: 'Week 12',
  section: 'CSE – Section B',
  submittedBy: 'Dr. Meena Kumari (Class Coordinator)',
  submittedAt: '2026-07-05',
  overallCoverage: '71%',
  subjects: [
    { code: 'CS8501', name: 'Theory of Computation', coverage: '80%', status: 'Submitted' },
    { code: 'CS8502', name: 'Database Systems', coverage: '65%', status: 'Submitted' },
    { code: 'CS8503', name: 'Computer Networks', coverage: '70%', status: 'Submitted' },
    { code: 'CS8504', name: 'OS Principles', coverage: '68%', status: 'Pending' },
  ],
  ccRemarks: 'CS8504 faculty is running behind schedule due to lab sessions. Extra hour request raised.',
};

const MOCK_EXTRA_HOUR = {
  id: 'sample-extra-001',
  type: 'Extra Hour Request',
  faculty: 'Prof. Karthick D',
  subject: 'CS8503 – Computer Networks',
  section: 'CSE – Section B',
  requestedDate: '2026-07-10',
  period: 'Period 6 (02:30 PM)',
  reason:
    'Unit IV – Transport Layer topics (Flow Control & Congestion) are pending due to the University exam schedule clash on Week 11. Requesting compensatory class to meet syllabus deadline.',
};

// ─── Helper: Coverage chip color ─────────────────────────────────────────────
const coverageColor = (pct: string) => {
  const val = parseInt(pct);
  if (val >= 75) return Palette.success;
  if (val >= 50) return Palette.warning;
  return Palette.error;
};

import { useReportStore, SubjectProgress } from '@features/cc/store/useReportStore';

export const RequestDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const { requestId, requestType } = route.params;

  const getReportById = useReportStore((state) => state.getReportById);
  const submitHODDecision = useReportStore((state) => state.submitHODDecision);

  const isExtraHour = requestType === 'EXTRA_HOURS';

  // Fetch report dynamically from the store
  const reportData = isExtraHour ? null : getReportById(requestId);

  const data = isExtraHour 
    ? MOCK_EXTRA_HOUR 
    : (reportData 
        ? {
            id: reportData.id,
            type: 'CC Consolidated Report',
            week: `Week ${reportData.weekNumber}`,
            section: reportData.classId,
            submittedBy: reportData.submittedBy,
            submittedAt: reportData.submittedAt,
            overallCoverage: `${reportData.overallCoverage}%`,
            ccRemarks: reportData.ccRemarks,
            subjects: reportData.subjects.map((s: SubjectProgress) => ({
              code: s.code,
              name: s.name,
              coverage: `${s.coverage}%`,
              status: s.status,
            })),
          }
        : MOCK_PLAN_REPORT
      );

  const planData = isExtraHour ? null : (data as any);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<DecisionFormData>({
    resolver: zodResolver(decisionSchema),
    defaultValues: { remarks: '' },
  });

  const submitDecision = async (decision: 'APPROVED' | 'REJECTED' | 'RETURNED', remarks: string) => {
    setIsSubmitting(true);
    try {
      if (!isExtraHour) {
        submitHODDecision(requestId, decision, remarks);
      }
      
      console.log('HOD Decision Submitted:', { requestId, decision, remarks });
      await new Promise<void>((resolve) => setTimeout(resolve, 800)); // mock network delay

      Alert.alert(
        'Decision Submitted',
        `You have ${decision === 'APPROVED' ? 'approved and sent this report to the Admin' : decision === 'REJECTED' ? 'rejected' : 'returned'} this ${isExtraHour ? 'request' : 'report'}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      reset();
    } catch {
      Alert.alert('Error', 'Failed to submit decision. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onApprove = (d: DecisionFormData) => submitDecision('APPROVED', d.remarks);
  const onReturn = (d: DecisionFormData) => submitDecision('RETURNED', d.remarks);

  const confirmReject = (d: DecisionFormData) => {
    Alert.alert(
      'Confirm Rejection',
      'Are you sure you want to reject this? This action notifies the submitter.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => submitDecision('REJECTED', d.remarks),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Header Banner ── */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>{data.type}</Text>
        <Text style={styles.bannerSub}>
          {isExtraHour
            ? `${(data as typeof MOCK_EXTRA_HOUR).faculty} · ${(data as typeof MOCK_EXTRA_HOUR).subject}`
            : `${(data as typeof MOCK_PLAN_REPORT).section} · ${(data as typeof MOCK_PLAN_REPORT).week}`}
        </Text>
        <Chip style={styles.statusChip} textStyle={styles.statusChipText}>
          Pending Review
        </Chip>
      </View>

      {/* ── Plan Report Details ── */}
      {!isExtraHour && planData && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionLabel}>Submission Info</Text>
            <Row label="Submitted By" value={planData.submittedBy} />
            <Row label="Submitted On" value={planData.submittedAt} />
            <Row label="Overall Coverage" value={planData.overallCoverage} valueColor={coverageColor(planData.overallCoverage)} />

            <Divider style={styles.divider} />
            <Text style={styles.sectionLabel}>Subject-wise Coverage</Text>

            {planData.subjects.map((s: any) => (
              <View key={s.code} style={styles.subjectRow}>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectCode}>{s.code}</Text>
                  <Text style={styles.subjectName}>{s.name}</Text>
                </View>
                <View style={styles.subjectRight}>
                  <Text style={[styles.coveragePct, { color: coverageColor(s.coverage) }]}>
                    {s.coverage}
                  </Text>
                  <Chip
                    compact
                    style={[
                      styles.subjectChip,
                      { backgroundColor: s.status === 'Submitted' ? '#E6F4EA' : '#FFF3E0' },
                    ]}
                    textStyle={{
                      fontSize: 10,
                      color: s.status === 'Submitted' ? Palette.success : Palette.warning,
                    }}
                  >
                    {s.status}
                  </Chip>
                </View>
              </View>
            ))}

            <Divider style={styles.divider} />
            <Text style={styles.sectionLabel}>CC Remarks</Text>
            <Text style={styles.remarksText}>{planData.ccRemarks}</Text>
          </Card.Content>
        </Card>
      )}

      {/* ── Extra Hour Request Details ── */}
      {isExtraHour && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionLabel}>Request Details</Text>
            <Row label="Faculty" value={(data as typeof MOCK_EXTRA_HOUR).faculty} />
            <Row label="Subject" value={(data as typeof MOCK_EXTRA_HOUR).subject} />
            <Row label="Section" value={(data as typeof MOCK_EXTRA_HOUR).section} />
            <Row label="Requested Date" value={(data as typeof MOCK_EXTRA_HOUR).requestedDate} />
            <Row label="Period Slot" value={(data as typeof MOCK_EXTRA_HOUR).period} />
            <Divider style={styles.divider} />
            <Text style={styles.sectionLabel}>Reason Given</Text>
            <Text style={styles.remarksText}>{(data as typeof MOCK_EXTRA_HOUR).reason}</Text>
          </Card.Content>
        </Card>
      )}

      {/* ── HOD Decision Form ── */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionLabel}>Your Remarks / Decision Notes</Text>
          <Controller
            control={control}
            name="remarks"
            render={({ field: { onChange, value } }) => (
              <AppTextInput
                label="Enter your HOD remarks..."
                value={value}
                onChangeText={onChange}
                error={errors.remarks?.message}
                multiline
                numberOfLines={3}
              />
            )}
          />

          <View style={styles.actionRow}>
            <AppButton
              title="Approve"
              mode="contained"
              onPress={handleSubmit(onApprove)}
              loading={isSubmitting}
              style={[styles.actionBtn, { backgroundColor: Palette.success }]}
            />
            <AppButton
              title="Return"
              mode="outlined"
              onPress={handleSubmit(onReturn)}
              disabled={isSubmitting}
              style={styles.actionBtn}
            />
            <AppButton
              title="Reject"
              mode="outlined"
              onPress={handleSubmit(confirmReject)}
              disabled={isSubmitting}
              style={styles.actionBtn}
              textColor={Palette.error}
            />
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

// ─── Small reusable labeled row ───────────────────────────────────────────────
const Row = ({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, valueColor ? { color: valueColor, fontWeight: 'bold' } : {}]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: Palette.primary,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Palette.surface,
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 13,
    color: '#C8D8F5',
    marginBottom: 12,
  },
  statusChip: {
    backgroundColor: '#FFA726',
    alignSelf: 'flex-start',
  },
  statusChipText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Palette.secondary,
  },
  rowLabel: {
    fontSize: 13,
    color: Palette.textLight,
    flex: 1,
  },
  rowValue: {
    fontSize: 13,
    color: Palette.textDark,
    fontWeight: '500',
    flex: 1.2,
    textAlign: 'right',
  },
  divider: {
    backgroundColor: Palette.border,
    marginVertical: 14,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Palette.secondary,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectCode: {
    fontSize: 12,
    color: Palette.textLight,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '500',
    color: Palette.textDark,
  },
  subjectRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  coveragePct: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subjectChip: {
    height: 22,
    borderRadius: 10,
  },
  remarksText: {
    fontSize: 14,
    color: Palette.textDark,
    lineHeight: 22,
    backgroundColor: Palette.secondary,
    borderRadius: 8,
    padding: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
  },
});
