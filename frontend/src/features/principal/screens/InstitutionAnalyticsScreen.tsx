import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, ProgressBar, Chip, Avatar, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ms } from '@theme/responsive';

interface DeptMetric {
  id: string;
  name: string;
  code: string;
  category: 'CIRCUIT' | 'CORE' | 'ALLIED';
  overallCoverage: number;
  yearCoverage: { y1: number; y2: number; y3: number; y4: number };
  classesCount: number;
  hodName: string;
  status: 'AHEAD' | 'STEADY' | 'ATTENTION';
}

const DEPT_METRICS: DeptMetric[] = [
  {
    id: 'dept_cse',
    name: 'Computer Science and Engineering',
    code: 'CSE',
    category: 'CIRCUIT',
    overallCoverage: 89,
    yearCoverage: { y1: 82, y2: 84, y3: 88, y4: 92 },
    classesCount: 8,
    hodName: 'Dr. C.B. Selva Lakshmi',
    status: 'AHEAD',
  },
  {
    id: 'dept_aids',
    name: 'Artificial Intelligence & Data Science',
    code: 'AI&DS',
    category: 'CIRCUIT',
    overallCoverage: 87,
    yearCoverage: { y1: 85, y2: 86, y3: 89, y4: 88 },
    classesCount: 4,
    hodName: 'Dr. S. Karthikeyan',
    status: 'AHEAD',
  },
  {
    id: 'dept_it',
    name: 'Information Technology',
    code: 'IT',
    category: 'CIRCUIT',
    overallCoverage: 86,
    yearCoverage: { y1: 80, y2: 83, y3: 87, y4: 90 },
    classesCount: 4,
    hodName: 'Dr. K. Vijayalakshmi',
    status: 'AHEAD',
  },
  {
    id: 'dept_ece',
    name: 'Electronics and Communication',
    code: 'ECE',
    category: 'CIRCUIT',
    overallCoverage: 84,
    yearCoverage: { y1: 79, y2: 81, y3: 86, y4: 89 },
    classesCount: 6,
    hodName: 'Dr. M. Rajkumar',
    status: 'STEADY',
  },
  {
    id: 'dept_csbs',
    name: 'Computer Science & Business Systems',
    code: 'CSBS',
    category: 'CIRCUIT',
    overallCoverage: 83,
    yearCoverage: { y1: 81, y2: 82, y3: 84, y4: 86 },
    classesCount: 3,
    hodName: 'Dr. N. Sundararajan',
    status: 'STEADY',
  },
  {
    id: 'dept_eee',
    name: 'Electrical and Electronics',
    code: 'EEE',
    category: 'CIRCUIT',
    overallCoverage: 81,
    yearCoverage: { y1: 76, y2: 80, y3: 82, y4: 85 },
    classesCount: 4,
    hodName: 'Dr. R. Shanmugasundaram',
    status: 'STEADY',
  },
  {
    id: 'dept_mech',
    name: 'Mechanical Engineering',
    code: 'MECH',
    category: 'CORE',
    overallCoverage: 79,
    yearCoverage: { y1: 75, y2: 78, y3: 80, y4: 82 },
    classesCount: 6,
    hodName: 'Dr. P. Ravichandran',
    status: 'STEADY',
  },
  {
    id: 'dept_civil',
    name: 'Civil Engineering',
    code: 'CIVIL',
    category: 'CORE',
    overallCoverage: 74,
    yearCoverage: { y1: 70, y2: 72, y3: 75, y4: 78 },
    classesCount: 4,
    hodName: 'Dr. S. Jayasree',
    status: 'ATTENTION',
  },
  {
    id: 'dept_bme',
    name: 'Biomedical Engineering',
    code: 'BME',
    category: 'ALLIED',
    overallCoverage: 82,
    yearCoverage: { y1: 80, y2: 81, y3: 83, y4: 85 },
    classesCount: 3,
    hodName: 'Dr. V. Kavitha',
    status: 'STEADY',
  },
  {
    id: 'dept_chem',
    name: 'Chemical Engineering',
    code: 'CHEM',
    category: 'ALLIED',
    overallCoverage: 76,
    yearCoverage: { y1: 72, y2: 74, y3: 78, y4: 80 },
    classesCount: 3,
    hodName: 'Dr. T. Murugan',
    status: 'ATTENTION',
  },
];

