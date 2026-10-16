import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl, TextInput as RNTextInput, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  DayRibbonColors,
  DayRibbonFonts,
  DayRibbonShapes,
  DayRibbonSpacing,
} from '@theme/dayRibbon';
import { ProgressBar } from '@components/editorial/ProgressBar';
import { ms } from '@theme/responsive';

interface FacultyMetric {
  id: string;
  name: string;
  department: string;
  designation: string;
  assignedSubjects: { code: string; name: string; section: string; coverage: number }[];
  avgCoverage: number;
  punctualityScore: number;
  onTimeSubmissions: number;
  totalSubmissions: number;
  extraHoursTaken: number;
  status: 'EXEMPLARY' | 'ON_TRACK' | 'ATTENTION';
}

const FACULTY_DATA: FacultyMetric[] = [
  {
    id: 'fac_1',
    name: 'Ms. Punitha EM',
    department: 'CSE',
    designation: 'Assistant Professor',
    assignedSubjects: [
      { code: 'CS3591', name: 'Computer Networks', section: '3rd Year CSE-A', coverage: 88 },
      { code: 'CS3391', name: 'Object Oriented Programming', section: '2nd Year CSE-A', coverage: 86 },
    ],
    avgCoverage: 87,
    punctualityScore: 100,
    onTimeSubmissions: 12,
    totalSubmissions: 12,
    extraHoursTaken: 2,
    status: 'EXEMPLARY',
  },
  {
    id: 'fac_2',
    name: 'Mr. S Faizal Mukthar Hussain',
    department: 'CSE',
    designation: 'Assistant Professor (Sr. Gr)',
    assignedSubjects: [
      { code: 'CS3551', name: 'Distributed Computing', section: '4th Year CSE-A', coverage: 92 },
      { code: 'CS8501', name: 'Theory of Computation', section: '3rd Year CSE-B', coverage: 90 },
    ],
    avgCoverage: 91,
    punctualityScore: 100,
    onTimeSubmissions: 12,
    totalSubmissions: 12,
    extraHoursTaken: 4,
    status: 'EXEMPLARY',
  },
  {
    id: 'fac_3',
    name: 'Mrs. Jasline',
    department: 'CSE / 1st Year',
    designation: 'Assistant Professor',
    assignedSubjects: [
      { code: 'GE3151', name: 'Problem Solving & Python', section: '1st Year SEC-F', coverage: 87 },
      { code: 'GE3171', name: 'Python Laboratory', section: '1st Year SEC-F', coverage: 89 },
    ],
    avgCoverage: 88,
    punctualityScore: 92,
    onTimeSubmissions: 11,
    totalSubmissions: 12,
    extraHoursTaken: 1,
    status: 'ON_TRACK',
  },
  {
    id: 'fac_4',
    name: 'Ms. E Uva Shakthi',
    department: 'CSE',
    designation: 'Assistant Professor',
    assignedSubjects: [
      { code: 'CS3591', name: 'Computer Networks', section: '3rd Year CSE-B', coverage: 84 },
      { code: 'CS3492', name: 'Database Systems', section: '2nd Year CSE-B', coverage: 82 },
    ],
    avgCoverage: 83,
    punctualityScore: 92,
    onTimeSubmissions: 11,
    totalSubmissions: 12,
    extraHoursTaken: 3,
    status: 'ON_TRACK',
  },
  {
    id: 'fac_5',
    name: 'Mrs. Gopikha',
    department: 'Chemistry / 1st Year',
    designation: 'Assistant Professor',
    assignedSubjects: [
      { code: 'CY3151', name: 'Engineering Chemistry', section: '1st Year SEC-C', coverage: 71 },
      { code: 'BS3171', name: 'Physics & Chemistry Lab', section: '1st Year SEC-C', coverage: 75 },
    ],
    avgCoverage: 73,
    punctualityScore: 75,
    onTimeSubmissions: 9,
    totalSubmissions: 12,
    extraHoursTaken: 1,
    status: 'ATTENTION',
  },
  {
    id: 'fac_6',
    name: 'Dr. Karuppaiya',
    department: 'Chemistry / 1st Year',
    designation: 'Associate Professor & CC',
    assignedSubjects: [
      { code: 'CY3151', name: 'Engineering Chemistry', section: '1st Year SEC-A', coverage: 80 },
    ],
    avgCoverage: 80,
    punctualityScore: 100,
    onTimeSubmissions: 12,
    totalSubmissions: 12,
    extraHoursTaken: 0,
    status: 'ON_TRACK',
  },
  {
    id: 'fac_7',
    name: 'Mrs. Archana',
    department: 'CSE',
    designation: 'Assistant Professor',
    assignedSubjects: [
      { code: 'CS3492', name: 'Database Systems', section: '2nd Year CSE-B', coverage: 79 },
    ],
    avgCoverage: 79,
    punctualityScore: 83,
    onTimeSubmissions: 10,
    totalSubmissions: 12,
    extraHoursTaken: 2,
    status: 'ON_TRACK',
  },
];

