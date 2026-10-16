import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { Label } from '@components/editorial/Label';
import { EditorialChip } from '@components/editorial/EditorialChip';
import { EmptyState } from '@components/editorial/EmptyState';
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
        <Text style={styles.headingText}>Approval Tracker</Text>
        <Text style={styles.subHeadingText}>
          Track HOD and administrative decisions on teaching plans, logs and requisitions.
        </Text>
      </View>

      {/* ── FILTER CHIPS ── */}
      <View style={styles.filtersRow}>
        {(['ALL', 'APPROVED', 'PENDING', 'RETURNED'] as const).map((f) => (
          <EditorialChip
            key={f}
            label={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
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
          const isPending = item.status === 'PENDING';

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.typeText}>{item.type.replace('_', ' ')}</Text>
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
                    styles.statusTag,
                    isReturned && styles.statusTagReturned,
                    isApproved && styles.statusTagApproved,
                    isPending && styles.statusTagPending,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTagText,
                      isReturned && styles.statusTagTextReturned,
                      isApproved && styles.statusTagTextApproved,
                      isPending && styles.statusTagTextPending,
                    ]}
                  >
                    {item.status === 'RETURNED'
                      ? 'Revision Needed'
                      : item.status === 'APPROVED'
                      ? 'Approved'
                      : 'Pending HOD'}
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
                    color={isReturned ? DayRibbonColors.warn : DayRibbonColors.ink}
                  />
                  <Text style={styles.remarksText}>"{item.hodRemarks}"</Text>
                </View>
              )}

              <View style={styles.cardFooter}>
                <Text style={styles.footerDate}>Submitted: {item.submittedAt}</Text>
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
                    <Text style={styles.resubmitBtnText}>Update & Resubmit</Text>
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
  filtersRow: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  typeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(11),
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    marginBottom: 2,
  },
  itemTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(16),
    color: DayRibbonColors.ink,
    marginBottom: 2,
  },
  subjectText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(13),
    color: DayRibbonColors.ink,
    marginBottom: 2,
  },
  classText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(12),
    color: DayRibbonColors.muted,
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
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: ms(12),
    paddingTop: ms(10),
    borderTopWidth: 1,
    borderTopColor: DayRibbonColors.line,
  },
  footerDate: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
  },
  resubmitBtn: {
    backgroundColor: DayRibbonColors.warn,
    borderRadius: 12,
    paddingHorizontal: ms(12),
    paddingVertical: ms(6),
  },
  resubmitBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(11),
    color: DayRibbonColors.surface,
  },
});

export default ApprovalStatusScreen;
