import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Text, Portal, Dialog } from 'react-native-paper';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { EditorialColors, EditorialFonts, EditorialSpacing } from '@theme/editorial';
import { Rule } from '@components/editorial/Rule';
import { Label } from '@components/editorial/Label';
import { StatRow } from '@components/editorial/StatRow';
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[EditorialColors.ink]} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={styles.headerBox}>
        <Label text="FACULTY REQUISITIONS" />
        <Text style={styles.headingText}>EXTRA TEACHING SLOTS.</Text>
        <Text style={styles.subHeadingText}>
          HOD ENDORSEMENT QUEUE · {user?.department?.toUpperCase() || 'COMPUTER SCIENCE ENGINEERING'}
        </Text>
      </View>
      <Rule thick style={styles.heroRule} />

      {/* ── STATS ROW ── */}
      <View style={styles.statBox}>
        <StatRow
          columns={[
            { label: 'PENDING', value: `${pendingCount}` },
            { label: 'ENDORSED', value: `${approvedCount}` },
            { label: 'RETURNED', value: `${returnedCount}` },
          ]}
        />
      </View>

      {/* ── FILTER CHIPS ── */}
      <View style={styles.filterRow}>
        {(['ALL', 'PENDING', 'APPROVED', 'RETURNED'] as const).map((f) => {
          const isSelected = filter === f;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.squareChip, isSelected && styles.squareChipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
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
                  <Label text={req.classSection.toUpperCase()} />
                  <Text style={styles.facultyName}>{req.facultyName.toUpperCase()}</Text>
                  <Text style={styles.submittedAt}>SUBMITTED: {req.submittedAt}</Text>
                </View>

                <View
                  style={[
                    styles.statusTag,
                    isApproved && styles.statusTagApproved,
                    isReturned && styles.statusTagReturned,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTagText,
                      isApproved && styles.statusTagTextApproved,
                      isReturned && styles.statusTagTextReturned,
                    ]}
                  >
                    {isApproved
                      ? 'ENDORSED'
                      : isReturned
                      ? 'RETURNED'
                      : 'PENDING'}
                  </Text>
                </View>
              </View>

              {/* Subject */}
              <Text style={styles.subjectTitle}>
                {req.subjectCode} · {req.subjectTitle.toUpperCase()}
              </Text>

              {/* Slot Details */}
              <View style={styles.slotBlock}>
                <Text style={styles.slotText}>
                  DATE: {req.requestedDate} · {req.periodSlot.toUpperCase()}
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
                    color={isReturned ? EditorialColors.accent : EditorialColors.ink}
                  />
                  <Text style={styles.remarksText}>"{req.hodRemarks}"</Text>
                </View>
              ) : null}

              {/* Actions for Pending */}
              {isPending && (
                <View style={styles.actionBtnRow}>
                  <TouchableOpacity
                    style={[styles.outlineActionBtn, { borderColor: EditorialColors.accent }]}
                    onPress={() => handleOpenReturnDialog(req.id)}
                  >
                    <Text style={[styles.outlineActionText, { color: EditorialColors.accent }]}>
                      RETURN
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.fillActionBtn}
                    onPress={() => handleApprove(req.id)}
                  >
                    <Text style={styles.fillActionText}>ENDORSE SLOT</Text>
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
          <Dialog.Title style={styles.dialogTitle}>RETURN SLOT REQUEST</Dialog.Title>
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
              <Text style={styles.dialogCancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dialogConfirmBtn}
              onPress={handleConfirmReturn}
            >
              <Text style={styles.dialogConfirmText}>RETURN REQUEST</Text>
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
  statBox: {
    marginBottom: ms(16),
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: ms(16),
  },
  squareChip: {
    paddingVertical: ms(6),
    paddingHorizontal: ms(12),
    backgroundColor: EditorialColors.white,
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    marginRight: ms(8),
  },
  squareChipActive: {
    backgroundColor: EditorialColors.ink,
  },
  chipText: {
    fontFamily: EditorialFonts.bold,
    fontSize: ms(11),
    letterSpacing: 0.5,
    color: EditorialColors.ink,
  },
  chipTextActive: {
    color: EditorialColors.white,
  },
  card: {
    backgroundColor: EditorialColors.white,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    padding: ms(14),
    marginBottom: ms(14),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ms(6),
  },
  facultyName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(13),
    color: EditorialColors.ink,
    marginTop: ms(2),
  },
  submittedAt: {
    fontFamily: EditorialFonts.regular,
    fontSize: ms(10),
    color: EditorialColors.muted,
    marginTop: ms(2),
  },
  statusTag: {
    borderWidth: 1,
    borderColor: EditorialColors.muted,
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    backgroundColor: EditorialColors.bg,
  },
  statusTagApproved: {
    backgroundColor: EditorialColors.ink,
    borderColor: EditorialColors.ink,
  },
  statusTagReturned: {
    borderColor: EditorialColors.accent,
    borderWidth: 1.5,
    backgroundColor: EditorialColors.white,
  },
  statusTagText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(9.5),
    color: EditorialColors.muted,
    letterSpacing: 0.5,
  },
  statusTagTextApproved: {
    color: EditorialColors.white,
  },
  statusTagTextReturned: {
    color: EditorialColors.accent,
  },
  subjectTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(13),
    color: EditorialColors.ink,
    marginTop: ms(6),
  },
  slotBlock: {
    backgroundColor: EditorialColors.bg,
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    padding: ms(8),
    marginTop: ms(8),
  },
  slotText: {
    fontFamily: EditorialFonts.bold,
    fontSize: ms(11),
    color: EditorialColors.ink,
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
    lineHeight: ms(17),
  },
  remarksBox: {
    backgroundColor: EditorialColors.bg,
    padding: ms(10),
    marginTop: ms(10),
    borderLeftWidth: 3,
    borderLeftColor: EditorialColors.ink,
  },
  remarksBoxReturned: {
    borderLeftColor: EditorialColors.accent,
  },
  remarksText: {
    fontFamily: EditorialFonts.regular,
    fontSize: ms(12),
    color: EditorialColors.ink,
    marginTop: ms(2),
  },
  actionBtnRow: {
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
  dialogPrompt: {
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

    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    padding: ms(16),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(12),
  },
  facultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: Palette.primary,
  },
  avatarLabel: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  facultyMeta: {
    marginLeft: ms(10),
    flex: 1,
  },
  facultyName: {
    fontSize: ms(15),
    fontWeight: '800',
    color: Palette.textDark,
  },
  submittedAt: {
    fontSize: ms(11),
    color: Palette.textLight,
    marginTop: ms(1),
  },
  statusChip: {
    paddingVertical: ms(4),
    paddingHorizontal: ms(8),
    borderRadius: ms(6),
  },
  statusChipText: {
    fontSize: ms(11),
    fontWeight: '700',
  },
  courseBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(10),
  },
  subjectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: ms(8),
    paddingHorizontal: ms(10),
    paddingVertical: ms(5),
    flex: 0.65,
  },
  subjectCode: {
    fontSize: ms(12),
    fontWeight: '800',
    color: '#1D4ED8',
    marginRight: ms(6),
  },
  subjectTitle: {
    fontSize: ms(12),
    fontWeight: '600',
    color: '#1E40AF',
    flex: 1,
  },
  classPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: ms(8),
    paddingHorizontal: ms(10),
    paddingVertical: ms(5),
    gap: ms(4),
  },
  classText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: '#0F52BA',
  },
  slotDetailsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: ms(10),
    padding: ms(10),
    marginBottom: ms(10),
    gap: ms(4),
  },
  slotDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotDetailLabel: {
    fontSize: ms(12),
    fontWeight: '600',
    color: '#64748B',
    marginLeft: ms(6),
  },
  slotDetailValue: {
    fontSize: ms(12),
    fontWeight: '700',
    color: Palette.textDark,
  },
  reasonBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: ms(10),
    padding: ms(10),
    marginBottom: ms(12),
  },
  reasonLabel: {
    fontSize: ms(11),
    fontWeight: '700',
    color: '#475569',
    marginBottom: ms(3),
  },
  reasonText: {
    fontSize: ms(12),
    color: Palette.textDark,
    lineHeight: ms(17),
  },
  remarksBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: ms(8),
    padding: ms(8),
    marginBottom: ms(12),
    gap: ms(6),
  },
  remarksText: {
    fontSize: ms(12),
    color: '#1E40AF',
    fontStyle: 'italic',
    flex: 1,
  },
  actionBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: ms(4),
    gap: ms(10),
  },
  returnBtn: {
    flex: 0.38,
    borderColor: '#DC2626',
    borderRadius: ms(10),
  },
  approveBtn: {
    flex: 0.6,
    borderRadius: ms(10),
  },
  btnLabel: {
    fontSize: ms(12),
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ms(60),
    paddingHorizontal: ms(24),
  },
  emptyTitle: {
    fontSize: ms(17),
    fontWeight: '800',
    color: Palette.textDark,
    marginTop: ms(14),
  },
  emptySubtitle: {
    fontSize: ms(13),
    color: Palette.textLight,
    textAlign: 'center',
    marginTop: ms(6),
    lineHeight: ms(18),
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
  },
  dialogTitle: {
    fontSize: ms(18),
    fontWeight: '800',
    color: Palette.textDark,
  },
  dialogPrompt: {
    fontSize: ms(13),
    color: '#64748B',
    marginBottom: ms(10),
  },
  dialogInput: {
    backgroundColor: '#FFFFFF',
    fontSize: ms(13),
  },
});

export default ExtraHourRequestsScreen;
