import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import {
  DayRibbonColors,
  DayRibbonFonts,
  DayRibbonShapes,
  DayRibbonSpacing,
} from '@theme/dayRibbon';
import { ProgressBar } from '@components/editorial/ProgressBar';
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
  const selectedWeek = 'Week 12';

  const filteredDepts = DEPT_METRICS.filter((d) => {
    if (selectedCategory === 'ALL') return true;
    return d.category === selectedCategory;
  }).sort((a, b) => b.overallCoverage - a.overallCoverage);

  const avgInstituteCoverage = Math.round(
    DEPT_METRICS.reduce((acc, d) => acc + d.overallCoverage, 0) / DEPT_METRICS.length
  );

  const getStatusLabel = (status: DeptMetric['status']) => {
    switch (status) {
      case 'AHEAD':
        return 'Ahead of Target';
      case 'STEADY':
        return 'On Track';
      case 'ATTENTION':
        return 'Pace Attention';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ── HEADER ── */}
      <View style={styles.headerBox}>
        <Text style={styles.captionText}>EXECUTIVE OVERSIGHT</Text>
        <Text style={styles.headingText}>Institution Analytics</Text>
        <Text style={styles.subHeadingText}>
          Anna University regulation audit · Academic {selectedWeek}
        </Text>
      </View>

      {/* ── CENTRAL KPI OVERVIEW ── */}
      <View style={styles.kpiContainer}>
        <Text style={styles.kpiHeaderLabel}>INSTITUTION BENCHMARK SUMMARY</Text>
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCell, styles.kpiCellBorderRight, styles.kpiCellBorderBottom]}>
            <Text style={styles.kpiLabel}>AVG INSTITUTE PACE</Text>
            <Text style={styles.kpiNumber}>{avgInstituteCoverage}%</Text>
          </View>

          <View style={[styles.kpiCell, styles.kpiCellBorderBottom]}>
            <Text style={styles.kpiLabel}>DEPARTMENTS AUDITED</Text>
            <Text style={styles.kpiNumber}>{DEPT_METRICS.length}</Text>
          </View>

          <View style={[styles.kpiCell, styles.kpiCellBorderRight]}>
            <Text style={styles.kpiLabel}>ACTIVE CLASS BATCHES</Text>
            <Text style={styles.kpiNumber}>48</Text>
          </View>

          <View style={styles.kpiCell}>
            <Text style={styles.kpiLabel}>COMPLIANCE INDEX</Text>
            <Text style={[styles.kpiNumber, { color: DayRibbonColors.cobalt }]}>96.4%</Text>
          </View>
        </View>
      </View>

      {/* ── DISCIPLINE FILTER CHIPS ── */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>DISCIPLINE FILTER</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {[
            { id: 'ALL', label: 'All Departments (10)' },
            { id: 'CIRCUIT', label: 'Circuit Branches (6)' },
            { id: 'CORE', label: 'Core Engineering (2)' },
            { id: 'ALLIED', label: 'Allied Sciences (2)' },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id as any)}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── DEPARTMENT RANKINGS LEADERBOARD ── */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>Department Velocity Leaderboard</Text>
        <Text style={styles.sectionCountText}>{filteredDepts.length} DEPARTMENTS</Text>
      </View>

      {filteredDepts.map((dept, index) => {
        const isAttention = dept.status === 'ATTENTION';
        const rank = index + 1;

        return (
          <View key={dept.id} style={styles.deptCard}>
            {/* Header Row: Rank Badge, Dept Code & Status */}
            <View style={styles.cardTopRow}>
              <View style={styles.deptMainInfo}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{String(rank).padStart(2, '0')}</Text>
                </View>
                <View style={styles.deptNameContainer}>
                  <Text style={styles.deptCodeText}>{dept.code}</Text>
                  <Text style={styles.deptFullName} numberOfLines={1}>
                    {dept.name}
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
                  {getStatusLabel(dept.status)}
                </Text>
              </View>
            </View>

            {/* Overall Coverage Progress */}
            <View style={styles.coverageRow}>
              <Text style={styles.coverageLabel}>Cumulative Coverage</Text>
              <Text style={[styles.coverageValue, isAttention && { color: DayRibbonColors.warn }]}>
                {dept.overallCoverage}%
              </Text>
            </View>
            <View style={{ marginBottom: ms(12) }}>
              <ProgressBar
                percent={dept.overallCoverage}
                isBehind={isAttention}
              />
            </View>

            {/* Year 1-4 Mini Breakdown Grid */}
            <View style={styles.yearGrid}>
              <View style={styles.yearCell}>
                <Text style={styles.yearLbl}>1st Yr</Text>
                <Text style={styles.yearVal}>{dept.yearCoverage.y1}%</Text>
              </View>
              <View style={styles.yearDivider} />
              <View style={styles.yearCell}>
                <Text style={styles.yearLbl}>2nd Yr</Text>
                <Text style={styles.yearVal}>{dept.yearCoverage.y2}%</Text>
              </View>
              <View style={styles.yearDivider} />
              <View style={styles.yearCell}>
                <Text style={styles.yearLbl}>3rd Yr</Text>
                <Text style={styles.yearVal}>{dept.yearCoverage.y3}%</Text>
              </View>
              <View style={styles.yearDivider} />
              <View style={styles.yearCell}>
                <Text style={styles.yearLbl}>4th Yr</Text>
                <Text style={styles.yearVal}>{dept.yearCoverage.y4}%</Text>
              </View>
            </View>

            {/* Footer: HOD and Audit Navigation */}
            <View style={styles.cardFooter}>
              <View style={styles.hodInfoRow}>
                <Text style={styles.hodLabel}>HOD:</Text>
                <Text style={styles.hodNameText} numberOfLines={1}>
                  {dept.hodName}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.inspectBtn}
                onPress={() => navigation.navigate('DeptSummary', { departmentId: dept.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.inspectBtnText}>Audit Classes</Text>
                <Feather name="arrow-right" size={13} color={DayRibbonColors.ink} />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
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
  kpiContainer: {
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusCard,
    padding: ms(16),
    marginBottom: ms(16),
  },
  kpiHeaderLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: ms(12),
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusButton,
    overflow: 'hidden',
  },
  kpiCell: {
    width: '50%',
    padding: ms(12),
    backgroundColor: DayRibbonColors.bg,
  },
  kpiCellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: DayRibbonColors.line,
  },
  kpiCellBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: DayRibbonColors.line,
  },
  kpiNumber: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(22),
    color: DayRibbonColors.ink,
    marginTop: ms(2),
  },
  kpiLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(9.5),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  filterSection: {
    marginBottom: ms(16),
  },
  filterTitle: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(10),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    marginBottom: ms(8),
    textTransform: 'uppercase',
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
    fontSize: ms(12),
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
  deptCard: {
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusCard,
    padding: ms(16),
    marginBottom: ms(12),
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
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(8),
  },
  rankText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(11),
    color: DayRibbonColors.ink,
  },
  deptNameContainer: {
    flex: 1,
  },
  deptCodeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(15),
    color: DayRibbonColors.ink,
  },
  deptFullName: {
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
  coverageValue: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(16),
    color: DayRibbonColors.cobalt,
  },
  yearGrid: {
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
  yearCell: {
    alignItems: 'center',
    flex: 1,
  },
  yearLbl: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(9.5),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
  },
  yearVal: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(12),
    color: DayRibbonColors.ink,
    marginTop: ms(2),
  },
  yearDivider: {
    width: 1,
    height: ms(18),
    backgroundColor: DayRibbonColors.line,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: DayRibbonColors.line,
    paddingTop: ms(10),
  },
  hodInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.65,
  },
  hodLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(10),
    color: DayRibbonColors.muted,
    marginRight: ms(4),
  },
  hodNameText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(11),
    color: DayRibbonColors.ink,
  },
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: DayRibbonColors.ink,
    borderRadius: DayRibbonShapes.radiusButton,
    paddingVertical: ms(6),
    paddingHorizontal: ms(10),
    backgroundColor: DayRibbonColors.surface,
  },
  inspectBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(11),
    color: DayRibbonColors.ink,
    marginRight: ms(4),
  },
});

export default InstitutionAnalyticsScreen;
