import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Text, StatusBar } from 'react-native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { Label } from '@components/editorial/Label';
import { StatTile } from '@components/editorial/StatTile';
import { ProgressBar } from '@components/editorial/ProgressBar';
import { EditorialChip } from '@components/editorial/EditorialChip';
import { Feather } from '@expo/vector-icons';

interface SubjectSectionAudit {
  section: string;
  facultyName: string;
  plannedPeriods: number;
  actualPeriods: number;
  coveragePercent: number;
  lastLoggedWeek: number;
  status: 'AHEAD' | 'ON_TRACK' | 'LAGGING';
  latestTopic: string;
}

interface SubjectReportItem {
  id: string;
  code: string;
  title: string;
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  overallCoverage: number;
  totalPlannedPeriods: number;
  totalActualPeriods: number;
  sections: SubjectSectionAudit[];
}

const SAMPLE_SUBJECT_REPORTS: SubjectReportItem[] = [
  {
    id: 'subj_1',
    code: 'CS3591',
    title: 'Computer Networks',
    year: '3rd Year',
    overallCoverage: 86,
    totalPlannedPeriods: 45,
    totalActualPeriods: 43,
    sections: [
      {
        section: '3rd Year CSE-A',
        facultyName: 'Ms. Punitha EM',
        plannedPeriods: 45,
        actualPeriods: 44,
        coveragePercent: 88,
        lastLoggedWeek: 12,
        status: 'ON_TRACK',
        latestTopic: 'Transport Layer Congestion Avoidance & Leaky Bucket Algorithms',
      },
      {
        section: '3rd Year CSE-B',
        facultyName: 'Ms. E Uva Shakthi',
        plannedPeriods: 45,
        actualPeriods: 42,
        coveragePercent: 84,
        lastLoggedWeek: 12,
        status: 'LAGGING',
        latestTopic: 'TCP Flow Control & Sliding Window Protocol Implementation',
      },
    ],
  },
  {
    id: 'subj_2',
    code: 'CS3492',
    title: 'Database Management Systems',
    year: '2nd Year',
    overallCoverage: 82,
    totalPlannedPeriods: 45,
    totalActualPeriods: 41,
    sections: [
      {
        section: '2nd Year CSE-A',
        facultyName: 'Mrs. Agnus',
        plannedPeriods: 45,
        actualPeriods: 43,
        coveragePercent: 85,
        lastLoggedWeek: 12,
        status: 'ON_TRACK',
        latestTopic: 'B+ Tree Indexing & Transaction Concurrency Serializability',
      },
      {
        section: '2nd Year CSE-B',
        facultyName: 'Mrs. Archana',
        plannedPeriods: 45,
        actualPeriods: 39,
        coveragePercent: 79,
        lastLoggedWeek: 11,
        status: 'LAGGING',
        latestTopic: 'Relational Algebra Query Optimization Algorithms',
      },
    ],
  },
  {
    id: 'subj_3',
    code: 'CS3551',
    title: 'Distributed Computing',
    year: '4th Year',
    overallCoverage: 91,
    totalPlannedPeriods: 42,
    totalActualPeriods: 42,
    sections: [
      {
        section: '4th Year CSE-A',
        facultyName: 'Mr. S Faizal Mukthar Hussain',
        plannedPeriods: 42,
        actualPeriods: 42,
        coveragePercent: 92,
        lastLoggedWeek: 12,
        status: 'AHEAD',
        latestTopic: 'Distributed Consensus & Paxos/Raft Algorithm Analysis',
      },
      {
        section: '4th Year CSE-B',
        facultyName: 'Ms. R Rajalakshmi',
        plannedPeriods: 42,
        actualPeriods: 41,
        coveragePercent: 90,
        lastLoggedWeek: 12,
        status: 'ON_TRACK',
        latestTopic: 'Byzantine Fault Tolerance in Decentralized Networks',
      },
    ],
  },
  {
    id: 'subj_4',
    code: 'CY3151',
    title: 'Engineering Chemistry',
    year: '1st Year',
    overallCoverage: 77,
    totalPlannedPeriods: 45,
    totalActualPeriods: 38,
    sections: [
      {
        section: '1st Year SEC-A',
        facultyName: 'Dr. Karuppaiya',
        plannedPeriods: 45,
        actualPeriods: 40,
        coveragePercent: 80,
        lastLoggedWeek: 12,
        status: 'ON_TRACK',
        latestTopic: 'Water Technology & Boiler Feed Treatments',
      },
    ],
  },
];

