import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
        return 'AHEAD OF TARGET';
      case 'STEADY':
        return 'ON TRACK';
      case 'ATTENTION':
        return 'PACE ATTENTION';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <EditorialHeader
        eyebrow="EXECUTIVE OVERSIGHT"
        title="INSTITUTION ANALYTICS"
        subtitle={`Anna University regulation audit · Academic ${selectedWeek}`}
      />

      {/* ── CENTRAL KPI OVERVIEW ── */}
      <View style={styles.kpiContainer}>
        <Label text="INSTITUTION BENCHMARK SUMMARY" variant="dark" />
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
            <Text style={styles.kpiNumber}>96.4%</Text>
          </View>
        </View>
      </View>

      {/* ── DISCIPLINE FILTER CHIPS ── */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>DISCIPLINE FILTER</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {[
            { id: 'ALL', label: 'ALL DEPARTMENTS (10)' },
            { id: 'CIRCUIT', label: 'CIRCUIT BRANCHES (6)' },
            { id: 'CORE', label: 'CORE ENGINEERING (2)' },
            { id: 'ALLIED', label: 'ALLIED SCIENCES (2)' },
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
        <Label text="DEPARTMENT VELOCITY LEADERBOARD" variant="dark" />
        <Text style={styles.sectionCountText}>{filteredDepts.length} DEPARTMENTS</Text>
      </View>
      <Rule thickness={4} color={EditorialColors.ink} style={{ marginBottom: EditorialSpacing.md }} />

      {filteredDepts.map((dept, index) => {
        const isAttention = dept.status === 'ATTENTION';
        const rank = index + 1;
        const isTop = rank === 1;

        return (
          <View key={dept.id} style={[styles.deptCard, isTop && styles.deptCardTop]}>
            {/* Header Row: Rank Badge, Dept Code & Status */}
            <View style={styles.cardTopRow}>
              <View style={styles.deptMainInfo}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{String(rank).padStart(2, '0')}</Text>
                </View>
                <View style={styles.deptNameContainer}>
                  <Text style={styles.deptCodeText}>{dept.code}</Text>
                  <Text style={styles.deptFullName} numberOfLines={1}>
                    {dept.name.toUpperCase()}
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
              <Text style={styles.coverageLabel}>CUMULATIVE COVERAGE</Text>
              <Text style={[styles.coverageValue, isAttention && { color: EditorialColors.accent }]}>
                {dept.overallCoverage}%
              </Text>
            </View>
            <View style={{ marginBottom: EditorialSpacing.md }}>
              <SegBar
                value={dept.overallCoverage}
                max={100}
                segments={10}
                color={isAttention ? EditorialColors.accent : EditorialColors.ink}
              />
            </View>

            {/* Year 1-4 Mini Breakdown Grid */}
            <View style={styles.yearGrid}>
              <View style={styles.yearCell}>
                <Text style={styles.yearLbl}>1ST YR</Text>
                <Text style={styles.yearVal}>{dept.yearCoverage.y1}%</Text>
              </View>
              <View style={styles.yearDivider} />
              <View style={styles.yearCell}>
                <Text style={styles.yearLbl}>2ND YR</Text>
                <Text style={styles.yearVal}>{dept.yearCoverage.y2}%</Text>
              </View>
              <View style={styles.yearDivider} />
              <View style={styles.yearCell}>
                <Text style={styles.yearLbl}>3RD YR</Text>
                <Text style={styles.yearVal}>{dept.yearCoverage.y3}%</Text>
              </View>
              <View style={styles.yearDivider} />
              <View style={styles.yearCell}>
                <Text style={styles.yearLbl}>4TH YR</Text>
                <Text style={styles.yearVal}>{dept.yearCoverage.y4}%</Text>
              </View>
            </View>

            {/* Footer: HOD and Audit Navigation */}
            <View style={styles.cardFooter}>
              <View style={styles.hodInfoRow}>
                <Text style={styles.hodLabel}>HOD</Text>
                <Text style={styles.hodNameText} numberOfLines={1}>
                  {dept.hodName}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.inspectBtn}
                onPress={() => navigation.navigate('DeptSummary', { departmentId: dept.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.inspectBtnText}>AUDIT CLASSES</Text>
                <Feather name="arrow-right" size={13} color={EditorialColors.ink} />
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
    backgroundColor: EditorialColors.bg,
  },
  content: {
    padding: EditorialSpacing.lg,
    paddingBottom: EditorialSpacing.xxxl,
  },
  kpiContainer: {
    backgroundColor: EditorialColors.white,
    borderWidth: 2,
    borderColor: EditorialColors.ink,
    borderRadius: 0,
    padding: EditorialSpacing.lg,
    marginBottom: EditorialSpacing.xl,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: EditorialSpacing.md,
    borderWidth: 1,
    borderColor: EditorialColors.track,
  },
  kpiCell: {
    width: '50%',
    padding: EditorialSpacing.md,
    backgroundColor: EditorialColors.white,
  },
  kpiCellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: EditorialColors.track,
  },
  kpiCellBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: EditorialColors.track,
  },
  kpiNumber: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 22,
    color: EditorialColors.ink,
    marginTop: 2,
  },
  kpiLabel: {
    fontFamily: EditorialFonts.bold,
    fontSize: 9,
    color: EditorialColors.muted,
    letterSpacing: 0.8,
  },
  filterSection: {
    marginBottom: EditorialSpacing.xl,
  },
  filterTitle: {
    fontFamily: EditorialFonts.bold,
    fontSize: 10,
    color: EditorialColors.muted,
    letterSpacing: 0.8,
    marginBottom: EditorialSpacing.xs,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingVertical: 8,
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
    fontSize: 11,
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
  deptCard: {
    backgroundColor: EditorialColors.white,
    borderWidth: 1,
    borderColor: EditorialColors.track,
    borderRadius: 0,
    padding: EditorialSpacing.md,
    marginBottom: EditorialSpacing.md,
  },
  deptCardTop: {
    borderWidth: 2,
    borderColor: EditorialColors.ink,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: EditorialSpacing.sm,
  },
  deptMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.68,
  },
  rankBadge: {
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: EditorialColors.bg,
    marginRight: EditorialSpacing.sm,
  },
  rankText: {
    fontFamily: EditorialFonts.bold,
    fontSize: 11,
    color: EditorialColors.ink,
  },
  deptNameContainer: {
    flex: 1,
  },
  deptCodeText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 15,
    color: EditorialColors.ink,
    letterSpacing: 0.2,
  },
  deptFullName: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 10,
    color: EditorialColors.muted,
    marginTop: 1,
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
  coverageValue: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 15,
    color: EditorialColors.ink,
  },
  yearGrid: {
    flexDirection: 'row',
    backgroundColor: EditorialColors.bg,
    borderWidth: 1,
    borderColor: EditorialColors.track,
    paddingVertical: 6,
    paddingHorizontal: EditorialSpacing.sm,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: EditorialSpacing.sm,
  },
  yearCell: {
    alignItems: 'center',
    flex: 1,
  },
  yearLbl: {
    fontFamily: EditorialFonts.bold,
    fontSize: 9,
    color: EditorialColors.muted,
    letterSpacing: 0.5,
  },
  yearVal: {
    fontFamily: EditorialFonts.bold,
    fontSize: 12,
    color: EditorialColors.ink,
    marginTop: 2,
  },
  yearDivider: {
    width: 1,
    height: 16,
    backgroundColor: EditorialColors.track,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: EditorialColors.track,
    paddingTop: EditorialSpacing.sm,
  },
  hodInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.65,
  },
  hodLabel: {
    fontFamily: EditorialFonts.bold,
    fontSize: 9,
    color: EditorialColors.muted,
    letterSpacing: 0.5,
    marginRight: 6,
  },
  hodNameText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 11,
    color: EditorialColors.ink,
  },
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: EditorialColors.white,
  },
  inspectBtnText: {
    fontFamily: EditorialFonts.bold,
    fontSize: 10,
    color: EditorialColors.ink,
    letterSpacing: 0.5,
    marginRight: 4,
  },
});

export default InstitutionAnalyticsScreen;
