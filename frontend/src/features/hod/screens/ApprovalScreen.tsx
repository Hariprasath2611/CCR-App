import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Portal, Dialog } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useReportStore } from '@features/cc/store/useReportStore';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { EmptyState } from '@components/editorial/EmptyState';
import { AppTextInput } from '@components/common/AppTextInput';
import { ms } from '@theme/responsive';

export const ApprovalScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const reports = useReportStore((state) => state.reports);
  const submitHODDecision = useReportStore((state) => state.submitHODDecision);

  const [activeTab, setActiveTab] = useState<'REPORTS' | 'EXTRA_HOURS'>('REPORTS');
  const [returnDialogVisible, setReturnDialogVisible] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [returnRemarks, setReturnRemarks] = useState('');

  // Pending reports submitted to HOD
  const pendingReports = reports.filter((r) => r.status === 'SUBMITTED_TO_HOD');

  const [extraHoursList, setExtraHoursList] = useState([
    {
      id: 'ext_1',
      faculty: 'Ms. E Uva Shakthi',
      subject: 'Computer Networks (CS3591)',
      classId: '3rd Year CSE-B',
      date: '20/07/2026',
      period: 'Period 3 (10:40 AM - 11:30 AM)',
      reason: 'Compensating for lost class due to college symposium practice.',
      status: 'PENDING',
    },
    {
      id: 'ext_2',
      faculty: 'Mr. S Faizal Mukthar',
      subject: 'Distributed Computing (CS3551)',
      classId: '4th Year CSE-A',
      date: '22/07/2026',
      period: 'Period 5 (01:10 PM - 02:00 PM)',
      reason: 'Additional hands-on lab demonstration on MPI cluster programming.',
      status: 'PENDING',
    },
  ]);

  const handleApproveReport = async (reportId: string) => {
    try {
      await submitHODDecision(reportId, 'APPROVED', 'Approved by HOD. Verified against Anna University syllabus.');
      Alert.alert('Report Approved', 'Weekly Course Coverage Report endorsed and forwarded to Principal for audit.');
    } catch (e) {
      Alert.alert('Error', 'Failed to approve report.');
    }
  };

  const handleOpenReturn = (reportId: string) => {
    setSelectedReportId(reportId);
    setReturnRemarks('');
    setReturnDialogVisible(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedReportId || !returnRemarks.trim()) {
      Alert.alert('Required', 'Please enter your reason / feedback for returning this report.');
      return;
    }
    try {
      await submitHODDecision(selectedReportId, 'RETURNED', returnRemarks.trim());
      setReturnDialogVisible(false);
      Alert.alert('Returned for Revision', 'Report sent back to the Class Coordinator with revision remarks.');
    } catch (e) {
      Alert.alert('Error', 'Failed to return report.');
    }
  };

  const handleApproveExtraHour = (id: string) => {
    setExtraHoursList((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'APPROVED' } : e))
    );
    Alert.alert('Slot Approved', 'Extra teaching slot has been sanctioned and updated in schedule.');
  };

  const handleRejectExtraHour = (id: string) => {
    setExtraHoursList((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'REJECTED' } : e))
    );
    Alert.alert('Slot Declined', 'Extra teaching slot request declined.');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={styles.headerBox}>
        <Text style={styles.captionText}>EXECUTIVE AUDIT</Text>
        <Text style={styles.headingText}>HOD Decision Queue</Text>
        <Text style={styles.subHeadingText}>
          Audit & approve weekly class coverage reports and extra hour requisitions
        </Text>
      </View>

      {/* ── TABS ── */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'REPORTS' && styles.tabBtnActive]}
          onPress={() => setActiveTab('REPORTS')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'REPORTS' && styles.tabTextActive]}>
            Class Reports ({pendingReports.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'EXTRA_HOURS' && styles.tabBtnActive]}
          onPress={() => setActiveTab('EXTRA_HOURS')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'EXTRA_HOURS' && styles.tabTextActive]}>
            Extra Hours ({extraHoursList.filter((e) => e.status === 'PENDING').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── TAB 1: CLASS REPORTS ── */}
      {activeTab === 'REPORTS' ? (
        pendingReports.length === 0 ? (
          <EmptyState
            title="Queue Clear"
            subtitle="No pending weekly reports waiting for HOD review. All submissions are processed."
          />
        ) : (
          pendingReports.map((report) => (
            <View key={report.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.chipTag}>
                  <Text style={styles.chipTagText}>{report.classId}</Text>
                </View>
                <View style={styles.weekTag}>
                  <Text style={styles.weekTagText}>Week {report.weekNumber}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>Consolidated Syllabus Submission</Text>
              <Text style={styles.coordinatorText}>
                Submitted by: {report.submittedBy}
              </Text>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Average Class Coverage</Text>
                <Text style={styles.metricVal}>{report.overallCoverage}%</Text>
              </View>

              {report.ccRemarks ? (
                <View style={styles.remarksBox}>
                  <Text style={styles.remarksLabel}>CC Remarks</Text>
                  <Text style={styles.remarksText}>"{report.ccRemarks}"</Text>
                </View>
              ) : null}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.outlineActionBtn}
                  onPress={() =>
                    navigation.navigate('RequestDetails', {
                      requestId: report.id,
                      requestType: 'CC_REPORT',
                    })
                  }
                >
                  <Text style={styles.outlineActionText}>Inspect</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.returnActionBtn}
                  onPress={() => handleOpenReturn(report.id)}
                >
                  <Text style={styles.returnActionText}>Return</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fillActionBtn}
                  onPress={() => handleApproveReport(report.id)}
                >
                  <Text style={styles.fillActionText}>Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )
      ) : (
        /* ── TAB 2: EXTRA HOURS ── */
        extraHoursList.filter((e) => e.status === 'PENDING').length === 0 ? (
          <EmptyState
            title="No Extra Hour Requisitions"
            subtitle="There are currently no pending compensatory teaching hour requests in your department."
          />
        ) : (
          extraHoursList
            .filter((e) => e.status === 'PENDING')
            .map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.subject}</Text>
                  <View style={styles.pendingTag}>
                    <Text style={styles.pendingTagText}>PENDING</Text>
                  </View>
                </View>

                <Text style={styles.facultySub}>
                  Faculty: {item.faculty} ({item.classId})
                </Text>

                <Text style={styles.detailText}>
                  Slot: {item.date} · {item.period}
                </Text>

                <View style={styles.reasonBox}>
                  <Text style={styles.remarksLabel}>Justification</Text>
                  <Text style={styles.reasonText}>{item.reason}</Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.returnActionBtn}
                    onPress={() => handleRejectExtraHour(item.id)}
                  >
                    <Text style={styles.returnActionText}>Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.fillActionBtn}
                    onPress={() => handleApproveExtraHour(item.id)}
                  >
                    <Text style={styles.fillActionText}>Sanction Slot</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
        )
      )}

      {/* ── RETURN DIALOG ── */}
      <Portal>
        <Dialog
          visible={returnDialogVisible}
          onDismiss={() => setReturnDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Return Report for Revision</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogSub}>
              Please describe what adjustments are required before this weekly report can be endorsed.
            </Text>
            <View style={{ marginTop: ms(12) }}>
              <AppTextInput
                label="Revision Feedback *"
                placeholder="e.g. Please update reasons for Unit 2 lag in Mathematics..."
                value={returnRemarks}
                onChangeText={setReturnRemarks}
                multiline
                numberOfLines={4}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <TouchableOpacity
              style={styles.dialogCancelBtn}
              onPress={() => setReturnDialogVisible(false)}
            >
              <Text style={styles.dialogCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dialogConfirmBtn}
              onPress={handleConfirmReturn}
            >
              <Text style={styles.dialogConfirmText}>Return Report</Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    paddingTop: DayRibbonSpacing.screenTop,
    paddingBottom: ms(48),
  },
  headerBox: {
    marginBottom: ms(16),
  },
  captionText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headingText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(26),
    color: DayRibbonColors.ink,
    marginTop: ms(4),
  },
  subHeadingText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    color: DayRibbonColors.muted,
    marginTop: ms(4),
    lineHeight: ms(18),
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: ms(16),
    gap: ms(8),
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ms(10),
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.radiusChip,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    minHeight: 44,
  },
  tabBtnActive: {
    backgroundColor: DayRibbonColors.ink,
    borderColor: DayRibbonColors.ink,
  },
  tabText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(12),
    color: DayRibbonColors.muted,
  },
  tabTextActive: {
    color: DayRibbonColors.surface,
  },
  card: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.radiusCard,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: ms(16),
    marginBottom: ms(14),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(10),
  },
  chipTag: {
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusChip,
    paddingHorizontal: ms(10),
    paddingVertical: ms(4),
    backgroundColor: DayRibbonColors.bg,
  },
  chipTagText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(11),
    color: DayRibbonColors.ink,
  },
  weekTag: {
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusChip,
    paddingHorizontal: ms(10),
    paddingVertical: ms(4),
    backgroundColor: DayRibbonColors.surface,
  },
  weekTagText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(11),
    color: DayRibbonColors.cobalt,
  },
  cardTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(15),
    color: DayRibbonColors.ink,
  },
  coordinatorText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(12),
    color: DayRibbonColors.muted,
    marginTop: ms(3),
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DayRibbonColors.bg,
    borderRadius: DayRibbonShapes.radiusButton,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    paddingHorizontal: ms(14),
    paddingVertical: ms(10),
    marginTop: ms(12),
  },
  metricLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(12),
    color: DayRibbonColors.ink,
  },
  metricVal: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(18),
    color: DayRibbonColors.cobalt,
  },
  remarksBox: {
    backgroundColor: DayRibbonColors.bg,
    padding: ms(12),
    marginTop: ms(10),
    borderRadius: DayRibbonShapes.radiusButton,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  remarksLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  remarksText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    color: DayRibbonColors.ink,
    marginTop: ms(4),
    lineHeight: ms(18),
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: ms(14),
    gap: ms(8),
  },
  outlineActionBtn: {
    borderWidth: 1.5,
    borderColor: DayRibbonColors.ink,
    borderRadius: DayRibbonShapes.radiusButton,
    paddingHorizontal: ms(14),
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineActionText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(12),
    color: DayRibbonColors.ink,
  },
  returnActionBtn: {
    borderWidth: 1.5,
    borderColor: DayRibbonColors.warn,
    borderRadius: DayRibbonShapes.radiusButton,
    paddingHorizontal: ms(14),
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  returnActionText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(12),
    color: DayRibbonColors.warn,
  },
  fillActionBtn: {
    backgroundColor: DayRibbonColors.cobalt,
    borderRadius: DayRibbonShapes.radiusButton,
    paddingHorizontal: ms(16),
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fillActionText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(12),
    color: DayRibbonColors.surface,
  },
  pendingTag: {
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusChip,
    backgroundColor: DayRibbonColors.bg,
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
  },
  pendingTagText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(10),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
  },
  facultySub: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(12),
    color: DayRibbonColors.muted,
    marginTop: ms(2),
  },
  detailText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(12),
    color: DayRibbonColors.ink,
    marginTop: ms(6),
  },
  reasonBox: {
    backgroundColor: DayRibbonColors.bg,
    padding: ms(12),
    marginTop: ms(10),
    borderRadius: DayRibbonShapes.radiusButton,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  reasonText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    color: DayRibbonColors.ink,
    marginTop: ms(4),
  },
  dialog: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.radiusCard,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  dialogTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(17),
    color: DayRibbonColors.ink,
  },
  dialogSub: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    lineHeight: ms(18),
    color: DayRibbonColors.muted,
  },
  dialogActions: {
    paddingHorizontal: ms(16),
    paddingBottom: ms(16),
    gap: ms(8),
  },
  dialogCancelBtn: {
    paddingHorizontal: ms(14),
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogCancelText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(13),
    color: DayRibbonColors.muted,
  },
  dialogConfirmBtn: {
    backgroundColor: DayRibbonColors.warn,
    borderRadius: DayRibbonShapes.radiusButton,
    paddingHorizontal: ms(16),
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogConfirmText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(13),
    color: DayRibbonColors.surface,
  },
});

export default ApprovalScreen;