export const FacultyAnalyticsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EXEMPLARY' | 'ON_TRACK' | 'ATTENTION'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const filteredFaculty = FACULTY_DATA.filter((fac) => {
    const matchesFilter = statusFilter === 'ALL' || fac.status === statusFilter;
    const matchesQuery =
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.assignedSubjects.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesQuery;
  });

  const getStatusLabel = (status: FacultyMetric['status']) => {
    switch (status) {
      case 'EXEMPLARY':
        return 'Exemplary';
      case 'ON_TRACK':
        return 'On Schedule';
      case 'ATTENTION':
        return 'Pace Delay';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={DayRibbonColors.cobalt}
            colors={[DayRibbonColors.cobalt]}
          />
        }
      >
        {/* ── HEADER ── */}
        <View style={styles.headerBox}>
          <Text style={styles.captionText}>FACULTY PERFORMANCE</Text>
          <Text style={styles.headingText}>Faculty Audit</Text>
          <Text style={styles.subHeadingText}>
            Punctuality, logging velocity & syllabus delivery
          </Text>
        </View>

        {/* ── KPI ROW ── */}
        <View style={styles.kpiBox}>
          <View style={styles.kpiCell}>
            <Text style={styles.kpiNum}>{FACULTY_DATA.length}</Text>
            <Text style={styles.kpiLbl}>Audited</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiCell}>
            <Text style={[styles.kpiNum, { color: DayRibbonColors.cobalt }]}>94.2%</Text>
            <Text style={styles.kpiLbl}>Avg Punctuality</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiCell}>
            <Text style={styles.kpiNum}>85%</Text>
            <Text style={styles.kpiLbl}>Avg Completion</Text>
          </View>
        </View>

        {/* ── SEARCH BAR ── */}
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={DayRibbonColors.muted} />
          <RNTextInput
            style={styles.searchInput}
            placeholder="Search faculty name, course or dept..."
            placeholderTextColor={DayRibbonColors.mutedSoft}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Clear search">
              <Feather name="x" size={16} color={DayRibbonColors.muted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ── STATUS FILTER CHIPS ── */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {[
              { id: 'ALL', label: `All (${FACULTY_DATA.length})` },
              { id: 'EXEMPLARY', label: 'Exemplary' },
              { id: 'ON_TRACK', label: 'On Schedule' },
              { id: 'ATTENTION', label: 'Requires Attention' },
            ].map((item) => {
              const isSelected = statusFilter === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setStatusFilter(item.id as any)}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── SECTION HEADER ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Faculty Dossiers</Text>
          <Text style={styles.sectionCountText}>{filteredFaculty.length} INSTRUCTORS</Text>
        </View>

        {/* ── FACULTY CARDS ── */}
        {filteredFaculty.map((fac) => {
          const isAttention = fac.status === 'ATTENTION';
          const initials = fac.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();

          return (
            <View key={fac.id} style={styles.card}>
              {/* Header: Avatar, Name, Designation & Status */}
              <View style={styles.cardHeader}>
                <View style={styles.profileRow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <View style={styles.profileText}>
                    <Text style={styles.facultyName}>{fac.name}</Text>
                    <Text style={styles.designationText}>
                      {fac.designation} · {fac.department}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    isAttention ? styles.statusBadgeAttention : styles.statusBadgeNormal,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isAttention ? styles.statusBadgeTextAttention : styles.statusBadgeTextNormal,
                    ]}
                  >
                    {getStatusLabel(fac.status)}
                  </Text>
                </View>
              </View>

              {/* Performance Progress */}
              <View style={styles.coverageRow}>
                <Text style={styles.coverageLabel}>Average Syllabus Pace</Text>
                <Text style={[styles.coveragePercent, isAttention && { color: DayRibbonColors.warn }]}>
                  {fac.avgCoverage}%
                </Text>
              </View>
              <View style={{ marginBottom: ms(12) }}>
                <ProgressBar
                  percent={fac.avgCoverage}
                  isBehind={isAttention}
                />
              </View>

              {/* Punctuality and Extra Hours Metrics */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricItemVal}>{fac.punctualityScore}%</Text>
                  <Text style={styles.metricItemLbl}>Punctuality</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricItemVal}>
                    {fac.onTimeSubmissions}/{fac.totalSubmissions}
                  </Text>
                  <Text style={styles.metricItemLbl}>On-Time Logs</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricItemVal}>{fac.extraHoursTaken} hrs</Text>
                  <Text style={styles.metricItemLbl}>Extra Slots</Text>
                </View>
              </View>

              {/* Handled Subjects */}
              <View style={styles.subjectsContainer}>
                <Text style={styles.subjectsTitle}>Assigned Subjects & Pace</Text>
                {fac.assignedSubjects.map((subj, idx) => (
                  <View key={idx} style={styles.subjectRow}>
                    <View style={styles.subjCodeBadge}>
                      <Text style={styles.subjCodeText}>{subj.code}</Text>
                    </View>
                    <View style={styles.subjInfo}>
                      <Text style={styles.subjName} numberOfLines={1}>
                        {subj.name}
                      </Text>
                      <Text style={styles.subjSection}>{subj.section}</Text>
                    </View>
                    <Text style={[styles.subjCoverageText, subj.coverage < 75 && { color: DayRibbonColors.warn }]}>
                      {subj.coverage}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
    paddingTop: DayRibbonSpacing.screenTop,
    paddingBottom: ms(48),
  },
  headerBox: {
    marginBottom: ms(16),
  },
  captionText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headingText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(26),
    color: DayRibbonColors.ink,
    marginTop: ms(4),
  },
  subHeadingText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    color: DayRibbonColors.muted,
    marginTop: ms(4),
  },
  kpiBox: {
    flexDirection: 'row',
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusCard,
    paddingVertical: ms(12),
    paddingHorizontal: ms(14),
    marginBottom: ms(16),
  },
  kpiCell: {
    flex: 1,
    alignItems: 'center',
  },
  kpiDivider: {
    width: 1,
    backgroundColor: DayRibbonColors.line,
  },
  kpiLbl: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(10),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    marginTop: ms(2),
  },
  kpiNum: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(20),
    color: DayRibbonColors.ink,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusButton,
    paddingHorizontal: ms(14),
    height: 48,
    marginBottom: ms(14),
  },
  searchInput: {
    flex: 1,
    marginLeft: ms(8),
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(13),
    color: DayRibbonColors.ink,
  },
  filterSection: {
    marginBottom: ms(16),
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingVertical: ms(8),
    paddingHorizontal: ms(14),
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.radiusChip,
    marginRight: ms(8),
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: DayRibbonColors.ink,
    borderColor: DayRibbonColors.ink,
  },
  filterChipText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(11),
    color: DayRibbonColors.ink,
  },
  filterChipTextActive: {
    color: DayRibbonColors.surface,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(12),
  },
  sectionHeading: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(14),
    color: DayRibbonColors.ink,
  },
  sectionCountText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusCard,
    padding: ms(16),
    marginBottom: ms(12),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(10),
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.72,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(10),
  },
  avatarText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(13),
    color: DayRibbonColors.cobalt,
  },
  profileText: {
    flex: 1,
  },
  facultyName: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(14),
    color: DayRibbonColors.ink,
  },
  designationText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    marginTop: ms(1),
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: DayRibbonShapes.radiusChip,
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
  },
  statusBadgeNormal: {
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.bg,
  },
  statusBadgeAttention: {
    borderColor: DayRibbonColors.warn,
    backgroundColor: DayRibbonColors.warnBg,
  },
  statusBadgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(9.5),
    letterSpacing: 0.5,
  },
  statusBadgeTextNormal: {
    color: DayRibbonColors.muted,
  },
  statusBadgeTextAttention: {
    color: DayRibbonColors.warn,
  },
  coverageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(4),
  },
  coverageLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
  },
  coveragePercent: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(16),
    color: DayRibbonColors.cobalt,
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: DayRibbonColors.bg,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusButton,
    paddingVertical: ms(8),
    paddingHorizontal: ms(10),
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(12),
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricItemVal: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(13),
    color: DayRibbonColors.ink,
  },
  metricItemLbl: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(9),
    color: DayRibbonColors.muted,
    marginTop: ms(2),
  },
  metricDivider: {
    width: 1,
    height: ms(18),
    backgroundColor: DayRibbonColors.line,
  },
  subjectsContainer: {
    borderTopWidth: 1,
    borderTopColor: DayRibbonColors.line,
    paddingTop: ms(10),
  },
  subjectsTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(10),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: ms(6),
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ms(4),
  },
  subjCodeBadge: {
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusChip,
    paddingHorizontal: ms(6),
    paddingVertical: ms(2),
    backgroundColor: DayRibbonColors.bg,
    marginRight: ms(8),
  },
  subjCodeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(10),
    color: DayRibbonColors.cobalt,
  },
  subjInfo: {
    flex: 1,
  },
  subjName: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(12),
    color: DayRibbonColors.ink,
  },
  subjSection: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(10),
    color: DayRibbonColors.muted,
  },
  subjCoverageText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(13),
    color: DayRibbonColors.cobalt,
  },
});

export default FacultyAnalyticsScreen;
