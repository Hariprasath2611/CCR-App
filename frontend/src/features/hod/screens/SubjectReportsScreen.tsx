import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl, TextInput as RNTextInput } from 'react-native';
import { Text, Card, Avatar, ProgressBar, Chip, Badge, Button } from 'react-native-paper';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ms } from '@theme/responsive';

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
        latestTopic: 'Electrochemical Cells and Galvanic Corrosion Mechanisms',
      },
      {
        section: '1st Year SEC-B',
        facultyName: 'Mrs. G.Revathi',
        plannedPeriods: 45,
        actualPeriods: 41,
        coveragePercent: 82,
        lastLoggedWeek: 12,
        status: 'ON_TRACK',
        latestTopic: 'Polymer Synthesis, Composites & Biodegradable Polymers',
      },
      {
        section: '1st Year SEC-C',
        facultyName: 'Mrs. Gopikha',
        plannedPeriods: 45,
        actualPeriods: 35,
        coveragePercent: 71,
        lastLoggedWeek: 11,
        status: 'LAGGING',
        latestTopic: 'Spectroscopy Instrumentation & UV-Visible Beer-Lambert Law',
      },
      {
        section: '1st Year SEC-D',
        facultyName: 'Dr. Bhuvaneshwari',
        plannedPeriods: 45,
        actualPeriods: 39,
        coveragePercent: 78,
        lastLoggedWeek: 12,
        status: 'ON_TRACK',
        latestTopic: 'Phase Rule Applied to One and Two Component Systems',
      },
    ],
  },
  {
    id: 'subj_5',
    code: 'GE3151',
    title: 'Problem Solving & Python',
    year: '1st Year',
    overallCoverage: 83,
    totalPlannedPeriods: 45,
    totalActualPeriods: 42,
    sections: [
      {
        section: '1st Year SEC-E',
        facultyName: 'Dr. Josphin',
        plannedPeriods: 45,
        actualPeriods: 41,
        coveragePercent: 81,
        lastLoggedWeek: 12,
        status: 'ON_TRACK',
        latestTopic: 'File Operations, Exception Handling and Module Imports',
      },
      {
        section: '1st Year SEC-F',
        facultyName: 'Mrs. Jasline',
        plannedPeriods: 45,
        actualPeriods: 44,
        coveragePercent: 87,
        lastLoggedWeek: 12,
        status: 'AHEAD',
        latestTopic: 'Data Visualization using Matplotlib & NumPy Arrays',
      },
      {
        section: '1st Year SEC-G',
        facultyName: 'Mrs. R.Sumathi',
        plannedPeriods: 45,
        actualPeriods: 38,
        coveragePercent: 75,
        lastLoggedWeek: 11,
        status: 'LAGGING',
        latestTopic: 'Recursive Functions and String Formatting Methods',
      },
    ],
  },
];

