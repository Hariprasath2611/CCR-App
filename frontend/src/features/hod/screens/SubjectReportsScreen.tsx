import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Text, StatusBar } from 'react-native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { SegBar } from '@components/editorial/SegBar';
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
      <StatusBar barStyle="dark-content" backgroundColor={EditorialColors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, EditorialSpacing.topSafeArea),
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Label text="SYLLABUS COVERAGE AUDIT" />
          <Text style={styles.headerTitle}>
            SUBJECT AUDIT<Text style={styles.accentDot}>.</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Cross-section curriculum progress, period delivery and syllabus compliance.
          </Text>
        </View>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* 3-Column Stat Row */}
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{SAMPLE_SUBJECT_REPORTS.length}</Text>
            <Label text="SUBJECTS" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{avgCoverage}%</Text>
            <Label text="AVG COVERAGE" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statNum, styles.accentStatNum]}>2</Text>
            <Label text="LAGGING" />
          </View>
        </View>

        {/* 1px Hairline Rule */}
        <Rule thickness="hairline" style={styles.hairlineSpacer} />

        {/* Search Underline Input */}
        <View style={styles.searchBlock}>
          <Text style={styles.searchLabel}>FILTER BY COURSE OR CODE</Text>
          <TextInput
            style={styles.underlineInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="e.g. CS3591 or Networks"
            placeholderTextColor={EditorialColors.muted}
            autoCapitalize="none"
          />
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
          <Label text={`${filtered.length} SUBJECTS`} />
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
                      <Text style={styles.yearTag}>{item.year}</Text>
                    </View>
                    <Text style={styles.subjectTitle}>{item.title}</Text>
                    <Label
                      text={`${item.sections.length} SECTIONS • ${item.totalActualPeriods}/${item.totalPlannedPeriods} PERIODS`}
                      style={styles.metaLabel}
                    />
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
                      color={EditorialColors.ink}
                      style={{ marginTop: 4 }}
                    />
                  </View>
                </TouchableOpacity>

                {/* 25-Segment Bar */}
                <View style={styles.segBarWrapper}>
                  <SegBar
                    totalSegments={25}
                    filledSegments={Math.round((item.overallCoverage / 100) * 25)}
                    isLagging={isLagging}
                  />
                </View>

                {/* Expanded Sections Breakdown */}
                {isExpanded && (
                  <View style={styles.sectionsBlock}>
                    <Rule thickness="hairline" style={{ marginBottom: 12 }} />
                    <Label text="SECTION-WISE AUDIT" style={{ marginBottom: 8 }} />

                    {item.sections.map((sec) => {
                      const isSecLagging = sec.status === 'LAGGING';
                      return (
                        <View key={sec.section} style={styles.sectionRow}>
                          <View style={styles.secRowTop}>
                            <View style={styles.secLeft}>
                              <Text style={styles.secName}>{sec.section}</Text>
                              <Label text={`FACULTY: ${sec.facultyName.toUpperCase()}`} />
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
                                  isSecLagging ? styles.accentStatusBadge : null,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.statusBadgeText,
                                    isSecLagging ? styles.accentStatusBadgeText : null,
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
    backgroundColor: EditorialColors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
  },
  content: {
    paddingHorizontal: EditorialSpacing.screenHorizontal,
  },
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: EditorialFonts.display,
    fontSize: 36,
    lineHeight: 40,
    color: EditorialColors.ink,
    letterSpacing: -0.5,
    marginTop: 4,
    marginBottom: 4,
  },
  accentDot: {
    color: EditorialColors.accent,
  },
  headerSubtitle: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
    lineHeight: 18,
  },
  heavySpacer: {
    marginVertical: 18,
  },
  hairlineSpacer: {
    marginVertical: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: EditorialFonts.display,
    fontSize: 30,
    lineHeight: 34,
    color: EditorialColors.ink,
    marginBottom: 2,
  },
  accentStatNum: {
    color: EditorialColors.accent,
  },
  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: EditorialColors.ink,
  },
  searchBlock: {
    marginBottom: 16,
  },
  searchLabel: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
    marginBottom: 6,
  },
  underlineInput: {
    height: 44,
    borderBottomWidth: 2,
    borderBottomColor: EditorialColors.ink,
    fontFamily: EditorialFonts.semibold,
    fontSize: 15,
    color: EditorialColors.ink,
    paddingVertical: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.ink,
  },
  subjectList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
  },
  subjectCard: {
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.ink,
    paddingVertical: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
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
    fontFamily: EditorialFonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    color: EditorialColors.muted,
  },
  yearTag: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
  },
  subjectTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 17,
    lineHeight: 22,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  metaLabel: {
    letterSpacing: 1.5,
  },
  rightValueBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  percentText: {
    fontFamily: EditorialFonts.display,
    fontSize: 28,
    lineHeight: 32,
    color: EditorialColors.ink,
  },
  accentPercentText: {
    color: EditorialColors.accent,
  },
  segBarWrapper: {
    marginTop: 2,
  },
  sectionsBlock: {
    marginTop: 14,
    paddingTop: 4,
  },
  sectionRow: {
    borderTopWidth: 1,
    borderTopColor: EditorialColors.track,
    paddingVertical: 10,
  },
  secRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  secLeft: {
    flex: 1,
    marginRight: 8,
  },
  secName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 14,
    color: EditorialColors.ink,
    marginBottom: 2,
  },
  secRight: {
    alignItems: 'flex-end',
  },
  secPercent: {
    fontFamily: EditorialFonts.display,
    fontSize: 18,
    color: EditorialColors.ink,
    marginBottom: 2,
  },
  accentSecPercent: {
    color: EditorialColors.accent,
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  accentStatusBadge: {
    borderColor: EditorialColors.accent,
  },
  statusBadgeText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 9,
    letterSpacing: 1,
    color: EditorialColors.ink,
  },
  accentStatusBadgeText: {
    color: EditorialColors.accent,
  },
  topicText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: EditorialColors.muted,
  },
});