const YEARS = ['ALL', '1st Year', '2nd Year', '3rd Year', '4th Year'];

export const SubjectReportsScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('subj_1');

  const filtered = SAMPLE_SUBJECT_REPORTS.filter((subj) => {
    const matchesYear = selectedYear === 'ALL' || subj.year === selectedYear;
    const matchesQuery =
      subj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subj.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesQuery;
  });

  const avgCoverage = Math.round(
    SAMPLE_SUBJECT_REPORTS.reduce((acc, curr) => acc + curr.overallCoverage, 0) /
      SAMPLE_SUBJECT_REPORTS.length
  );

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
        {/* Header */}
        <View style={styles.header}>
          <Label text="SYLLABUS COVERAGE AUDIT" />
          <Text style={styles.headerTitle}>Subject Audit</Text>
          <Text style={styles.headerSubtitle}>
            Cross-section curriculum progress, period delivery and syllabus compliance.
          </Text>
        </View>

        {/* 3-Column Stat Tiles */}
        <View style={styles.statGrid}>
          <StatTile
            label="Subjects"
            value={SAMPLE_SUBJECT_REPORTS.length}
            style={styles.statTileItem}
          />
          <StatTile
            label="Avg Coverage"
            value={`${avgCoverage}%`}
            style={styles.statTileItem}
          />
          <StatTile
            label="Lagging"
            value="2"
            isLagging={true}
            style={styles.statTileItem}
          />
        </View>

        {/* Search Field */}
        <View style={styles.searchBlock}>
          <View style={styles.searchInputWrapper}>
            <Feather name="search" size={18} color={DayRibbonColors.muted} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by course or code (e.g. CS3591)"
              placeholderTextColor={DayRibbonColors.mutedSoft}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Clear search">
                <Feather name="x" size={16} color={DayRibbonColors.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Year Filter Chips */}
        <View style={styles.chipRow}>
          {YEARS.map((yr) => (
            <EditorialChip
              key={yr}
              label={yr.toUpperCase()}
              selected={selectedYear === yr}
              onPress={() => setSelectedYear(yr)}
            />
          ))}
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>CURRICULUM COURSES</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{filtered.length} SUBJECTS</Text>
          </View>
        </View>

        {/* Subject Items */}
        <View style={styles.subjectList}>
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const isLagging = item.overallCoverage < 80;
            return (
              <View key={item.id} style={styles.subjectCard}>
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => setExpandedId(isExpanded ? null : item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.infoCol}>
                    <View style={styles.codeRow}>
                      <Text style={styles.subjectCode}>{item.code}</Text>
                      <View style={styles.yearChip}>
                        <Text style={styles.yearChipText}>{item.year}</Text>
                      </View>
                    </View>
                    <Text style={styles.subjectName}>{item.title}</Text>
                    <Text style={styles.metaLabel}>
                      {item.sections.length} Sections • {item.totalActualPeriods}/{item.totalPlannedPeriods} Periods
                    </Text>
                  </View>

                  <View style={styles.rightValueBox}>
                    <Text
                      style={[
                        styles.percentText,
                        isLagging ? styles.accentPercentText : null,
                      ]}
                    >
                      {item.overallCoverage}%
                    </Text>
                    <Feather
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={DayRibbonColors.muted}
                      style={{ marginTop: 4 }}
                    />
                  </View>
                </TouchableOpacity>

                {/* Progress Bar */}
                <ProgressBar
                  progress={item.overallCoverage / 100}
                  isLagging={isLagging}
                  style={styles.progressSpacing}
                />

                {/* Expanded Sections Breakdown */}
                {isExpanded && (
                  <View style={styles.sectionsBlock}>
                    <Text style={styles.sectionAuditHeader}>SECTION-WISE AUDIT</Text>

                    {item.sections.map((sec) => {
                      const isSecLagging = sec.status === 'LAGGING';
                      return (
                        <View key={sec.section} style={styles.sectionCard}>
                          <View style={styles.secRowTop}>
                            <View style={styles.secLeft}>
                              <Text style={styles.secName}>{sec.section}</Text>
                              <Text style={styles.secFaculty}>
                                Faculty: {sec.facultyName}
                              </Text>
                            </View>

                            <View style={styles.secRight}>
                              <Text
                                style={[
                                  styles.secPercent,
                                  isSecLagging ? styles.accentSecPercent : null,
                                ]}
                              >
                                {sec.coveragePercent}%
                              </Text>
                              <View
                                style={[
                                  styles.statusBadge,
                                  isSecLagging ? styles.accentStatusBadge : styles.cobaltStatusBadge,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.statusBadgeText,
                                    isSecLagging ? styles.accentStatusBadgeText : styles.cobaltStatusBadgeText,
                                  ]}
                                >
                                  {sec.status}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <Text style={styles.topicText} numberOfLines={2}>
                            {sec.latestTopic}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
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
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: DayRibbonColors.ink,
    marginTop: 4,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
    lineHeight: 18,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statTileItem: {
    flex: 1,
  },
  searchBlock: {
    marginBottom: 14,
  },
  searchInputWrapper: {
    height: 48,
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: DayRibbonFonts.body600,
    fontSize: 14,
    color: DayRibbonColors.ink,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    gap: 12,
  },
  subjectCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoCol: {
    flex: 1,
    marginRight: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  subjectCode: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.cobalt,
  },
  yearChip: {
    backgroundColor: DayRibbonColors.bg,
    borderRadius: DayRibbonShapes.chipRadius,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  yearChipText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    color: DayRibbonColors.muted,
  },
  subjectName: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    lineHeight: 22,
    color: DayRibbonColors.ink,
    marginBottom: 2,
  },
  metaLabel: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  rightValueBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  percentText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 26,
    lineHeight: 30,
    color: DayRibbonColors.cobalt,
  },
  accentPercentText: {
    color: DayRibbonColors.warn,
  },
  progressSpacing: {
    marginTop: 4,
  },
  sectionsBlock: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: DayRibbonColors.line,
    paddingTop: 12,
    gap: 10,
  },
  sectionAuditHeader: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    letterSpacing: 1,
    color: DayRibbonColors.muted,
    marginBottom: 2,
  },
  sectionCard: {
    backgroundColor: DayRibbonColors.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 12,
  },
  secRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  secLeft: {
    flex: 1,
    marginRight: 8,
  },
  secName: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.ink,
    marginBottom: 2,
  },
  secFaculty: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  secRight: {
    alignItems: 'flex-end',
  },
  secPercent: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 18,
    color: DayRibbonColors.cobalt,
    marginBottom: 2,
  },
  accentSecPercent: {
    color: DayRibbonColors.warn,
  },
  statusBadge: {
    borderRadius: DayRibbonShapes.chipRadius,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cobaltStatusBadge: {
    backgroundColor: 'rgba(43, 63, 224, 0.08)',
  },
  accentStatusBadge: {
    backgroundColor: DayRibbonColors.warnBg,
  },
  statusBadgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  cobaltStatusBadgeText: {
    color: DayRibbonColors.cobalt,
  },
  accentStatusBadgeText: {
    color: DayRibbonColors.warn,
  },
  topicText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    lineHeight: 16,
    color: DayRibbonColors.muted,
  },
});
