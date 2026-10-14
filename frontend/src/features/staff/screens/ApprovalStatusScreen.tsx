import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { EditorialColors, EditorialFonts, EditorialSpacing } from '@theme/editorial';
import { Rule } from '@components/editorial/Rule';
import { Label } from '@components/editorial/Label';
import { EmptyState } from '@components/editorial/EmptyState';
import { AppButton } from '@components/common/AppButton';
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={styles.headerBox}>
        <Label text="DECISION AUDIT" />
        <Text style={styles.headingText}>APPROVAL TRACKER.</Text>
        <Text style={styles.subHeadingText}>
          TRACK HOD & ADMINISTRATIVE DECISIONS ON TEACHING PLANS, LOGS & REQUISITIONS
        </Text>
      </View>
      <Rule thick style={styles.heroRule} />

      {/* ── FILTER CHIPS ── */}
      <View style={styles.filtersRow}>
        {(['ALL', 'APPROVED', 'PENDING', 'RETURNED'] as const).map((f) => {
          const isSelected = filter === f;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── APPROVALS LIST ── */}
      {filtered.length === 0 ? (
        <EmptyState
          title="NO SUBMISSIONS LOCATED"
          subtitle="No requests match the selected audit status."
        />
      ) : (
        filtered.map((item) => {
          const isReturned = item.status === 'RETURNED';
          const isApproved = item.status === 'APPROVED';

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Label text={item.type.replace('_', ' ')} />
                  <Text style={styles.itemTitle}>{item.title.toUpperCase()}</Text>
                  <Text style={styles.subjectText}>
                    {item.subjectCode} · {item.subjectName}
                  </Text>
                  <Text style={styles.classText}>
                    {item.classSection} · {item.weekOrDate}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusTag,
                    isReturned && styles.statusTagReturned,
                    isApproved && styles.statusTagApproved,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTagText,
                      isReturned && styles.statusTagTextReturned,
                      isApproved && styles.statusTagTextApproved,
                    ]}
                  >
                    {item.status === 'RETURNED'
                      ? 'REVISION NEEDED'
                      : item.status === 'APPROVED'
                      ? 'APPROVED'
                      : 'PENDING HOD'}
                  </Text>
                </View>
              </View>

              {item.hodRemarks && (
                <View
                  style={[
                    styles.remarksBox,
                    isReturned && styles.remarksBoxReturned,
                  ]}
                >
                  <Label
                    text="HOD FEEDBACK:"
                    color={isReturned ? EditorialColors.accent : EditorialColors.ink}
                  />
                  <Text style={styles.remarksText}>"{item.hodRemarks}"</Text>
                </View>
              )}

              <View style={styles.cardFooter}>
                <Text style={styles.footerDate}>SUBMITTED: {item.submittedAt}</Text>
                {isReturned && (
                  <TouchableOpacity
                    style={styles.resubmitBtn}
                    onPress={() =>
                      navigation.navigate('WeeklyProgress', {
                        subjectCode: item.subjectCode,
                        weekNumber: 12,
                        classSection: item.classSection,
                      })
                    }
                  >
                    <Text style={styles.resubmitBtnText}>UPDATE & RESUBMIT</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}
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
  filtersRow: {
    flexDirection: 'row',
    marginBottom: ms(16),
  },
  filterChip: {
    paddingVertical: ms(6),
    paddingHorizontal: ms(12),
    backgroundColor: EditorialColors.white,
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    marginRight: ms(8),
  },
  filterChipActive: {
    backgroundColor: EditorialColors.ink,
  },
  filterText: {
    fontFamily: EditorialFonts.bold,
    fontSize: ms(11),
    letterSpacing: 0.5,
    color: EditorialColors.ink,
  },
  filterTextActive: {
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(14),
    color: EditorialColors.ink,
    marginTop: ms(2),
  },
  subjectText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: ms(12),
    color: EditorialColors.ink,
    marginTop: ms(2),
  },
  classText: {
    fontFamily: EditorialFonts.regular,
    fontSize: ms(11),
    color: EditorialColors.muted,
    marginTop: ms(2),
  },
  statusTag: {
    paddingHorizontal: ms(8),
    paddingVertical: ms(4),
    borderWidth: 1,
    borderColor: EditorialColors.muted,
    backgroundColor: EditorialColors.bg,
  },
  statusTagApproved: {
    borderColor: EditorialColors.ink,
    backgroundColor: EditorialColors.ink,
  },
  statusTagReturned: {
    borderWidth: 1.5,
    borderColor: EditorialColors.accent,
    backgroundColor: EditorialColors.white,
  },
  statusTagText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(9.5),
    letterSpacing: 0.5,
    color: EditorialColors.muted,
  },
  statusTagTextApproved: {
    color: EditorialColors.white,
  },
  statusTagTextReturned: {
    color: EditorialColors.accent,
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
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: ms(12),
    paddingTop: ms(8),
    borderTopWidth: 1,
    borderTopColor: EditorialColors.track,
  },
  footerDate: {
    fontFamily: EditorialFonts.semibold,
    fontSize: ms(10),
    color: EditorialColors.muted,
    letterSpacing: 0.5,
  },
  resubmitBtn: {
    backgroundColor: EditorialColors.accent,
    paddingHorizontal: ms(10),
    paddingVertical: ms(6),
  },
  resubmitBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(10),
    letterSpacing: 0.5,
    color: EditorialColors.white,
  },
});

export default ApprovalStatusScreen;