export const InstitutionAnalyticsScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'CIRCUIT' | 'CORE' | 'ALLIED'>('ALL');
  const [selectedWeek, setSelectedWeek] = useState('Week 12');

  const filteredDepts = DEPT_METRICS.filter((d) => {
    if (selectedCategory === 'ALL') return true;
    return d.category === selectedCategory;
  }).sort((a, b) => b.overallCoverage - a.overallCoverage);

  const avgInstituteCoverage = Math.round(
    DEPT_METRICS.reduce((acc, d) => acc + d.overallCoverage, 0) / DEPT_METRICS.length
  );

  const getStatusBadge = (status: DeptMetric['status']) => {
    switch (status) {
      case 'AHEAD':
        return { bg: '#DCFCE7', text: '#15803D', label: 'Ahead of AU Target' };
      case 'STEADY':
        return { bg: '#DBEAFE', text: '#1D4ED8', label: 'On Track' };
      case 'ATTENTION':
        return { bg: '#FEE2E2', text: '#B91C1C', label: 'Pace Attention' };
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* ── CENTRAL KPI OVERVIEW ── */}
        <View style={styles.kpiContainer}>
          <Text style={styles.kpiHeading}>Institution Pace Performance</Text>
          <Text style={styles.kpiSubtitle}>Anna University Regulation Audit • Academic {selectedWeek}</Text>

          <View style={styles.kpiGrid}>
            <View style={styles.kpiCell}>
              <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
                <MaterialCommunityIcons name="school-outline" size={24} color="#2563EB" />
              </View>
              <Text style={styles.kpiNumber}>{avgInstituteCoverage}%</Text>
              <Text style={styles.kpiLabel}>Avg Institute Pace</Text>
            </View>

            <View style={styles.kpiCell}>
              <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
                <MaterialCommunityIcons name="office-building" size={24} color="#10B981" />
              </View>
              <Text style={styles.kpiNumber}>{DEPT_METRICS.length}</Text>
              <Text style={styles.kpiLabel}>Departments Audited</Text>
            </View>

            <View style={styles.kpiCell}>
              <View style={[styles.kpiIconBox, { backgroundColor: '#FFF7ED' }]}>
                <MaterialCommunityIcons name="google-classroom" size={24} color="#F97316" />
              </View>
              <Text style={styles.kpiNumber}>48</Text>
              <Text style={styles.kpiLabel}>Active Class Batches</Text>
            </View>

            <View style={styles.kpiCell}>
              <View style={[styles.kpiIconBox, { backgroundColor: '#F5F3FF' }]}>
                <MaterialCommunityIcons name="shield-check-outline" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.kpiNumber}>96.4%</Text>
              <Text style={styles.kpiLabel}>Compliance Index</Text>
            </View>
          </View>
        </View>

        {/* ── CATEGORY FILTER CHIPS ── */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Discipline Filter</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {[
              { id: 'ALL', label: 'All Departments (10)' },
              { id: 'CIRCUIT', label: 'Circuit Branches (6)' },
              { id: 'CORE', label: 'Core Engineering (2)' },
              { id: 'ALLIED', label: 'Allied Sciences (2)' },
            ].map((cat) => (
              <Chip
                key={cat.id}
                selected={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(cat.id as any)}
                style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
                textStyle={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}
              >
                {cat.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* ── DEPARTMENT RANKINGS LEADERBOARD ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Department Velocity Leaderboard</Text>
          <Text style={styles.sectionSubtitle}>Ranked by cumulative syllabus completion</Text>
        </View>

        {filteredDepts.map((dept, index) => {
          const statusInfo = getStatusBadge(dept.status);
          const rank = index + 1;
          const isTop3 = rank <= 3;

          return (
            <Card key={dept.id} style={styles.deptCard}>
              <Card.Content style={styles.deptCardContent}>
                {/* Header Row: Rank Badge, Dept Code & Status */}
                <View style={styles.cardTopRow}>
                  <View style={styles.deptMainInfo}>
                    <View style={[styles.rankBadge, isTop3 && styles.rankBadgeTop]}>
                      <Text style={[styles.rankText, isTop3 && styles.rankTextTop]}>#{rank}</Text>
                    </View>
                    <View style={styles.deptNameContainer}>
                      <Text style={styles.deptCodeText}>{dept.code}</Text>
                      <Text style={styles.deptFullName} numberOfLines={1}>
                        {dept.name}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Text style={[styles.statusText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
                  </View>
                </View>

                {/* Overall Coverage Progress */}
                <View style={styles.coverageRow}>
                  <Text style={styles.coverageLabel}>Cumulative Coverage</Text>
                  <Text style={styles.coverageValue}>{dept.overallCoverage}%</Text>
                </View>
                <ProgressBar
                  progress={dept.overallCoverage / 100}
                  color={dept.overallCoverage >= 85 ? Palette.primary : dept.overallCoverage >= 75 ? '#F59E0B' : '#EF4444'}
                  style={styles.progressBar}
                />

                {/* Year 1-4 Mini Breakdown Grid */}
                <View style={styles.yearGrid}>
                  <View style={styles.yearCell}>
                    <Text style={styles.yearLbl}>1st Year</Text>
                    <Text style={styles.yearVal}>{dept.yearCoverage.y1}%</Text>
                  </View>
                  <View style={styles.yearDivider} />
                  <View style={styles.yearCell}>
                    <Text style={styles.yearLbl}>2nd Year</Text>
                    <Text style={styles.yearVal}>{dept.yearCoverage.y2}%</Text>
                  </View>
                  <View style={styles.yearDivider} />
                  <View style={styles.yearCell}>
                    <Text style={styles.yearLbl}>3rd Year</Text>
                    <Text style={styles.yearVal}>{dept.yearCoverage.y3}%</Text>
                  </View>
                  <View style={styles.yearDivider} />
                  <View style={styles.yearCell}>
                    <Text style={styles.yearLbl}>4th Year</Text>
                    <Text style={styles.yearVal}>{dept.yearCoverage.y4}%</Text>
                  </View>
                </View>

                {/* Footer: HOD and Audit Navigation */}
                <View style={styles.cardFooter}>
                  <View style={styles.hodInfoRow}>
                    <Feather name="user-check" size={13} color="#64748B" />
                    <Text style={styles.hodNameText}>HOD: {dept.hodName}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.inspectBtn}
                    onPress={() => navigation.navigate('DeptSummary', { departmentId: dept.id })}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.inspectBtnText}>Audit Classes</Text>
                    <Feather name="arrow-right" size={13} color={Palette.primary} />
                  </TouchableOpacity>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: ms(16),
    paddingBottom: ms(40),
  },
  kpiContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    padding: ms(18),
    marginBottom: ms(16),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  kpiHeading: {
    fontSize: ms(18),
    fontWeight: '900',
    color: Palette.textDark,
    letterSpacing: -0.3,
  },
  kpiSubtitle: {
    fontSize: ms(12),
    color: Palette.textLight,
    marginTop: ms(2),
    marginBottom: ms(16),
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCell: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: ms(12),
    padding: ms(12),
    marginBottom: ms(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiIconBox: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ms(8),
  },
  kpiNumber: {
    fontSize: ms(20),
    fontWeight: '900',
    color: Palette.textDark,
  },
  kpiLabel: {
    fontSize: ms(11),
    fontWeight: '600',
    color: '#64748B',
    marginTop: ms(2),
  },
  filterSection: {
    marginBottom: ms(14),
  },
  filterTitle: {
    fontSize: ms(12),
    fontWeight: '700',
    color: Palette.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: ms(8),
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: ms(8),
    backgroundColor: '#FFFFFF',
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
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
  sectionHeaderRow: {
    marginBottom: ms(12),
  },
  sectionTitle: {
    fontSize: ms(16),
    fontWeight: '900',
    color: Palette.textDark,
  },
  sectionSubtitle: {
    fontSize: ms(12),
    color: Palette.textLight,
    marginTop: ms(1),
  },
  deptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    marginBottom: ms(12),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  deptCardContent: {
    padding: ms(14),
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(10),
  },
  deptMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.68,
  },
  rankBadge: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(10),
  },
  rankBadgeTop: {
    backgroundColor: '#EFF6FF',
  },
  rankText: {
    fontSize: ms(12),
    fontWeight: '800',
    color: '#64748B',
  },
  rankTextTop: {
    color: Palette.primary,
  },
  deptNameContainer: {
    flex: 1,
  },
  deptCodeText: {
    fontSize: ms(16),
    fontWeight: '900',
    color: Palette.textDark,
  },
  deptFullName: {
    fontSize: ms(11),
    color: Palette.textLight,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: ms(8),
    paddingVertical: ms(4),
    borderRadius: ms(6),
  },
  statusText: {
    fontSize: ms(10),
    fontWeight: '800',
  },
  coverageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ms(4),
  },
  coverageLabel: {
    fontSize: ms(12),
    color: '#64748B',
    fontWeight: '600',
  },
  coverageValue: {
    fontSize: ms(13),
    fontWeight: '800',
    color: Palette.textDark,
  },
  progressBar: {
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: '#E2E8F0',
    marginBottom: ms(12),
  },
  yearGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: ms(10),
    paddingVertical: ms(8),
    paddingHorizontal: ms(10),
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  yearCell: {
    alignItems: 'center',
    flex: 1,
  },
  yearLbl: {
    fontSize: ms(10),
    color: '#64748B',
    fontWeight: '600',
  },
  yearVal: {
    fontSize: ms(12),
    fontWeight: '800',
    color: Palette.textDark,
    marginTop: ms(1),
  },
  yearDivider: {
    width: 1,
    height: ms(18),
    backgroundColor: '#CBD5E1',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: ms(8),
  },
  hodInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    flex: 0.65,
  },
  hodNameText: {
    fontSize: ms(11),
    color: '#64748B',
    fontWeight: '600',
  },
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(3),
    paddingVertical: ms(3),
    paddingHorizontal: ms(8),
    borderRadius: ms(6),
    backgroundColor: '#EFF6FF',
  },
  inspectBtnText: {
    fontSize: ms(11),
    fontWeight: '700',
    color: Palette.primary,
  },
});

export default InstitutionAnalyticsScreen;
