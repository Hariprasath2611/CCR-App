import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import {
  DayRibbonColors,
  DayRibbonFonts,
  DayRibbonShapes,
  DayRibbonSpacing,
} from '@theme/dayRibbon';
import { ProgressBar } from '@components/editorial/ProgressBar';
import { EditorialButton } from '@components/editorial/EditorialButton';
import { ms } from '@theme/responsive';

interface SectionStat {
  section: string;
  year: string;
  coverage: number;
  cc: string;
  status: 'AHEAD' | 'ON_TRACK' | 'LAGGING';
}

const SECTION_STATS: SectionStat[] = [
  { section: 'SEC-A', year: '1st Year', coverage: 78, cc: 'Dr. Karuppaiya', status: 'ON_TRACK' },
  { section: 'SEC-B', year: '1st Year', coverage: 82, cc: 'Mrs. G.Revathi', status: 'ON_TRACK' },
  { section: 'SEC-C', year: '1st Year', coverage: 75, cc: 'Mrs. Gopikha', status: 'ON_TRACK' },
  { section: 'SEC-D', year: '1st Year', coverage: 80, cc: 'Dr. Bhuvaneshwari', status: 'ON_TRACK' },
  { section: 'SEC-E', year: '1st Year', coverage: 70, cc: 'Dr. Josphin', status: 'LAGGING' },
  { section: 'SEC-F', year: '1st Year', coverage: 85, cc: 'Mrs. Jasline', status: 'AHEAD' },
  { section: 'SEC-G', year: '1st Year', coverage: 72, cc: 'Mrs. R.Sumathi', status: 'ON_TRACK' },
  { section: 'CSE-A', year: '3rd Year', coverage: 88, cc: 'Ms. Punitha EM', status: 'AHEAD' },
  { section: 'CSE-B', year: '3rd Year', coverage: 85, cc: 'Ms. E Uva Shakthi', status: 'ON_TRACK' },
];

