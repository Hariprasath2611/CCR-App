import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Text, Portal, Dialog } from 'react-native-paper';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { Label } from '@components/editorial/Label';
import { StatTile } from '@components/editorial/StatTile';
import { EditorialChip } from '@components/editorial/EditorialChip';
import { EmptyState } from '@components/editorial/EmptyState';
import { AppTextInput } from '@components/common/AppTextInput';
import { ms } from '@theme/responsive';

interface ExtraHourRequest {
  id: string;
  facultyName: string;
  subjectCode: string;
  subjectTitle: string;
  classSection: string;
  requestedDate: string;
  periodSlot: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'RETURNED';
  hodRemarks?: string;
  submittedAt: string;
}

const INITIAL_REQUESTS: ExtraHourRequest[] = [
  {
    id: 'req_101',
    facultyName: 'Ms. E Uva Shakthi',
    subjectCode: 'CS3591',
    subjectTitle: 'Computer Networks',
    classSection: '3rd Year CSE-B',
    requestedDate: '24/10/2026',
    periodSlot: 'Period 3 (10:40 AM - 11:30 AM)',
    reason: 'Compensating for lost class hours due to annual technical symposium rehearsals. Target: Unit 4 TCP Congestion Control.',
    status: 'PENDING',
    submittedAt: 'Today, 09:15 AM',
  },
  {
    id: 'req_102',
    facultyName: 'Mr. S Faizal Mukthar Hussain',
    subjectCode: 'CS3551',
    subjectTitle: 'Distributed Computing',
    classSection: '4th Year CSE-A',
    requestedDate: '25/10/2026',
    periodSlot: 'Period 6 (02:30 PM - 03:20 PM)',
    reason: 'Lab practical session on MPI parallel matrix multiplication and distributed checkpointing simulation.',
    status: 'PENDING',
    submittedAt: 'Yesterday, 04:30 PM',
  },
  {
    id: 'req_103',
    facultyName: 'Mrs. Gopikha',
    subjectCode: 'CY3151',
    subjectTitle: 'Engineering Chemistry',
    classSection: '1st Year SEC-C',
    requestedDate: '22/10/2026',
    periodSlot: 'Period 2 (09:30 AM - 10:20 AM)',
    reason: 'Special remedial class for internal test 1 preparation on spectroscopy fundamentals.',
    status: 'APPROVED',
    hodRemarks: 'Approved for smart classroom 104.',
    submittedAt: '20/10/2026',
  },
  {
    id: 'req_104',
    facultyName: 'Mrs. Jasline',
    subjectCode: 'GE3151',
    subjectTitle: 'Problem Solving & Python',
    classSection: '1st Year SEC-F',
    requestedDate: '19/10/2026',
    periodSlot: 'Period 5 (01:30 PM - 02:20 PM)',
    reason: 'Hands-on debugging session for nested dictionary and file I/O operations.',
    status: 'APPROVED',
    hodRemarks: 'Lab slot confirmed with Lab Assistant.',
    submittedAt: '18/10/2026',
  },
  {
    id: 'req_105',
    facultyName: 'Mrs. Agnus',
    subjectCode: 'CS3391',
    subjectTitle: 'Object Oriented Programming',
    classSection: '2nd Year CSE-A',
    requestedDate: '18/10/2026',
    periodSlot: 'Period 1 (08:30 AM - 09:20 AM)',
    reason: 'Additional tutorial on Java Generics and exception propagation.',
    status: 'RETURNED',
    hodRemarks: 'Period 1 overlaps with department faculty assembly. Please select Period 5 or 6.',
    submittedAt: '17/10/2026',
  },
];

