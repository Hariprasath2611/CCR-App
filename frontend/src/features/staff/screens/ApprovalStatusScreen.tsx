import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Badge, Divider, Button } from 'react-native-paper';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useReportStore } from '@features/cc/store/useReportStore';
import { ms } from '@theme/responsive';

interface ApprovalItem {
  id: string;
  type: 'PLAN' | 'EXTRA_HOURS' | 'WEEKLY_REPORT';
  title: string;
  subjectCode: string;
  subjectName: string;
  classSection: string;
  weekOrDate: string;
  status: 'APPROVED' | 'PENDING' | 'RETURNED';
  hodRemarks?: string;
  submittedAt: string;
}

const SAMPLE_APPROVALS: ApprovalItem[] = [
  {
    id: 'appr_1',
    type: 'PLAN',
    title: 'Weekly Teaching Plan',
    subjectCode: 'CS3591',
    subjectName: 'Computer Networks',
    classSection: '1st Year SEC-B',
    weekOrDate: 'Academic Week 12',
    status: 'APPROVED',
    hodRemarks: 'Approved. Proceed according to syllabus schedule.',
    submittedAt: '12/07/2026',
  },
  {
    id: 'appr_2',
    type: 'EXTRA_HOURS',
    title: 'Extra Teaching Hour Request',
    subjectCode: 'CS3501',
    subjectName: 'Compiler Design',
    classSection: '3rd Year CSE-A',
    weekOrDate: 'Requested for 20/07/2026 (Period 3)',
    status: 'APPROVED',
    hodRemarks: 'Slot sanctioned for lab revision.',
    submittedAt: '14/07/2026',
  },
  {
    id: 'appr_3',
    type: 'WEEKLY_REPORT',
    title: 'Course Coverage Weekly Log',
    subjectCode: 'CS3591',
    subjectName: 'Computer Networks',
    classSection: '1st Year SEC-B',
    weekOrDate: 'Academic Week 13',
    status: 'PENDING',
    submittedAt: '15/07/2026',
  },
  {
    id: 'appr_4',
    type: 'PLAN',
    title: 'Weekly Teaching Plan',
    subjectCode: 'CS8501',
    subjectName: 'Theory of Computation',
    classSection: '2nd Year CSE-B',
    weekOrDate: 'Academic Week 11',
    status: 'RETURNED',
    hodRemarks: 'Please adjust Unit 3 topic allocation to match Anna University credits.',
    submittedAt: '05/07/2026',
  },
];

export const ApprovalStatusScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'RETURNED'>('ALL');
  const [items, setItems] = useState<ApprovalItem[]>(SAMPLE_APPROVALS);

  const filtered = items.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  const getStatusBadge = (status: 'APPROVED' | 'PENDING' | 'RETURNED') => {
    switch (status) {
      case 'APPROVED':
        return { label: 'APPROVED', color: Palette.success, bg: '#ECFDF5', border: '#A7F3D0' };
      case 'PENDING':
        return { label: 'PENDING HOD', color: Palette.warning, bg: '#FFFBEB', border: '#FDE68A' };
      case 'RETURNED':
        return { label: 'REVISION NEEDED', color: Palette.error, bg: '#FEF2F2', border: '#FECACA' };
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Approvals Tracker</Text>
        <Text style={styles.headerSub}>
          Track HOD and Administrative decisions on your teaching plans, course logs, and extra hour requests.
        </Text>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersRow}>
        {(['ALL', 'APPROVED', 'PENDING', 'RETURNED'] as const).map((f) => {
          const isSelected = filter === f;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Approvals Cards */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="file-search-outline" size={56} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No Submissions Found</Text>
          <Text style={styles.emptySub}>No requests match the selected status filter.</Text>
        </View>
      ) : (
        filtered.map((item) => {
          const badge = getStatusBadge(item.status);
          return (
            <Card key={item.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.subjectText}>
                      {item.subjectCode} · {item.subjectName}
                    </Text>
                    <Text style={styles.classText}>
                      {item.classSection} · {item.weekOrDate}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: badge.bg, borderColor: badge.border },
                    ]}
                  >
                    <Text style={[styles.statusPillText, { color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {item.hodRemarks && (
                  <View
                    style={[
                      styles.remarksBox,
                      item.status === 'RETURNED' && styles.remarksBoxReturned,
                    ]}
                  >
                    <Text
                      style={[
                        styles.remarksLabel,
                        item.status === 'RETURNED' && { color: Palette.error },
                      ]}
                    >
                      HOD Feedback:
                    </Text>
                    <Text style={styles.remarksText}>"{item.hodRemarks}"</Text>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.footerDate}>Submitted: {item.submittedAt}</Text>
                  {item.status === 'RETURNED' && (
                    <Button
                      mode="contained-tonal"
                      compact
                      icon="playlist-edit"
                      onPress={() =>
                        navigation.navigate('WeeklyProgress', {
                          subjectCode: item.subjectCode,
                          weekNumber: 12,
                          classSection: item.classSection,
                        })
                      }
                      style={styles.resubmitBtn}
                    >
                      Update & Resubmit
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          );
        })
      )}
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
  filtersRow: {
    flexDirection: 'row',
    marginBottom: ms(16),
  },
  filterChip: {
    paddingVertical: ms(6),
    paddingHorizontal: ms(14),
    borderRadius: ms(20),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: ms(8),
  },
  filterChipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  filterText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: Palette.textLight,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    marginBottom: ms(12),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: ms(15),
    fontWeight: '800',
    color: Palette.textDark,
  },
  subjectText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: Palette.primary,
    marginTop: ms(2),
  },
  classText: {
    fontSize: ms(12),
    color: Palette.textLight,
    marginTop: ms(2),
  },
  statusPill: {
    paddingHorizontal: ms(10),
    paddingVertical: ms(4),
    borderRadius: ms(8),
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: ms(10.5),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  remarksBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: ms(8),
    padding: ms(10),
    marginTop: ms(12),
    borderLeftWidth: 3,
    borderLeftColor: Palette.primary,
  },
  remarksBoxReturned: {
    backgroundColor: '#FEF2F2',
    borderLeftColor: Palette.error,
  },
  remarksLabel: {
    fontSize: ms(11),
    fontWeight: '800',
    color: Palette.primary,
    textTransform: 'uppercase',
  },
  remarksText: {
    fontSize: ms(12.5),
    color: '#334155',
    fontStyle: 'italic',
    marginTop: ms(2),
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: ms(12),
    paddingTop: ms(8),
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  footerDate: {
    fontSize: ms(11.5),
    color: '#94A3B8',
    fontWeight: '500',
  },
  resubmitBtn: {
    borderRadius: ms(8),
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: ms(50),
  },
  emptyTitle: {
    fontSize: ms(16),
    fontWeight: '800',
    color: Palette.textDark,
    marginTop: ms(10),
  },
  emptySub: {
    fontSize: ms(13),
    color: Palette.textLight,
    marginTop: ms(4),
  },
});

export default ApprovalStatusScreen;