export const DeptAnalyticsScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [selectedYear, setSelectedYear] = useState('All');

  const filtered = SECTION_STATS.filter((s) => {
    if (selectedYear === 'All') return true;
    return s.year === selectedYear;
  });

  const avgCoverage = Math.round(
    filtered.reduce((sum, s) => sum + s.coverage, 0) / (filtered.length || 1)
  );

  const aheadCount = filtered.filter((s) => s.status === 'AHEAD').length;
  const onTrackCount = filtered.filter((s) => s.status === 'ON_TRACK').length;
  const laggingCount = filtered.filter((s) => s.status === 'LAGGING').length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={styles.headerBox}>
        <Text style={styles.captionText}>
          {(user?.department || 'COMPUTER SCIENCE ENGINEERING').toUpperCase()}
        </Text>
        <Text style={styles.headingText}>Syllabus Analytics</Text>
        <Text style={styles.subHeadingText}>
          Department coverage & performance leaderboard
        </Text>
      </View>

      {/* ── OVERVIEW METRICS BLOCK ── */}
      <View style={styles.metricsBox}>
        <Text style={styles.boxLabel}>COMPLETION BENCHMARK</Text>
        <View style={styles.bigNumRow}>
          <Text style={styles.bigNumText}>{avgCoverage}%</Text>
          <Text style={styles.bigNumDesc}>Average Syllabus Coverage</Text>
        </View>

        <View style={styles.barWrapper}>
          <ProgressBar
            percent={avgCoverage}
            isBehind={avgCoverage < 75}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>MONITORED</Text>
            <Text style={styles.statValue}>{filtered.length}</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>ON SCHEDULE</Text>
            <Text style={[styles.statValue, { color: DayRibbonColors.cobalt }]}>
              {aheadCount + onTrackCount}
            </Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statLabel, laggingCount > 0 && { color: DayRibbonColors.warn }]}>
              LAGGING
            </Text>
            <Text
              style={[
                styles.statValue,
                laggingCount > 0 && { color: DayRibbonColors.warn },
              ]}
            >
              {laggingCount}
            </Text>
          </View>
        </View>
      </View>

      {/* ── YEAR FILTER SELECTOR ── */}
      <View style={styles.filterRow}>
        {['All', '1st Year', '3rd Year'].map((yr) => {
          const isSelected = selectedYear === yr;
          return (
            <TouchableOpacity
              key={yr}
              onPress={() => setSelectedYear(yr)}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {yr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── SECTION LEADERBOARD ── */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Performance Leaderboard</Text>
        <Text style={styles.countText}>{filtered.length} SECTIONS</Text>
      </View>

      {filtered
        .sort((a, b) => b.coverage - a.coverage)
        .map((item, idx) => {
          const isLagging = item.status === 'LAGGING';
          return (
            <View
              key={`${item.year}_${item.section}`}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <View style={styles.rankBox}>
                  <Text style={styles.rankText}>#{String(idx + 1).padStart(2, '0')}</Text>
                </View>
                <View style={styles.classInfo}>
                  <Text style={styles.classTitle}>
                    {item.year} · {item.section}
                  </Text>
                  <Text style={styles.ccText}>CC: {item.cc}</Text>
                </View>
                <View style={styles.coverageBox}>
                  <Text style={[styles.coverageNum, isLagging && { color: DayRibbonColors.warn }]}>
                    {item.coverage}%
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      isLagging ? styles.statusBadgeLagging : styles.statusBadgeNormal,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        isLagging ? styles.statusBadgeTextLagging : styles.statusBadgeTextNormal,
                      ]}
                    >
                      {item.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardBarWrapper}>
                <ProgressBar
                  percent={item.coverage}
                  isBehind={isLagging}
                />
              </View>
            </View>
          );
        })}

      {/* ── AUDIT ACTION ── */}
      <View style={styles.actionContainer}>
        <EditorialButton
          title="Open HOD Approval Queue"
          variant="highlight"
          fullWidth
          onPress={() => navigation.navigate('ApprovalScreen')}
          rightIcon={<Feather name="arrow-right" size={16} color={DayRibbonColors.ink} />}
        />
      </View>
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
  metricsBox: {
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusCard,
    padding: ms(16),
    marginBottom: ms(16),
  },
  boxLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bigNumRow: {
    marginTop: ms(8),
    marginBottom: ms(10),
  },
  bigNumText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(40),
    color: DayRibbonColors.cobalt,
    lineHeight: ms(46),
  },
  bigNumDesc: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(12),
    color: DayRibbonColors.muted,
    marginTop: ms(2),
  },
  barWrapper: {
    marginVertical: ms(10),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: ms(12),
    borderTopWidth: 1,
    borderTopColor: DayRibbonColors.line,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  vDivider: {
    width: 1,
    backgroundColor: DayRibbonColors.line,
  },
  statLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(10),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    marginBottom: ms(2),
  },
  statValue: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(18),
    color: DayRibbonColors.ink,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: ms(16),
    gap: ms(8),
  },
  filterChip: {
    paddingVertical: ms(8),
    paddingHorizontal: ms(14),
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.radiusChip,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: DayRibbonColors.ink,
    borderColor: DayRibbonColors.ink,
  },
  filterText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(12),
    color: DayRibbonColors.ink,
  },
  filterTextActive: {
    color: DayRibbonColors.surface,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(12),
  },
  sectionTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(14),
    color: DayRibbonColors.ink,
  },
  countText: {
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
    alignItems: 'center',
  },
  rankBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(11),
    color: DayRibbonColors.ink,
  },
  classInfo: {
    flex: 1,
    marginLeft: ms(10),
  },
  classTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(14),
    color: DayRibbonColors.ink,
  },
  ccText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    marginTop: ms(2),
  },
  coverageBox: {
    alignItems: 'flex-end',
  },
  coverageNum: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(18),
    color: DayRibbonColors.cobalt,
    marginBottom: ms(2),
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: DayRibbonShapes.radiusChip,
    paddingHorizontal: ms(8),
    paddingVertical: ms(2),
  },
  statusBadgeNormal: {
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.bg,
  },
  statusBadgeLagging: {
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
  statusBadgeTextLagging: {
    color: DayRibbonColors.warn,
  },
  cardBarWrapper: {
    marginTop: ms(10),
  },
  actionContainer: {
    marginTop: ms(16),
  },
});

export default DeptAnalyticsScreen;