export const ExtraHourRequestsScreen = () => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<ExtraHourRequest[]>(INITIAL_REQUESTS);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'RETURNED'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  // Dialog State for Returning
  const [returnDialogVisible, setReturnDialogVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [remarksInput, setRemarksInput] = useState('');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'APPROVED', hodRemarks: 'Approved by HOD. Verified slot availability.' } : r
      )
    );
    Alert.alert('Request Approved', 'The extra teaching slot has been officially endorsed and updated in timetable sync.');
  };

  const handleOpenReturnDialog = (id: string) => {
    setSelectedRequestId(id);
    setRemarksInput('');
    setReturnDialogVisible(true);
  };

  const handleConfirmReturn = () => {
    if (!remarksInput.trim()) {
      Alert.alert('Remarks Required', 'Please provide feedback explaining why the slot request is returned.');
      return;
    }

    if (selectedRequestId) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequestId ? { ...r, status: 'RETURNED', hodRemarks: remarksInput.trim() } : r
        )
      );
    }
    setReturnDialogVisible(false);
    Alert.alert('Request Returned', 'The request has been returned to the faculty with your remarks.');
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const returnedCount = requests.filter((r) => r.status === 'RETURNED').length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[DayRibbonColors.cobalt]} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={styles.headerBox}>
        <Label text="FACULTY REQUISITIONS" />
        <Text style={styles.headingText}>Extra Teaching Slots</Text>
        <Text style={styles.subHeadingText}>
          HOD Endorsement Queue • {user?.department || 'Computer Science Engineering'}
        </Text>
      </View>

      {/* ── STATS ROW ── */}
      <View style={styles.statGrid}>
        <StatTile
          label="Pending"
          value={pendingCount}
          isLagging={pendingCount > 0}
          style={styles.statTileItem}
        />
        <StatTile
          label="Endorsed"
          value={approvedCount}
          style={styles.statTileItem}
        />
        <StatTile
          label="Returned"
          value={returnedCount}
          style={styles.statTileItem}
        />
      </View>

      {/* ── FILTER CHIPS ── */}
      <View style={styles.filterRow}>
        {(['ALL', 'PENDING', 'APPROVED', 'RETURNED'] as const).map((f) => (
          <EditorialChip
            key={f}
            label={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>

      {/* ── REQUESTS LIST ── */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          title="NO REQUESTS LOCATED"
          subtitle={`There are currently no extra teaching slot requests in the "${filter.toLowerCase()}" category.`}
        />
      ) : (
        filteredRequests.map((req) => {
          const isPending = req.status === 'PENDING';
          const isApproved = req.status === 'APPROVED';
          const isReturned = req.status === 'RETURNED';

          return (
            <View key={req.id} style={styles.card}>
              <View style={styles.topRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.classSectionText}>{req.classSection}</Text>
                  <Text style={styles.facultyName}>{req.facultyName}</Text>
                  <Text style={styles.submittedAt}>Submitted: {req.submittedAt}</Text>
                </View>

                <View
                  style={[
                    styles.statusTag,
                    isApproved && styles.statusTagApproved,
                    isReturned && styles.statusTagReturned,
                    isPending && styles.statusTagPending,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTagText,
                      isApproved && styles.statusTagTextApproved,
                      isReturned && styles.statusTagTextReturned,
                      isPending && styles.statusTagTextPending,
                    ]}
                  >
                    {isApproved
                      ? 'Endorsed'
                      : isReturned
                      ? 'Returned'
                      : 'Pending'}
                  </Text>
                </View>
              </View>

              {/* Subject */}
              <Text style={styles.subjectTitle}>
                {req.subjectCode} · {req.subjectTitle}
              </Text>

              {/* Slot Details */}
              <View style={styles.slotBlock}>
                <Text style={styles.slotText}>
                  Date: {req.requestedDate} • {req.periodSlot}
                </Text>
              </View>

              {/* Reason */}
              <View style={styles.reasonBox}>
                <Label text="JUSTIFICATION / TARGET:" />
                <Text style={styles.reasonText}>{req.reason}</Text>
              </View>

              {/* HOD Remarks */}
              {req.hodRemarks ? (
                <View style={[styles.remarksBox, isReturned && styles.remarksBoxReturned]}>
                  <Label
                    text="HOD NOTE:"
                    color={isReturned ? DayRibbonColors.warn : DayRibbonColors.ink}
                  />
                  <Text style={styles.remarksText}>"{req.hodRemarks}"</Text>
                </View>
              ) : null}

              {/* Actions for Pending */}
              {isPending && (
                <View style={styles.actionBtnRow}>
                  <TouchableOpacity
                    style={styles.outlineActionBtn}
                    onPress={() => handleOpenReturnDialog(req.id)}
                  >
                    <Text style={styles.outlineActionText}>Return</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.fillActionBtn}
                    onPress={() => handleApprove(req.id)}
                  >
                    <Text style={styles.fillActionText}>Endorse Slot</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })
      )}

      {/* ── RETURN FEEDBACK DIALOG ── */}
      <Portal>
        <Dialog
          visible={returnDialogVisible}
          onDismiss={() => setReturnDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Return Slot Request</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogPrompt}>
              Specify reasons or alternative slot recommendations for the faculty member:
            </Text>
            <View style={{ marginTop: ms(12) }}>
              <AppTextInput
                label="Feedback Remarks *"
                placeholder="e.g. Period 2 conflicts with scheduled exam..."
                value={remarksInput}
                onChangeText={setRemarksInput}
                multiline
                numberOfLines={3}
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
              <Text style={styles.dialogConfirmText}>Return Request</Text>
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
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: ms(16),
  },
  statTileItem: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: ms(16),
  },
  card: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: ms(16),
    marginBottom: ms(14),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ms(6),
  },
  classSectionText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(12),
    color: DayRibbonColors.muted,
  },
  facultyName: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(15),
    color: DayRibbonColors.ink,
    marginTop: ms(2),
  },
  submittedAt: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    marginTop: ms(2),
  },
  statusTag: {
    borderRadius: DayRibbonShapes.chipRadius,
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
  },
  statusTagPending: {
    backgroundColor: DayRibbonColors.lemon,
  },
  statusTagApproved: {
    backgroundColor: 'rgba(43, 63, 224, 0.08)',
  },
  statusTagReturned: {
    backgroundColor: DayRibbonColors.warnBg,
  },
  statusTagText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(10),
  },
  statusTagTextPending: {
    color: DayRibbonColors.ink,
  },
  statusTagTextApproved: {
    color: DayRibbonColors.cobalt,
  },
  statusTagTextReturned: {
    color: DayRibbonColors.warn,
  },
  subjectTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(14),
    color: DayRibbonColors.ink,
    marginTop: ms(6),
  },
  slotBlock: {
    backgroundColor: DayRibbonColors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: ms(10),
    marginTop: ms(8),
  },
  slotText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(12),
    color: DayRibbonColors.ink,
  },
  reasonBox: {
    backgroundColor: DayRibbonColors.bg,
    borderRadius: 12,
    padding: ms(10),
    marginTop: ms(10),
    borderLeftWidth: 3,
    borderLeftColor: DayRibbonColors.cobalt,
  },
  reasonText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    color: DayRibbonColors.ink,
    marginTop: ms(2),
    lineHeight: ms(18),
  },
  remarksBox: {
    backgroundColor: DayRibbonColors.bg,
    borderRadius: 12,
    padding: ms(10),
    marginTop: ms(10),
    borderLeftWidth: 3,
    borderLeftColor: DayRibbonColors.cobalt,
  },
  remarksBoxReturned: {
    borderLeftColor: DayRibbonColors.warn,
  },
  remarksText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(12),
    color: DayRibbonColors.ink,
    marginTop: ms(2),
  },
  actionBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: ms(14),
  },
  outlineActionBtn: {
    height: 40,
    paddingHorizontal: ms(16),
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.warn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineActionText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(12),
    color: DayRibbonColors.warn,
  },
  fillActionBtn: {
    height: 40,
    paddingHorizontal: ms(16),
    borderRadius: 14,
    backgroundColor: DayRibbonColors.cobalt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fillActionText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(12),
    color: DayRibbonColors.surface,
  },
  dialog: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  dialogTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(18),
    color: DayRibbonColors.ink,
  },
  dialogPrompt: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    lineHeight: ms(18),
    color: DayRibbonColors.muted,
  },
  dialogActions: {
    paddingHorizontal: ms(16),
    paddingBottom: ms(16),
    gap: 8,
  },
  dialogCancelBtn: {
    height: 40,
    paddingHorizontal: ms(16),
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCancelText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(12),
    color: DayRibbonColors.muted,
  },
  dialogConfirmBtn: {
    height: 40,
    paddingHorizontal: ms(16),
    borderRadius: 14,
    backgroundColor: DayRibbonColors.warn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogConfirmText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(12),
    color: DayRibbonColors.surface,
  },
});

export default ExtraHourRequestsScreen;
