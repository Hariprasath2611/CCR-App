import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl, TextInput as RNTextInput, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  EditorialColors,
  EditorialFonts,
  EditorialSpacing,
} from '@theme/editorial';
import {
  EditorialHeader,
  Rule,
  Label,
  SegBar,
} from '@components/editorial';

interface FacultyMetric {
  id: string;
  name: string;
  department: string;
  designation: string;
  assignedSubjects: { code: string; name: string; section: string; coverage: number }[];
  avgCoverage: number;
  punctualityScore: number; // percentage
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
        return 'EXEMPLARY';
      case 'ON_TRACK':
        return 'ON SCHEDULE';
      case 'ATTENTION':
        return 'PACE DELAY';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={EditorialColors.ink}
            colors={[EditorialColors.ink]}
          />
        }
      >
        <EditorialHeader
          eyebrow="FACULTY PERFORMANCE"
          title="FACULTY AUDIT"
          subtitle="Punctuality, logging velocity & syllabus delivery"
        />

        {/* ── KPI ROW ── */}
        <View style={styles.kpiBox}>
          <View style={styles.kpiCell}>
            <Text style={styles.kpiLbl}>AUDITED</Text>
            <Text style={styles.kpiNum}>{FACULTY_DATA.length}</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiCell}>
            <Text style={styles.kpiLbl}>AVG PUNCTUALITY</Text>
            <Text style={styles.kpiNum}>94.2%</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiCell}>
            <Text style={styles.kpiLbl}>AVG COMPLETION</Text>
            <Text style={styles.kpiNum}>85%</Text>
          </View>
        </View>

        {/* ── SEARCH BAR ── */}
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={EditorialColors.ink} />
          <RNTextInput
            style={styles.searchInput}
            placeholder="Search faculty name, course or dept..."
            placeholderTextColor={EditorialColors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color={EditorialColors.ink} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ── STATUS FILTER CHIPS ── */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {[
              { id: 'ALL', label: `ALL (${FACULTY_DATA.length})` },
              { id: 'EXEMPLARY', label: 'EXEMPLARY' },
              { id: 'ON_TRACK', label: 'ON SCHEDULE' },
              { id: 'ATTENTION', label: 'REQUIRES ATTENTION' },
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
          <Label text="FACULTY DOSSIERS" variant="dark" />
          <Text style={styles.sectionCountText}>{filteredFaculty.length} INSTRUCTORS</Text>
        </View>
        <Rule thickness={4} color={EditorialColors.ink} style={{ marginBottom: EditorialSpacing.md }} />

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
                  <View style={styles.avatarSquare}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <View style={styles.profileText}>
                    <Text style={styles.facultyName}>{fac.name}</Text>
                    <Text style={styles.designationText}>
                      {fac.designation.toUpperCase()} · {fac.department.toUpperCase()}
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
                <Text style={styles.coverageLabel}>AVERAGE SYLLABUS PACE</Text>
                <Text style={[styles.coveragePercent, isAttention && { color: EditorialColors.accent }]}>
                  {fac.avgCoverage}%
                </Text>
              </View>
              <View style={{ marginBottom: EditorialSpacing.md }}>
                <SegBar
                  value={fac.avgCoverage}
                  max={100}
                  segments={8}
                  color={isAttention ? EditorialColors.accent : EditorialColors.ink}
                />
              </View>

              {/* Punctuality and Extra Hours Metrics */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricItemVal}>{fac.punctualityScore}%</Text>
                  <Text style={styles.metricItemLbl}>PUNCTUALITY</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricItemVal}>
                    {fac.onTimeSubmissions}/{fac.totalSubmissions}
                  </Text>
                  <Text style={styles.metricItemLbl}>ON-TIME LOGS</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricItemVal}>{fac.extraHoursTaken} HRS</Text>
                  <Text style={styles.metricItemLbl}>EXTRA SLOTS</Text>
                </View>
              </View>

              {/* Handled Subjects */}
              <View style={styles.subjectsContainer}>
                <Text style={styles.subjectsTitle}>ASSIGNED SUBJECTS & PACE</Text>
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
                    <Text style={[styles.subjCoverageText, subj.coverage < 75 && { color: EditorialColors.accent }]}>
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
    backgroundColor: EditorialColors.bg,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    padding: EditorialSpacing.lg,
    paddingBottom: EditorialSpacing.xxxl,
  },
  kpiBox: {
    flexDirection: 'row',
    backgroundColor: EditorialColors.white,
    borderWidth: 2,
    borderColor: EditorialColors.ink,
    borderRadius: 0,
    paddingVertical: EditorialSpacing.md,
    paddingHorizontal: EditorialSpacing.md,
    marginBottom: EditorialSpacing.lg,
  },
  kpiCell: {
    flex: 1,
    alignItems: 'center',
  },
  kpiDivider: {
    width: 1,
    backgroundColor: EditorialColors.track,
  },
  kpiLbl: {
    fontFamily: EditorialFonts.bold,
    fontSize: 9,
    color: EditorialColors.muted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  kpiNum: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 18,
    color: EditorialColors.ink,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EditorialColors.white,
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingHorizontal: EditorialSpacing.md,
    height: 48,
    marginBottom: EditorialSpacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: EditorialSpacing.sm,
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    color: EditorialColors.ink,
  },
  filterSection: {
    marginBottom: EditorialSpacing.xl,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: EditorialColors.track,
    backgroundColor: EditorialColors.white,
    marginRight: EditorialSpacing.sm,
  },
  filterChipActive: {
    backgroundColor: EditorialColors.ink,
    borderColor: EditorialColors.ink,
  },
  filterChipText: {
    fontFamily: EditorialFonts.bold,
    fontSize: 10,
    color: EditorialColors.ink,
    letterSpacing: 0.5,
  },
  filterChipTextActive: {
    color: EditorialColors.white,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionCountText: {
    fontFamily: EditorialFonts.bold,
    fontSize: 11,
    color: EditorialColors.muted,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: EditorialColors.white,
    borderWidth: 1,
    borderColor: EditorialColors.track,
    borderRadius: 0,
    padding: EditorialSpacing.md,
    marginBottom: EditorialSpacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: EditorialSpacing.sm,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.72,
  },
  avatarSquare: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    backgroundColor: EditorialColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: EditorialSpacing.sm,
  },
  avatarText: {
    fontFamily: EditorialFonts.bold,
    fontSize: 14,
    color: EditorialColors.ink,
  },
  profileText: {
    flex: 1,
  },
  facultyName: {
    fontFamily: EditorialFonts.bold,
    fontSize: 14,
    color: EditorialColors.ink,
  },
  designationText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 10,
    color: EditorialColors.muted,
    marginTop: 2,
    letterSpacing: 0.4,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  statusBadgeNormal: {
    borderColor: EditorialColors.ink,
    backgroundColor: EditorialColors.white,
  },
  statusBadgeAttention: {
    borderColor: EditorialColors.accent,
    backgroundColor: EditorialColors.white,
  },
  statusBadgeText: {
    fontFamily: EditorialFonts.bold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  statusBadgeTextNormal: {
    color: EditorialColors.ink,
  },
  statusBadgeTextAttention: {
    color: EditorialColors.accent,
  },
  coverageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  coverageLabel: {
    fontFamily: EditorialFonts.bold,
    fontSize: 10,
    color: EditorialColors.muted,
    letterSpacing: 0.6,
  },
  coveragePercent: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 14,
    color: EditorialColors.ink,
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: EditorialColors.bg,
    borderWidth: 1,
    borderColor: EditorialColors.track,
    paddingVertical: 6,
    paddingHorizontal: EditorialSpacing.sm,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: EditorialSpacing.md,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricItemVal: {
    fontFamily: EditorialFonts.bold,
    fontSize: 12,
    color: EditorialColors.ink,
  },
  metricItemLbl: {
    fontFamily: EditorialFonts.bold,
    fontSize: 8,
    color: EditorialColors.muted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 18,
    backgroundColor: EditorialColors.track,
  },
  subjectsContainer: {
    borderTopWidth: 1,
    borderTopColor: EditorialColors.track,
    paddingTop: EditorialSpacing.sm,
  },
  subjectsTitle: {
    fontFamily: EditorialFonts.bold,
    fontSize: 9,
    color: EditorialColors.muted,
    letterSpacing: 0.8,
    marginBottom: EditorialSpacing.xs,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  subjCodeBadge: {
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: EditorialColors.white,
    marginRight: 6,
  },
  subjCodeText: {
    fontFamily: EditorialFonts.bold,
    fontSize: 9,
    color: EditorialColors.ink,
  },
  subjInfo: {
    flex: 1,
  },
  subjName: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 11,
    color: EditorialColors.ink,
  },
  subjSection: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 9,
    color: EditorialColors.muted,
  },
  subjCoverageText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    color: EditorialColors.ink,
  },
});

export default FacultyAnalyticsScreen;
