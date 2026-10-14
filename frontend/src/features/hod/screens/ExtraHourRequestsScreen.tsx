import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Text, Card, Avatar, Button, Badge, Chip, TextInput, Portal, Dialog } from 'react-native-paper';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
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

  const getStatusChipStyle = (status: ExtraHourRequest['status']) => {
    switch (status) {
      case 'PENDING':
        return { bg: '#FEF3C7', text: '#D97706', label: 'Pending Endorsement' };
      case 'APPROVED':
        return { bg: '#DCFCE7', text: '#15803D', label: 'Endorsed & Scheduled' };
      case 'RETURNED':
        return { bg: '#FEE2E2', text: '#B91C1C', label: 'Returned for Revision' };
    }
  };

  return (
    <View style={styles.container}>
      {/* ── HEADER SUMMARY BANNER ── */}
      <View style={styles.headerBanner}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Extra Teaching Slots</Text>
          <Text style={styles.headerSubtitle}>
            HOD Endorsement Queue • {user?.department || 'Computer Science Engineering'}
          </Text>
        </View>
        <View style={styles.pendingBadgeContainer}>
          <Text style={styles.pendingBadgeNum}>{pendingCount}</Text>
          <Text style={styles.pendingBadgeLabel}>Pending</Text>
        </View>
      </View>

      {/* ── FILTER CHIPS ── */}
      <View style={styles.filterRow}>
        <Chip
          selected={filter === 'ALL'}
          onPress={() => setFilter('ALL')}
          style={[styles.chip, filter === 'ALL' && styles.chipActive]}
          textStyle={[styles.chipText, filter === 'ALL' && styles.chipTextActive]}
        >
          All ({requests.length})
        </Chip>
        <Chip
          selected={filter === 'PENDING'}
          onPress={() => setFilter('PENDING')}
          style={[styles.chip, filter === 'PENDING' && styles.chipActive]}
          textStyle={[styles.chipText, filter === 'PENDING' && styles.chipTextActive]}
        >
          Pending ({pendingCount})
        </Chip>
        <Chip
          selected={filter === 'APPROVED'}
          onPress={() => setFilter('APPROVED')}
          style={[styles.chip, filter === 'APPROVED' && styles.chipActive]}
          textStyle={[styles.chipText, filter === 'APPROVED' && styles.chipTextActive]}
        >
          Approved ({approvedCount})
        </Chip>
        <Chip
          selected={filter === 'RETURNED'}
          onPress={() => setFilter('RETURNED')}
          style={[styles.chip, filter === 'RETURNED' && styles.chipActive]}
          textStyle={[styles.chipText, filter === 'RETURNED' && styles.chipTextActive]}
        >
          Returned ({returnedCount})
        </Chip>
      </View>

      {/* ── REQUESTS LIST ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Palette.primary]} />}
      >
        {filteredRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clock-check-outline" size={54} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Requests Found</Text>
            <Text style={styles.emptySubtitle}>
              There are currently no extra teaching slot requests in the "{filter.toLowerCase()}" category.
            </Text>
          </View>
        ) : (
          filteredRequests.map((req) => {
            const statusConfig = getStatusChipStyle(req.status);
            return (
              <Card key={req.id} style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  {/* Top Row: Faculty Avatar & Status */}
                  <View style={styles.topRow}>
                    <View style={styles.facultyRow}>
                      <Avatar.Text
                        size={40}
                        label={req.facultyName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                        style={styles.avatar}
                        labelStyle={styles.avatarLabel}
                      />
                      <View style={styles.facultyMeta}>
                        <Text style={styles.facultyName}>{req.facultyName}</Text>
                        <Text style={styles.submittedAt}>Submitted: {req.submittedAt}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusChip, { backgroundColor: statusConfig.bg }]}>
                      <Text style={[styles.statusChipText, { color: statusConfig.text }]}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  {/* Subject and Target Class */}
                  <View style={styles.courseBadgeRow}>
                    <View style={styles.subjectPill}>
                      <Text style={styles.subjectCode}>{req.subjectCode}</Text>
                      <Text style={styles.subjectTitle} numberOfLines={1}>
                        {req.subjectTitle}
                      </Text>
                    </View>
                    <View style={styles.classPill}>
                      <Feather name="layers" size={12} color="#0F52BA" />
                      <Text style={styles.classText}>{req.classSection}</Text>
                    </View>
                  </View>

                  {/* Time and Slot Details */}
                  <View style={styles.slotDetailsCard}>
                    <View style={styles.slotDetailItem}>
                      <Feather name="calendar" size={14} color="#64748B" />
                      <Text style={styles.slotDetailLabel}>Date: </Text>
                      <Text style={styles.slotDetailValue}>{req.requestedDate}</Text>
                    </View>
                    <View style={styles.slotDetailItem}>
                      <Feather name="clock" size={14} color="#64748B" />
                      <Text style={styles.slotDetailLabel}>Slot: </Text>
                      <Text style={styles.slotDetailValue}>{req.periodSlot}</Text>
                    </View>
                  </View>

                  {/* Reason justification */}
                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonLabel}>Justification / Syllabus Target:</Text>
                    <Text style={styles.reasonText}>{req.reason}</Text>
                  </View>

                  {/* HOD Remarks (if any) */}
                  {req.hodRemarks ? (
                    <View style={styles.remarksBox}>
                      <Feather name="message-square" size={14} color="#0F52BA" />
                      <Text style={styles.remarksText}>HOD Note: {req.hodRemarks}</Text>
                    </View>
                  ) : null}

                  {/* Action Buttons for Pending Requests */}
                  {req.status === 'PENDING' ? (
                    <View style={styles.actionBtnRow}>
                      <Button
                        mode="outlined"
                        icon="undo-variant"
                        textColor="#DC2626"
                        style={styles.returnBtn}
                        labelStyle={styles.btnLabel}
                        onPress={() => handleOpenReturnDialog(req.id)}
                      >
                        Return
                      </Button>
                      <Button
                        mode="contained"
                        icon="check-circle-outline"
                        buttonColor={Palette.primary}
                        style={styles.approveBtn}
                        labelStyle={styles.btnLabel}
                        onPress={() => handleApprove(req.id)}
                      >
                        Endorse Slot
                      </Button>
                    </View>
                  ) : null}
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* ── RETURN FEEDBACK DIALOG ── */}
      <Portal>
        <Dialog visible={returnDialogVisible} onDismiss={() => setReturnDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Return Slot Request</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogPrompt}>
              Specify reasons or alternative slot recommendations for the faculty member:
            </Text>
            <TextInput
              mode="outlined"
              placeholder="e.g. Period 2 conflicts with scheduled lab exam. Please reschedule for Period 5."
              value={remarksInput}
              onChangeText={setRemarksInput}
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
              outlineColor="#CBD5E1"
              activeOutlineColor={Palette.primary}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setReturnDialogVisible(false)} textColor="#64748B">
              Cancel
            </Button>
            <Button onPress={handleConfirmReturn} textColor="#DC2626" mode="contained-tonal">
              Return Request
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBanner: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: ms(20),
    paddingVertical: ms(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: ms(20),
    fontWeight: '900',
    color: Palette.textDark,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: ms(12),
    color: Palette.textLight,
    marginTop: ms(2),
    fontWeight: '500',
  },
  pendingBadgeContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: ms(12),
    paddingVertical: ms(6),
    paddingHorizontal: ms(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingBadgeNum: {
    fontSize: ms(18),
    fontWeight: '900',
    color: '#D97706',
  },
  pendingBadgeLabel: {
    fontSize: ms(10),
    fontWeight: '700',
    color: '#B45309',
    textTransform: 'uppercase',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: ms(16),
    paddingVertical: ms(10),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: ms(6),
  },
  chip: {
    backgroundColor: '#F1F5F9',
    borderRadius: ms(8),
  },
  chipActive: {
    backgroundColor: Palette.primary,
  },
  chipText: {
    fontSize: ms(12),
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: ms(16),
    paddingBottom: ms(40),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    marginBottom: ms(14),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
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