export const SubjectReportsScreen = () => {
  const { user } = useAuthStore();
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>('subj_1');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const filteredReports = SAMPLE_SUBJECT_REPORTS.filter((item) => {
    const matchesYear = selectedYear === 'ALL' || item.year === selectedYear;
    const matchesQuery =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesQuery;
  });

  const getPaceStatusBadge = (status: SubjectSectionAudit['status']) => {
    switch (status) {
      case 'AHEAD':
        return { bg: '#DCFCE7', text: '#15803D', label: 'Ahead of Pace' };
      case 'ON_TRACK':
        return { bg: '#DBEAFE', text: '#1D4ED8', label: 'On Track' };
      case 'LAGGING':
        return { bg: '#FEE2E2', text: '#B91C1C', label: 'Lagging Behind' };
    }
  };

  return (
    <View style={styles.container}>
      {/* ── HEADER SEARCH & CONTROLS ── */}
      <View style={styles.headerBlock}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#64748B" />
          <RNTextInput
            style={styles.searchInput}
            placeholder="Search subject code or name..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color="#64748B" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Year Selector Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll}>
          {['ALL', '1st Year', '2nd Year', '3rd Year', '4th Year'].map((year) => (
            <Chip
              key={year}
              selected={selectedYear === year}
              onPress={() => setSelectedYear(year)}
              style={[styles.yearChip, selectedYear === year && styles.yearChipActive]}
              textStyle={[styles.yearChipText, selectedYear === year && styles.yearChipTextActive]}
            >
              {year === 'ALL' ? 'All Years' : year}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* ── SUBJECT AUDIT LIST ── */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Palette.primary]} />}
      >
        <View style={styles.summaryStatsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{filteredReports.length}</Text>
            <Text style={styles.statLbl}>Monitored Subjects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: Palette.primary }]}>
              {Math.round(
                filteredReports.reduce((acc, s) => acc + s.overallCoverage, 0) / (filteredReports.length || 1)
              )}
              %
            </Text>
            <Text style={styles.statLbl}>Avg Syllabus Pace</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: '#DC2626' }]}>
              {filteredReports.reduce(
                (acc, s) => acc + s.sections.filter((sec) => sec.status === 'LAGGING').length,
                0
              )}
            </Text>
            <Text style={styles.statLbl}>Lagging Sections</Text>
          </View>
        </View>

        {filteredReports.map((subject) => {
          const isExpanded = expandedSubjectId === subject.id;
          return (
            <Card key={subject.id} style={styles.subjectCard}>
              <TouchableOpacity
                onPress={() => setExpandedSubjectId(isExpanded ? null : subject.id)}
                activeOpacity={0.7}
              >
                <Card.Content style={styles.cardHeaderContent}>
                  <View style={styles.topInfoRow}>
                    <View style={styles.codePill}>
                      <Text style={styles.codeText}>{subject.code}</Text>
                    </View>
                    <View style={styles.yearPill}>
                      <Text style={styles.yearText}>{subject.year}</Text>
                    </View>
                    <View style={{ flex: 1 }} />
                    <Feather
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#64748B"
                    />
                  </View>

                  <Text style={styles.subjectTitle}>{subject.title}</Text>

                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Average Multi-Section Coverage</Text>
                    <Text style={styles.progressPercent}>{subject.overallCoverage}%</Text>
                  </View>
                  <ProgressBar
                    progress={subject.overallCoverage / 100}
                    color={subject.overallCoverage >= 85 ? Palette.primary : '#F59E0B'}
                    style={styles.progressBar}
                  />

                  <View style={styles.sectionsMetaRow}>
                    <Text style={styles.sectionsMetaText}>
                      {subject.sections.length} Sections Active • Total Periods: {subject.totalActualPeriods}/
                      {subject.totalPlannedPeriods}
                    </Text>
                  </View>
                </Card.Content>
              </TouchableOpacity>

              {/* ── EXPANDED CROSS-SECTION DETAILS ── */}
              {isExpanded && (
                <View style={styles.expandedSectionBlock}>
                  <View style={styles.divider} />
                  <Text style={styles.sectionHeaderTitle}>Cross-Section Sectional Breakdown</Text>

                  {subject.sections.map((sec, idx) => {
                    const statusConfig = getPaceStatusBadge(sec.status);
                    return (
                      <View key={idx} style={styles.sectionDetailCard}>
                        <View style={styles.secTopRow}>
                          <View>
                            <Text style={styles.secClassTitle}>{sec.section}</Text>
                            <Text style={styles.secFacultyName}>Faculty: {sec.facultyName}</Text>
                          </View>
                          <View style={[styles.paceBadge, { backgroundColor: statusConfig.bg }]}>
                            <Text style={[styles.paceBadgeText, { color: statusConfig.text }]}>
                              {statusConfig.label}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.secStatsRow}>
                          <Text style={styles.secPeriodInfo}>
                            Periods: <Text style={styles.boldPeriod}>{sec.actualPeriods}</Text>/{sec.plannedPeriods}
                          </Text>
                          <Text style={styles.secCoverageVal}>{sec.coveragePercent}% Completed</Text>
                        </View>

                        <ProgressBar
                          progress={sec.coveragePercent / 100}
                          color={sec.status === 'LAGGING' ? '#EF4444' : Palette.primary}
                          style={styles.secProgress}
                        />

                        <View style={styles.topicBox}>
                          <Text style={styles.topicLabel}>Latest Logged Topic (Week {sec.lastLoggedWeek}):</Text>
                          <Text style={styles.topicText}>{sec.latestTopic}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBlock: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: ms(16),
    paddingTop: ms(14),
    paddingBottom: ms(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: ms(12),
    paddingHorizontal: ms(12),
    height: ms(42),
    marginBottom: ms(10),
  },
  searchInput: {
    flex: 1,
    marginLeft: ms(8),
    fontSize: ms(14),
    color: Palette.textDark,
  },
  yearScroll: {
    flexDirection: 'row',
  },
  yearChip: {
    marginRight: ms(8),
    backgroundColor: '#F8FAFC',
    borderRadius: ms(8),
  },
  yearChipActive: {
    backgroundColor: Palette.primary,
  },
  yearChipText: {
    fontSize: ms(12),
    fontWeight: '600',
    color: '#64748B',
  },
  yearChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    padding: ms(16),
    paddingBottom: ms(40),
  },
  summaryStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    paddingVertical: ms(12),
    paddingHorizontal: ms(16),
    marginBottom: ms(14),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    fontSize: ms(18),
    fontWeight: '900',
    color: Palette.textDark,
  },
  statLbl: {
    fontSize: ms(11),
    fontWeight: '600',
    color: Palette.textLight,
    marginTop: ms(2),
  },
  statDivider: {
    width: 1,
    height: ms(24),
    backgroundColor: '#E2E8F0',
  },
  subjectCard: {
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
    overflow: 'hidden',
  },
  cardHeaderContent: {
    padding: ms(16),
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ms(6),
  },
  codePill: {
    backgroundColor: '#EFF6FF',
    borderRadius: ms(6),
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    marginRight: ms(8),
  },
  codeText: {
    fontSize: ms(12),
    fontWeight: '800',
    color: '#1D4ED8',
  },
  yearPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: ms(6),
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
  },
  yearText: {
    fontSize: ms(11),
    fontWeight: '700',
    color: '#64748B',
  },
  subjectTitle: {
    fontSize: ms(16),
    fontWeight: '800',
    color: Palette.textDark,
    marginBottom: ms(10),
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ms(4),
  },
  progressLabel: {
    fontSize: ms(11),
    fontWeight: '600',
    color: '#64748B',
  },
  progressPercent: {
    fontSize: ms(13),
    fontWeight: '800',
    color: Palette.textDark,
  },
  progressBar: {
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: '#E2E8F0',
    marginBottom: ms(8),
  },
  sectionsMetaText: {
    fontSize: ms(12),
    color: Palette.textLight,
    fontWeight: '500',
  },
  expandedSectionBlock: {
    backgroundColor: '#F8FAFC',
    padding: ms(16),
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: ms(12),
  },
  sectionHeaderTitle: {
    fontSize: ms(13),
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: ms(10),
  },
  sectionDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(12),
    padding: ms(12),
    marginBottom: ms(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ms(8),
  },
  secClassTitle: {
    fontSize: ms(14),
    fontWeight: '800',
    color: Palette.textDark,
  },
  secFacultyName: {
    fontSize: ms(12),
    color: '#64748B',
    fontWeight: '600',
    marginTop: ms(1),
  },
  paceBadge: {
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(6),
  },
  paceBadgeText: {
    fontSize: ms(10),
    fontWeight: '700',
  },
  secStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ms(4),
  },
  secPeriodInfo: {
    fontSize: ms(12),
    color: '#64748B',
  },
  boldPeriod: {
    fontWeight: '800',
    color: Palette.textDark,
  },
  secCoverageVal: {
    fontSize: ms(12),
    fontWeight: '800',
    color: Palette.primary,
  },
  secProgress: {
    height: ms(5),
    borderRadius: ms(2),
    backgroundColor: '#F1F5F9',
    marginBottom: ms(8),
  },
  topicBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: ms(8),
    padding: ms(8),
  },
  topicLabel: {
    fontSize: ms(10),
    fontWeight: '700',
    color: '#64748B',
    marginBottom: ms(2),
  },
  topicText: {
    fontSize: ms(12),
    color: Palette.textDark,
    lineHeight: ms(16),
  },
});

export default SubjectReportsScreen;
