import React, { useState } from 'react';
import { Alert, StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HodStackParamList } from '@navigation/types';
import { useReportStore, SubjectProgress } from '@features/cc/store/useReportStore';
import { WeeklyCourseCoverageReportCard } from '../../cc/components/WeeklyCourseCoverageReportCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { SegBar } from '@components/editorial/SegBar';
import { Feather } from '@expo/vector-icons';

type RouteParams = RouteProp<HodStackParamList, 'RequestDetails'>;

const decisionSchema = z.object({
  remarks: z.string().min(5, 'Remarks must be at least 5 characters'),
});

type DecisionFormData = z.infer<typeof decisionSchema>;

const MOCK_EXTRA_HOUR = {
  faculty: 'Ms. E Uva Shakthi',
  subject: 'Computer Networks (CS3591)',
  section: 'III CSE-B',
  requestedDate: '2026-07-20',
  period: 'Period 3 (10:40 AM - 11:30 AM)',
  reason: 'Compensating lost classes due to college day practice last week.',
  type: 'Extra Hours Request',
};

export const RequestDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const { requestId, requestType } = route.params;

  const getReportById = useReportStore((state) => state.getReportById);
  const submitHODDecision = useReportStore((state) => state.submitHODDecision);

  const isExtraHour = requestType === 'EXTRA_HOURS';
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
              faculty: s.faculty,
              coverage: `${s.coverage}%`,
              status: s.status,
            })),
          }
        : null
      );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<DecisionFormData>({
    resolver: zodResolver(decisionSchema),
    defaultValues: { remarks: '' },
  });

  const submitDecision = async (decision: 'APPROVED' | 'REJECTED' | 'RETURNED', remarks: string) => {
    setIsSubmitting(true);
    try {
      if (!isExtraHour) {
        await submitHODDecision(requestId, decision, remarks);
      }

      await new Promise<void>((resolve) => setTimeout(resolve, 800));

      Alert.alert(
        'Decision Submitted',
        `You have ${decision === 'APPROVED' ? 'approved and forwarded this report to the Principal' : decision === 'REJECTED' ? 'rejected' : 'returned'} this ${isExtraHour ? 'request' : 'report'}.`,
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
      'Are you sure you want to reject this submission? This action notifies the submitter.',
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

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={EditorialColors.bg} />
        <Text style={styles.notFoundTitle}>NO REQUEST DETAILS FOUND</Text>
        <Text style={styles.notFoundSub}>
          The specified report ID may have been archived or returned.
        </Text>
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryActionText}>RETURN TO DASHBOARD</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const extra = isExtraHour ? (data as typeof MOCK_EXTRA_HOUR) : null;
  const report = !isExtraHour ? (data as any) : null;

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
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={20} color={EditorialColors.ink} />
          </TouchableOpacity>
          <Label text={isExtraHour ? 'EXTRA HOURS REQUEST' : 'CONSOLIDATED REPORT'} />
        </View>

        {/* Title heavy 24 */}
        <Text style={styles.screenTitle}>
          {isExtraHour ? extra?.subject : `${report?.section} ${report?.week}`}
        </Text>
        <Text style={styles.screenSubtitle}>
          {isExtraHour
            ? `FACULTY: ${extra?.faculty.toUpperCase()} • ${extra?.section}`
            : `SUBMITTED BY: ${report?.submittedBy?.toUpperCase()} • ${report?.submittedAt}`}
        </Text>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {isExtraHour && extra ? (
          <View style={styles.detailsBlock}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>ALLOTTED PERIOD</Text>
              <Text style={styles.metaValue}>{extra.period}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>REQUESTED DATE</Text>
              <Text style={styles.metaValue}>{extra.requestedDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>REMARKS & JUSTIFICATION</Text>
              <Text style={styles.remarksValue}>{extra.reason}</Text>
            </View>
          </View>
        ) : (
          <>
            {/* Stat Row */}
            <View style={styles.statRow}>
              <View style={styles.statCol}>
                <Text style={styles.statNum}>{report?.subjects.length}</Text>
                <Label text="COURSES" />
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text style={styles.statNum}>{report?.overallCoverage}</Text>
                <Label text="COVERAGE" />
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text style={styles.statNum}>100%</Text>
                <Label text="TARGET" />
              </View>
            </View>

            <Rule thickness="hairline" style={styles.hairlineSpacer} />

            {/* CC Remarks */}
            <View style={styles.remarksBlock}>
              <Label text="COORDINATOR REMARKS" style={{ marginBottom: 4 }} />
              <Text style={styles.remarksText}>
                "{report?.ccRemarks || 'All weekly syllabus logs consolidated for HOD approval.'}"
              </Text>
            </View>

            {/* ListRows for subjects */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>SUBJECT COVERAGE ROSTER</Text>
              <Label text={`${report?.subjects.length} COURSES`} />
            </View>

            <View style={styles.subjectList}>
              {report?.subjects.map((sub: any) => {
                const covVal = parseInt(sub.coverage);
                const isLagging = covVal < 70;
                return (
                  <View key={sub.code} style={styles.subjectRow}>
                    <View style={styles.rowTop}>
                      <View style={styles.subInfo}>
                        <Text style={styles.subCode}>{sub.code}</Text>
                        <Text style={styles.subName}>{sub.name}</Text>
                        <Label text={`FACULTY: ${sub.faculty.toUpperCase()}`} />
                      </View>
                      <Text
                        style={[
                          styles.subPercent,
                          isLagging ? styles.accentSubPercent : null,
                        ]}
                      >
                        {sub.coverage}
                      </Text>
                    </View>

                    <View style={styles.segBarWrapper}>
                      <SegBar
                        totalSegments={25}
                        filledSegments={Math.round((covVal / 100) * 25)}
                        isLagging={isLagging}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Decision Section */}
        <View style={styles.decisionSection}>
          <Rule thickness="heavy" style={styles.heavySpacer} />

          <Text style={styles.decisionHeaderTitle}>EXECUTIVE DECISION & AUDIT</Text>
          <Text style={styles.decisionSub}>
            Enter official HOD feedback or approval notes before submitting your verdict.
          </Text>

          <Controller
            control={control}
            name="remarks"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>HOD REMARKS & AUDIT NOTES</Text>
                <TextInput
                  style={[
                    styles.underlineInput,
                    errors.remarks ? styles.errorBorder : null,
                  ]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter approval signature or modification notes..."
                  placeholderTextColor={EditorialColors.muted}
                  multiline
                />
                {errors.remarks && (
                  <Text style={styles.errorText}>
                    {errors.remarks.message?.toUpperCase()}
                  </Text>
                )}
              </View>
            )}
          />

          <View style={styles.actionButtonGroup}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={handleSubmit(onApprove)}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionText}>
                {isSubmitting ? 'SUBMITTING...' : 'APPROVE & FORWARD'}
              </Text>
              <Feather name="check" size={16} color={EditorialColors.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineActionButton}
              onPress={handleSubmit(onReturn)}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text style={styles.outlineActionText}>RETURN FOR REVISION</Text>
              <Feather name="corner-up-left" size={16} color={EditorialColors.ink} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dangerActionButton}
              onPress={handleSubmit(confirmReject)}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text style={styles.dangerActionText}>REJECT SUBMISSION</Text>
              <Feather name="x" size={16} color={EditorialColors.accent} />
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
  centerContainer: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 16,
    letterSpacing: 2,
    color: EditorialColors.ink,
    marginBottom: 6,
  },
  notFoundSub: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    color: EditorialColors.muted,
    textAlign: 'center',
    marginBottom: 20,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    backgroundColor: EditorialColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 24,
    lineHeight: 28,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    color: EditorialColors.muted,
    lineHeight: 18,
    marginBottom: 12,
  },
  heavySpacer: {
    marginVertical: 18,
  },
  hairlineSpacer: {
    marginVertical: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: EditorialFonts.display,
    fontSize: 30,
    lineHeight: 34,
    color: EditorialColors.ink,
    marginBottom: 2,
  },
  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: EditorialColors.ink,
  },
  remarksBlock: {
    borderLeftWidth: 2,
    borderLeftColor: EditorialColors.ink,
    paddingLeft: 12,
    marginVertical: 14,
  },
  remarksText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: EditorialColors.muted,
    fontStyle: 'italic',
  },
  detailsBlock: {
    marginBottom: 16,
  },
  metaRow: {
    paddingVertical: 10,
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.ink,
  },
  metaLabel: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 14,
    color: EditorialColors.ink,
  },
  remarksValue: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: EditorialColors.ink,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.ink,
  },
  subjectList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
  },
  subjectRow: {
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.ink,
    paddingVertical: 12,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  subInfo: {
    flex: 1,
    marginRight: 12,
  },
  subCode: {
    fontFamily: EditorialFonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    color: EditorialColors.muted,
    marginBottom: 2,
  },
  subName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 15,
    lineHeight: 20,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  subPercent: {
    fontFamily: EditorialFonts.display,
    fontSize: 24,
    color: EditorialColors.ink,
  },
  accentSubPercent: {
    color: EditorialColors.accent,
  },
  segBarWrapper: {
    marginTop: 2,
  },
  decisionSection: {
    marginTop: 8,
  },
  decisionHeaderTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  decisionSub: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
    lineHeight: 16,
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
    minHeight: 52,
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
  actionButtonGroup: {
    gap: 12,
    marginTop: 8,
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
  outlineActionButton: {
    height: 54,
    width: '100%',
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  outlineActionText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.ink,
  },
  dangerActionButton: {
    height: 54,
    width: '100%',
    borderWidth: 1.5,
    borderColor: EditorialColors.accent,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  dangerActionText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.accent,
  },
});
