import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Portal, Dialog } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useReportStore } from '@features/cc/store/useReportStore';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { EditorialColors, EditorialFonts, EditorialSpacing } from '@theme/editorial';
import { Rule } from '@components/editorial/Rule';
import { Label } from '@components/editorial/Label';
import { EmptyState } from '@components/editorial/EmptyState';
import { AppTextInput } from '@components/common/AppTextInput';
import { AppButton } from '@components/common/AppButton';
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
        <Label text="EXECUTIVE AUDIT" />
        <Text style={styles.headingText}>HOD DECISION QUEUE.</Text>
        <Text style={styles.subHeadingText}>
          AUDIT & APPROVE WEEKLY CLASS COVERAGE REPORTS AND EXTRA HOUR REQUISITIONS
        </Text>
      </View>
      <Rule thick style={styles.heroRule} />

      {/* ── TABS ── */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'REPORTS' && styles.tabBtnActive]}
          onPress={() => setActiveTab('REPORTS')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'REPORTS' && styles.tabTextActive]}>
            CLASS REPORTS ({pendingReports.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'EXTRA_HOURS' && styles.tabBtnActive]}
          onPress={() => setActiveTab('EXTRA_HOURS')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'EXTRA_HOURS' && styles.tabTextActive]}>
            EXTRA HOURS ({extraHoursList.filter((e) => e.status === 'PENDING').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── TAB 1: CLASS REPORTS ── */}
      {activeTab === 'REPORTS' ? (
        pendingReports.length === 0 ? (
          <EmptyState
            title="QUEUE CLEAR"
            subtitle="No pending weekly reports waiting for HOD review. All submissions are processed."
          />
        ) : (
          pendingReports.map((report) => (
            <View key={report.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.squareTag}>
                  <Text style={styles.squareTagText}>{report.classId}</Text>
                </View>
                <View style={styles.weekTag}>
                  <Text style={styles.weekTagText}>WEEK {report.weekNumber}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>CONSOLIDATED SYLLABUS SUBMISSION</Text>
              <Text style={styles.coordinatorText}>
                SUBMITTED BY: {report.submittedBy.toUpperCase()}
              </Text>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>AVERAGE CLASS COVERAGE:</Text>
                <Text style={styles.metricVal}>{report.overallCoverage}%</Text>
              </View>

              {report.ccRemarks ? (
                <View style={styles.remarksBox}>
                  <Label text="CC REMARKS:" />
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
                  <Text style={styles.outlineActionText}>INSPECT</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.outlineActionBtn, { borderColor: EditorialColors.accent }]}
                  onPress={() => handleOpenReturn(report.id)}
                >
                  <Text style={[styles.outlineActionText, { color: EditorialColors.accent }]}>
                    RETURN
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fillActionBtn}
                  onPress={() => handleApproveReport(report.id)}
                >
                  <Text style={styles.fillActionText}>APPROVE</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )
      ) : (
        /* ── TAB 2: EXTRA HOURS ── */
        extraHoursList.filter((e) => e.status === 'PENDING').length === 0 ? (
          <EmptyState
            title="NO EXTRA HOUR REQUISITIONS"
            subtitle="There are currently no pending compensatory teaching hour requests in your department."
          />
        ) : (
          extraHoursList
            .filter((e) => e.status === 'PENDING')
            .map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.subject.toUpperCase()}</Text>
                  <View style={styles.pendingTag}>
                    <Text style={styles.pendingTagText}>PENDING</Text>
                  </View>
                </View>

                <Text style={styles.facultySub}>
                  FACULTY: {item.faculty.toUpperCase()} ({item.classId})
                </Text>

                <Text style={styles.detailText}>
                  SLOT: {item.date} · {item.period.toUpperCase()}
                </Text>

                <View style={styles.reasonBox}>
                  <Label text="JUSTIFICATION:" />
                  <Text style={styles.reasonText}>{item.reason}</Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.outlineActionBtn, { borderColor: EditorialColors.accent }]}
                    onPress={() => handleRejectExtraHour(item.id)}
                  >
                    <Text style={[styles.outlineActionText, { color: EditorialColors.accent }]}>
                      DECLINE
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.fillActionBtn}
                    onPress={() => handleApproveExtraHour(item.id)}
                  >
                    <Text style={styles.fillActionText}>SANCTION SLOT</Text>
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
          <Dialog.Title style={styles.dialogTitle}>RETURN REPORT FOR REVISION</Dialog.Title>
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
              <Text style={styles.dialogCancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dialogConfirmBtn}
              onPress={handleConfirmReturn}
            >
              <Text style={styles.dialogConfirmText}>RETURN REPORT</Text>
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
    backgroundColor: EditorialColors.bg,
  },
  content: {
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
    marginBottom: ms(20),
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: ms(16),
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ms(12),
    backgroundColor: EditorialColors.white,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    marginRight: ms(8),
  },
  tabBtnActive: {
    backgroundColor: EditorialColors.ink,
  },
  tabText: {
    fontFamily: EditorialFonts.bold,
    fontSize: ms(11),
    letterSpacing: 0.5,
    color: EditorialColors.ink,
  },
  tabTextActive: {
    color: EditorialColors.white,
  },
  card: {
    backgroundColor: EditorialColors.white,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    padding: ms(14),
    marginBottom: ms(14),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(8),
  },
  squareTag: {
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    backgroundColor: EditorialColors.bg,
  },
  squareTagText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(11),
    color: EditorialColors.ink,
  },
  weekTag: {
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    backgroundColor: EditorialColors.white,
  },
  weekTagText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(11),
    color: EditorialColors.ink,
  },
  cardTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(14),
    color: EditorialColors.ink,
  },
  coordinatorText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: ms(11),
    color: EditorialColors.muted,
    marginTop: ms(2),
    letterSpacing: 0.5,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: EditorialColors.bg,
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    padding: ms(10),
    marginTop: ms(10),
  },
  metricLabel: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(11),
    color: EditorialColors.ink,
    letterSpacing: 0.5,
  },
  metricVal: {
    fontFamily: EditorialFonts.display,
    fontSize: ms(16),
    color: EditorialColors.ink,
  },
  remarksBox: {
    backgroundColor: EditorialColors.bg,
    padding: ms(10),
    marginTop: ms(10),
    borderLeftWidth: 3,
    borderLeftColor: EditorialColors.ink,
  },
  remarksText: {
    fontFamily: EditorialFonts.regular,
    fontSize: ms(12),
    color: EditorialColors.ink,
    marginTop: ms(2),
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: ms(14),
  },
  outlineActionBtn: {
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
    marginRight: ms(8),
  },
  outlineActionText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(11),
    letterSpacing: 0.5,
    color: EditorialColors.ink,
  },
  fillActionBtn: {
    backgroundColor: EditorialColors.ink,
    paddingHorizontal: ms(14),
    paddingVertical: ms(8),
  },
  fillActionText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(11),
    letterSpacing: 0.5,
    color: EditorialColors.white,
  },
  pendingTag: {
    borderWidth: 1,
    borderColor: EditorialColors.muted,
    paddingHorizontal: ms(6),
    paddingVertical: ms(2),
  },
  pendingTagText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(9.5),
    color: EditorialColors.muted,
    letterSpacing: 0.5,
  },
  facultySub: {
    fontFamily: EditorialFonts.semibold,
    fontSize: ms(11),
    color: EditorialColors.muted,
    marginTop: ms(2),
  },
  detailText: {
    fontFamily: EditorialFonts.bold,
    fontSize: ms(11),
    color: EditorialColors.ink,
    marginTop: ms(6),
  },
  reasonBox: {
    backgroundColor: EditorialColors.bg,
    padding: ms(10),
    marginTop: ms(10),
    borderLeftWidth: 3,
    borderLeftColor: EditorialColors.ink,
  },
  reasonText: {
    fontFamily: EditorialFonts.regular,
    fontSize: ms(12),
    color: EditorialColors.ink,
    marginTop: ms(2),
  },
  dialog: {
    backgroundColor: EditorialColors.white,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: EditorialColors.ink,
  },
  dialogTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(15),
    letterSpacing: 0.5,
    color: EditorialColors.ink,
  },
  dialogSub: {
    fontFamily: EditorialFonts.regular,
    fontSize: ms(12),
    lineHeight: ms(16),
    color: EditorialColors.muted,
  },
  dialogActions: {
    paddingHorizontal: ms(16),
    paddingBottom: ms(16),
  },
  dialogCancelBtn: {
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
    marginRight: ms(8),
  },
  dialogCancelText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(11),
    letterSpacing: 0.5,
    color: EditorialColors.muted,
  },
  dialogConfirmBtn: {
    backgroundColor: EditorialColors.accent,
    paddingHorizontal: ms(14),
    paddingVertical: ms(8),
  },
  dialogConfirmText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(11),
    letterSpacing: 0.5,
    color: EditorialColors.white,
  },
});

export default ApprovalScreen;

