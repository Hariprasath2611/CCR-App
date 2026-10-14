import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl, TextInput as RNTextInput } from 'react-native';
import { Text, Card, Avatar, ProgressBar, Chip, Badge } from 'react-native-paper';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ms } from '@theme/responsive';

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

  const getStatusBadge = (status: FacultyMetric['status']) => {
    switch (status) {
      case 'EXEMPLARY':
        return { bg: '#DCFCE7', text: '#15803D', label: 'Exemplary Compliance' };
      case 'ON_TRACK':
        return { bg: '#DBEAFE', text: '#1D4ED8', label: 'On Schedule' };
      case 'ATTENTION':
        return { bg: '#FEE2E2', text: '#B91C1C', label: 'Pace Delay Review' };
    }
  };

  return (
    <View style={styles.container}>
      {/* ── TOP SEARCH & STATS HEADER ── */}
      <View style={styles.headerBlock}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#64748B" />
          <RNTextInput
            style={styles.searchInput}
            placeholder="Search faculty name, course or dept..."
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

        {/* Status Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {[
            { id: 'ALL', label: `All Faculty (${FACULTY_DATA.length})` },
            { id: 'EXEMPLARY', label: 'Exemplary (100% Punctual)' },
            { id: 'ON_TRACK', label: 'On Schedule' },
            { id: 'ATTENTION', label: 'Requires Attention' },
          ].map((item) => (
            <Chip
              key={item.id}
              selected={statusFilter === item.id}
              onPress={() => setStatusFilter(item.id as any)}
              style={[styles.chip, statusFilter === item.id && styles.chipActive]}
              textStyle={[styles.chipText, statusFilter === item.id && styles.chipTextActive]}
            >
              {item.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* ── FACULTY METRIC CARDS ── */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Palette.primary]} />}
      >
        {/* KPI Mini Header */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiNum}>{FACULTY_DATA.length}</Text>
            <Text style={styles.kpiLbl}>Faculty Audited</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiBox}>
            <Text style={[styles.kpiNum, { color: Palette.primary }]}>94.2%</Text>
            <Text style={styles.kpiLbl}>Avg Punctuality</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiBox}>
            <Text style={[styles.kpiNum, { color: '#16A34A' }]}>85%</Text>
            <Text style={styles.kpiLbl}>Avg Completion</Text>
          </View>
        </View>

        {filteredFaculty.map((fac) => {
          const statusInfo = getStatusBadge(fac.status);
          const initials = fac.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();

          return (
            <Card key={fac.id} style={styles.card}>
              <Card.Content style={styles.cardContent}>
                {/* Header: Avatar, Name, Designation & Status */}
                <View style={styles.topRow}>
                  <View style={styles.profileRow}>
                    <Avatar.Text size={44} label={initials} style={styles.avatar} labelStyle={styles.avatarLabel} />
                    <View style={styles.profileText}>
                      <Text style={styles.facultyName}>{fac.name}</Text>
                      <Text style={styles.designationText}>
                        {fac.designation} • {fac.department}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
                  </View>
                </View>

                {/* Performance Progress */}
                <View style={styles.coverageRow}>
                  <Text style={styles.coverageLabel}>Average Syllabus Pace</Text>
                  <Text style={styles.coveragePercent}>{fac.avgCoverage}%</Text>
                </View>
                <ProgressBar
                  progress={fac.avgCoverage / 100}
                  color={fac.avgCoverage >= 85 ? Palette.primary : fac.avgCoverage >= 75 ? '#F59E0B' : '#EF4444'}
                  style={styles.progressBar}
                />

                {/* Punctuality and Extra Hours Metrics */}
                <View style={styles.metricsGrid}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricItemVal}>{fac.punctualityScore}%</Text>
                    <Text style={styles.metricItemLbl}>Submission Punctuality</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricItemVal}>
                      {fac.onTimeSubmissions}/{fac.totalSubmissions}
                    </Text>
                    <Text style={styles.metricItemLbl}>On-Time Weekly Logs</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricItemVal}>{fac.extraHoursTaken} hrs</Text>
                    <Text style={styles.metricItemLbl}>Extra Slots Logged</Text>
                  </View>
                </View>

                {/* Handled Subjects */}
                <View style={styles.subjectsContainer}>
                  <Text style={styles.subjectsTitle}>Assigned Subjects & Class Pace:</Text>
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
                      <Text style={styles.subjCoverageText}>{subj.coverage}%</Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
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
  chipsScroll: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: ms(8),
    backgroundColor: '#F8FAFC',
    borderRadius: ms(8),
  },
  chipActive: {
    backgroundColor: Palette.primary,
  },
  chipText: {
    fontSize: ms(12),
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
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
  kpiRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    paddingVertical: ms(12),
    paddingHorizontal: ms(16),
    marginBottom: ms(14),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  kpiBox: {
    alignItems: 'center',
    flex: 1,
  },
  kpiNum: {
    fontSize: ms(18),
    fontWeight: '900',
    color: Palette.textDark,
  },
  kpiLbl: {
    fontSize: ms(11),
    fontWeight: '600',
    color: Palette.textLight,
    marginTop: ms(2),
  },
  kpiDivider: {
    width: 1,
    height: ms(24),
    backgroundColor: '#E2E8F0',
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
    padding: ms(14),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(12),
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.7,
  },
  avatar: {
    backgroundColor: Palette.primary,
  },
  avatarLabel: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileText: {
    marginLeft: ms(10),
    flex: 1,
  },
  facultyName: {
    fontSize: ms(15),
    fontWeight: '800',
    color: Palette.textDark,
  },
  designationText: {
    fontSize: ms(11),
    color: Palette.textLight,
    marginTop: ms(1),
  },
  statusBadge: {
    paddingHorizontal: ms(8),
    paddingVertical: ms(4),
    borderRadius: ms(6),
  },
  statusBadgeText: {
    fontSize: ms(10),
    fontWeight: '700',
  },
  coverageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ms(4),
  },
  coverageLabel: {
    fontSize: ms(11),
    fontWeight: '600',
    color: '#64748B',
  },
  coveragePercent: {
    fontSize: ms(12),
    fontWeight: '800',
    color: Palette.textDark,
  },
  progressBar: {
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: '#E2E8F0',
    marginBottom: ms(12),
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: ms(10),
    paddingVertical: ms(8),
    paddingHorizontal: ms(8),
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: ms(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricItemVal: {
    fontSize: ms(13),
    fontWeight: '800',
    color: Palette.textDark,
  },
  metricItemLbl: {
    fontSize: ms(10),
    color: '#64748B',
    fontWeight: '600',
    marginTop: ms(1),
  },
  metricDivider: {
    width: 1,
    height: ms(20),
    backgroundColor: '#CBD5E1',
  },
  subjectsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: ms(10),
  },
  subjectsTitle: {
    fontSize: ms(11),
    fontWeight: '700',
    color: '#64748B',
    marginBottom: ms(6),
    textTransform: 'uppercase',
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ms(4),
  },
  subjCodeBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: ms(4),
    paddingHorizontal: ms(6),
    paddingVertical: ms(2),
    marginRight: ms(8),
  },
  subjCodeText: {
    fontSize: ms(10),
    fontWeight: '800',
    color: '#1D4ED8',
  },
  subjInfo: {
    flex: 1,
  },
  subjName: {
    fontSize: ms(12),
    fontWeight: '700',
    color: Palette.textDark,
  },
  subjSection: {
    fontSize: ms(10),
    color: '#64748B',
  },
  subjCoverageText: {
    fontSize: ms(12),
    fontWeight: '800',
    color: Palette.primary,
    marginLeft: ms(8),
  },
});

export default FacultyAnalyticsScreen;
