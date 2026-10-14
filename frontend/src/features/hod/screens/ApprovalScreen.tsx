import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, Badge, Chip, Divider, TextInput, Portal, Dialog } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useReportStore, ConsolidatedReport } from '@features/cc/store/useReportStore';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
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
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HOD Decision Queue</Text>
        <Text style={styles.headerSub}>
          Audit and approve weekly class coverage reports and faculty compensatory hour applications.
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'REPORTS' && styles.tabBtnActive]}
          onPress={() => setActiveTab('REPORTS')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="file-document-check"
            size={18}
            color={activeTab === 'REPORTS' ? '#FFFFFF' : Palette.textLight}
          />
          <Text style={[styles.tabText, activeTab === 'REPORTS' && styles.tabTextActive]}>
            Class Reports ({pendingReports.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'EXTRA_HOURS' && styles.tabBtnActive]}
          onPress={() => setActiveTab('EXTRA_HOURS')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="clock-check-outline"
            size={18}
            color={activeTab === 'EXTRA_HOURS' ? '#FFFFFF' : Palette.textLight}
          />
          <Text style={[styles.tabText, activeTab === 'EXTRA_HOURS' && styles.tabTextActive]}>
            Extra Hours ({extraHoursList.filter((e) => e.status === 'PENDING').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: Class Reports */}
      {activeTab === 'REPORTS' ? (
        pendingReports.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons name="check-all" size={56} color={Palette.success} />
              <Text style={styles.emptyTitle}>Queue Clear</Text>
              <Text style={styles.emptySub}>
                No pending weekly reports waiting for HOD review. All submitted reports have been processed.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          pendingReports.map((report) => (
            <Card key={report.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.classBadge}>
                    <Text style={styles.classBadgeText}>{report.classId}</Text>
                  </View>
                  <View style={styles.weekPill}>
                    <Text style={styles.weekPillText}>Week {report.weekNumber}</Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>Consolidated Syllabus Submission</Text>
                <Text style={styles.coordinatorText}>
                  Submitted by: <Text style={{ fontWeight: '700', color: Palette.textDark }}>{report.submittedBy}</Text>
                </Text>

                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Average Class Coverage:</Text>
                  <Text style={[styles.metricVal, { color: Palette.primary }]}>
                    {report.overallCoverage}%
                  </Text>
                </View>

                {report.ccRemarks ? (
                  <View style={styles.remarksBox}>
                    <Text style={styles.remarksLabel}>CC Remarks:</Text>
                    <Text style={styles.remarksText}>"{report.ccRemarks}"</Text>
                  </View>
                ) : null}

                <View style={styles.actionsRow}>
                  <Button
                    mode="outlined"
                    icon="eye"
                    compact
                    style={styles.actionBtn}
                    onPress={() =>
                      navigation.navigate('RequestDetails', {
                        requestId: report.id,
                        requestType: 'CC_REPORT',
                      })
                    }
                  >
                    Inspect
                  </Button>

                  <Button
                    mode="contained-tonal"
                    icon="keyboard-return"
                    compact
                    textColor={Palette.error}
                    style={styles.actionBtn}
                    onPress={() => handleOpenReturn(report.id)}
                  >
                    Return
                  </Button>

                  <Button
                    mode="contained"
                    icon="check"
                    compact
                    style={[styles.actionBtn, { backgroundColor: Palette.success }]}
                    onPress={() => handleApproveReport(report.id)}
                  >
                    Approve
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )
      ) : (
        /* Tab 2: Extra Hours */
        extraHoursList.filter((e) => e.status === 'PENDING').length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons name="clock-check-outline" size={56} color={Palette.success} />
              <Text style={styles.emptyTitle}>No Extra Hour Requests</Text>
              <Text style={styles.emptySub}>
                There are currently no pending compensatory teaching hour requests in your department.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          extraHoursList
            .filter((e) => e.status === 'PENDING')
            .map((item) => (
              <Card key={item.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.subject}</Text>
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>PENDING</Text>
                    </View>
                  </View>

                  <Text style={styles.facultySub}>Faculty: {item.faculty} ({item.classId})</Text>

                  <View style={styles.detailRow}>
                    <Feather name="calendar" size={14} color="#64748B" />
                    <Text style={styles.detailText}>{item.date} · {item.period}</Text>
                  </View>

                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonLabel}>Justification:</Text>
                    <Text style={styles.reasonText}>{item.reason}</Text>
                  </View>

                  <View style={styles.actionsRow}>
                    <Button
                      mode="outlined"
                      textColor={Palette.error}
                      compact
                      style={[styles.actionBtn, { borderColor: Palette.error }]}
                      onPress={() => handleRejectExtraHour(item.id)}
                    >
                      Decline
                    </Button>

                    <Button
                      mode="contained"
                      icon="check"
                      compact
                      style={[styles.actionBtn, { backgroundColor: Palette.success }]}
                      onPress={() => handleApproveExtraHour(item.id)}
                    >
                      Sanction Slot
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))
        )
      )}

      {/* Return Dialog */}
      <Portal>
        <Dialog
          visible={returnDialogVisible}
          onDismiss={() => setReturnDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Return Report for Revision</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogSub}>
              Please describe what needs adjustment before this weekly report can be forwarded to the Principal.
            </Text>
            <TextInput
              mode="outlined"
              label="Revision Feedback"
              placeholder="e.g. Please update reasons for Unit 2 lag in Mathematics..."
              value={returnRemarks}
              onChangeText={setReturnRemarks}
              multiline
              numberOfLines={4}
              style={{ backgroundColor: '#FFFFFF', marginTop: ms(8) }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setReturnDialogVisible(false)} textColor={Palette.textLight}>
              Cancel
            </Button>
            <Button onPress={handleConfirmReturn} textColor={Palette.error}>
              Return Report
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: ms(16),
    paddingBottom: ms(40),
  },
  header: {
    marginBottom: ms(16),
  },
  headerTitle: {
    fontSize: ms(20),
    fontWeight: '900',
    color: Palette.textDark,
  },
  headerSub: {
    fontSize: ms(12.5),
    color: Palette.textLight,
    marginTop: ms(2),
    lineHeight: ms(18),
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: ms(16),
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ms(10),
    borderRadius: ms(12),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: ms(4),
  },
  tabBtnActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  tabText: {
    fontSize: ms(12.5),
    fontWeight: '700',
    color: Palette.textLight,
    marginLeft: ms(6),
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    padding: ms(20),
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: ms(17),
    fontWeight: '800',
    color: Palette.textDark,
    marginTop: ms(10),
  },
  emptySub: {
    fontSize: ms(13),
    color: Palette.textLight,
    textAlign: 'center',
    marginTop: ms(4),
    lineHeight: ms(19),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    marginBottom: ms(14),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(8),
  },
  classBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: ms(10),
    paddingVertical: ms(3),
    borderRadius: ms(6),
  },
  classBadgeText: {
    fontSize: ms(12),
    fontWeight: '800',
    color: Palette.primary,
  },
  weekPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(6),
  },
  weekPillText: {
    fontSize: ms(11),
    fontWeight: '700',
    color: Palette.textDark,
  },
  cardTitle: {
    fontSize: ms(15),
    fontWeight: '800',
    color: Palette.textDark,
  },
  coordinatorText: {
    fontSize: ms(12.5),
    color: Palette.textLight,
    marginTop: ms(2),
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: ms(10),
    padding: ms(10),
    marginTop: ms(10),
  },
  metricLabel: {
    fontSize: ms(12),
    color: Palette.textDark,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: ms(15),
    fontWeight: '900',
  },
  remarksBox: {
    backgroundColor: '#FEF9C3',
    padding: ms(10),
    borderRadius: ms(8),
    marginTop: ms(10),
    borderLeftWidth: 3,
    borderLeftColor: '#EAB308',
  },
  remarksLabel: {
    fontSize: ms(11),
    fontWeight: '800',
    color: '#854D0E',
  },
  remarksText: {
    fontSize: ms(12),
    color: '#713F12',
    fontStyle: 'italic',
    marginTop: ms(2),
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: ms(14),
    gap: ms(8),
  },
  actionBtn: {
    borderRadius: ms(8),
  },
  pendingBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(6),
  },
  pendingBadgeText: {
    fontSize: ms(10.5),
    fontWeight: '800',
    color: Palette.warning,
  },
  facultySub: {
    fontSize: ms(12.5),
    color: Palette.textLight,
    marginTop: ms(2),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ms(8),
  },
  detailText: {
    fontSize: ms(12),
    color: '#64748B',
    marginLeft: ms(6),
    fontWeight: '500',
  },
  reasonBox: {
    backgroundColor: '#F8FAFC',
    padding: ms(10),
    borderRadius: ms(8),
    marginTop: ms(10),
    borderLeftWidth: 3,
    borderLeftColor: Palette.primary,
  },
  reasonLabel: {
    fontSize: ms(11),
    fontWeight: '800',
    color: Palette.textLight,
  },
  reasonText: {
    fontSize: ms(12.5),
    color: '#334155',
    marginTop: ms(2),
    lineHeight: ms(17),
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
  },
  dialogTitle: {
    fontSize: ms(16),
    fontWeight: '800',
    color: Palette.textDark,
  },
  dialogSub: {
    fontSize: ms(12.5),
    color: Palette.textLight,
    lineHeight: ms(18),
  },
});

export default ApprovalScreen;
