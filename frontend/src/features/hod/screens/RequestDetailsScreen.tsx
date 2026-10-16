import React, { useState } from 'react';
import { Alert, StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HodStackParamList } from '@navigation/types';
import { useReportStore, SubjectProgress } from '@features/cc/store/useReportStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { Label } from '@components/editorial/Label';
import { StatTile } from '@components/editorial/StatTile';
import { ProgressBar } from '@components/editorial/ProgressBar';
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
        <StatusBar barStyle="dark-content" backgroundColor={DayRibbonColors.bg} />
        <Text style={styles.notFoundTitle}>No Request Details Found</Text>
        <Text style={styles.notFoundSub}>
          The specified report ID may have been archived or returned.
        </Text>
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryActionText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const extra = isExtraHour ? (data as typeof MOCK_EXTRA_HOUR) : null;
  const report = !isExtraHour ? (data as any) : null;

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
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={20} color={DayRibbonColors.ink} />
          </TouchableOpacity>
          <View style={styles.headerTagChip}>
            <Text style={styles.headerTagText}>
              {isExtraHour ? 'EXTRA HOURS' : 'CONSOLIDATED REPORT'}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.screenTitle}>
          {isExtraHour ? extra?.subject : `${report?.section} ${report?.week}`}
        </Text>
        <Text style={styles.screenSubtitle}>
          {isExtraHour
            ? `Faculty: ${extra?.faculty} • ${extra?.section}`
            : `Submitted by: ${report?.submittedBy} • ${report?.submittedAt}`}
        </Text>

        {isExtraHour && extra ? (
          <View style={styles.detailsCard}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>ALLOTTED PERIOD</Text>
              <Text style={styles.metaValue}>{extra.period}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>REQUESTED DATE</Text>
              <Text style={styles.metaValue}>{extra.requestedDate}</Text>
            </View>
            <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.metaLabel}>REMARKS & JUSTIFICATION</Text>
              <Text style={styles.remarksValue}>{extra.reason}</Text>
            </View>
          </View>
        ) : (
          <>
            {/* Stat Row */}
            <View style={styles.statGrid}>
              <StatTile
                label="Courses"
                value={report?.subjects.length}
                style={styles.statTileItem}
              />
              <StatTile
                label="Coverage"
                value={report?.overallCoverage}
                style={styles.statTileItem}
              />
              <StatTile
                label="Target"
                value="100%"
                style={styles.statTileItem}
              />
            </View>

            {/* CC Remarks */}
            <View style={styles.remarksCard}>
              <Label text="COORDINATOR REMARKS" style={{ marginBottom: 4 }} />
              <Text style={styles.remarksText}>
                "{report?.ccRemarks || 'All weekly syllabus logs consolidated for HOD approval.'}"
              </Text>
            </View>

            {/* ListRows for subjects */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>SUBJECT COVERAGE ROSTER</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{report?.subjects.length} COURSES</Text>
              </View>
            </View>

            <View style={styles.subjectList}>
              {report?.subjects.map((sub: any) => {
                const covVal = parseInt(sub.coverage);
                const isLagging = covVal < 70;
                return (
                  <View key={sub.code} style={styles.subjectCard}>
                    <View style={styles.rowTop}>
                      <View style={styles.subInfo}>
                        <Text style={styles.subCode}>{sub.code}</Text>
                        <Text style={styles.subName}>{sub.name}</Text>
                        <Text style={styles.subFaculty}>Faculty: {sub.faculty}</Text>
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

                    <ProgressBar
                      progress={covVal / 100}
                      isLagging={isLagging}
                      style={styles.progressSpacing}
                    />
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Decision Section */}
        <View style={styles.decisionSection}>
          <Text style={styles.decisionHeaderTitle}>HOD Review & Verdict</Text>
          <Text style={styles.decisionSub}>
            Enter official HOD feedback or approval notes before submitting your verdict.
          </Text>

          <Controller
            control={control}
            name="remarks"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>REMARKS & AUDIT NOTES</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors.remarks ? styles.errorBorder : null,
                  ]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter approval signature or modification notes..."
                  placeholderTextColor={DayRibbonColors.mutedSoft}
                  multiline
                />
                {errors.remarks && (
                  <Text style={styles.errorText}>
                    {errors.remarks.message}
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
                {isSubmitting ? 'Submitting...' : 'Approve & Forward'}
              </Text>
              <Feather name="check" size={16} color={DayRibbonColors.surface} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineActionButton}
              onPress={handleSubmit(onReturn)}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text style={styles.outlineActionText}>Return for Revision</Text>
              <Feather name="corner-up-left" size={16} color={DayRibbonColors.ink} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dangerActionButton}
              onPress={handleSubmit(confirmReject)}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text style={styles.dangerActionText}>Reject Submission</Text>
              <Feather name="x" size={16} color={DayRibbonColors.warn} />
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
  centerContainer: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 20,
    color: DayRibbonColors.ink,
    marginBottom: 6,
  },
  notFoundSub: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
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
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DayRibbonShapes.chipRadius,
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  headerTagText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.muted,
  },
  screenTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: DayRibbonColors.ink,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
    lineHeight: 18,
    marginBottom: 16,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statTileItem: {
    flex: 1,
  },
  remarksCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 14,
    marginBottom: 16,
  },
  remarksText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    lineHeight: 18,
    color: DayRibbonColors.ink,
    fontStyle: 'italic',
  },
  detailsCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 16,
    marginBottom: 16,
  },
  metaRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: DayRibbonColors.line,
  },
  metaLabel: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    letterSpacing: 1,
    color: DayRibbonColors.muted,
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 14,
    color: DayRibbonColors.ink,
  },
  remarksValue: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    lineHeight: 18,
    color: DayRibbonColors.ink,
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
  subjectList: {
    gap: 10,
  },
  subjectCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 14,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  subInfo: {
    flex: 1,
    marginRight: 12,
  },
  subCode: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.cobalt,
    marginBottom: 2,
  },
  subName: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 15,
    lineHeight: 20,
    color: DayRibbonColors.ink,
    marginBottom: 2,
  },
  subFaculty: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  subPercent: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 22,
    color: DayRibbonColors.cobalt,
  },
  accentSubPercent: {
    color: DayRibbonColors.warn,
  },
  progressSpacing: {
    marginTop: 4,
  },
  decisionSection: {
    marginTop: 20,
  },
  decisionHeaderTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 20,
    color: DayRibbonColors.ink,
    marginBottom: 4,
  },
  decisionSub: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
    lineHeight: 18,
    marginBottom: 16,
  },
  inputBlock: {
    marginBottom: 20,
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
  actionButtonGroup: {
    gap: 12,
    marginTop: 4,
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
  outlineActionButton: {
    height: 52,
    width: '100%',
    borderRadius: DayRibbonShapes.buttonRadius,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.ink,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  outlineActionText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.ink,
  },
  dangerActionButton: {
    height: 52,
    width: '100%',
    borderRadius: DayRibbonShapes.buttonRadius,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.warn,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dangerActionText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.warn,
  },
});
