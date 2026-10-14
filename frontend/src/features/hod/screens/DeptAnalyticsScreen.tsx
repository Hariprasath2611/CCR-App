import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
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
  BigNumber,
  SegBar,
  EditorialButton,
} from '@components/editorial';

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
      <EditorialHeader
        eyebrow={(user?.department || 'COMPUTER SCIENCE ENGINEERING').toUpperCase()}
        title="SYLLABUS ANALYTICS"
        subtitle="Department coverage & performance leaderboard"
      />

      {/* ── OVERVIEW METRICS BLOCK ── */}
      <View style={styles.metricsBox}>
        <Label text="COMPLETION BENCHMARK" variant="dark" />
        <View style={{ marginTop: EditorialSpacing.sm, marginBottom: EditorialSpacing.xs }}>
          <BigNumber value={avgCoverage} unit="%" label="AVERAGE SYLLABUS COVERAGE" />
        </View>

        <View style={{ marginVertical: EditorialSpacing.md }}>
          <SegBar
            value={avgCoverage}
            max={100}
            segments={10}
            color={avgCoverage < 75 ? EditorialColors.accent : EditorialColors.ink}
          />
        </View>

        <Rule thickness={1} color={EditorialColors.track} />

        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>MONITORED</Text>
            <Text style={styles.statValue}>{filtered.length}</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>ON SCHEDULE</Text>
            <Text style={styles.statValue}>{aheadCount + onTrackCount}</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statLabel, laggingCount > 0 && { color: EditorialColors.accent }]}>
              LAGGING
            </Text>
            <Text
              style={[
                styles.statValue,
                laggingCount > 0 && { color: EditorialColors.accent },
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
                {yr.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── SECTION LEADERBOARD ── */}
      <View style={styles.sectionHeaderRow}>
        <Label text="PERFORMANCE LEADERBOARD" variant="dark" />
        <Text style={styles.countText}>{filtered.length} SECTIONS</Text>
      </View>
      <Rule thickness={4} color={EditorialColors.ink} style={{ marginBottom: EditorialSpacing.md }} />

      {filtered
        .sort((a, b) => b.coverage - a.coverage)
        .map((item, idx) => {
          const isLagging = item.status === 'LAGGING';
          return (
            <View
              key={`${item.year}_${item.section}`}
              style={[styles.card, idx === 0 && styles.topCard]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.rankBox}>
                  <Text style={styles.rankText}>#{String(idx + 1).padStart(2, '0')}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: EditorialSpacing.sm }}>
                  <Text style={styles.sectionTitle}>
                    {item.year.toUpperCase()} · {item.section}
                  </Text>
                  <Text style={styles.ccText}>CC: {item.cc}</Text>
                </View>
                <View style={styles.coverageBox}>
                  <Text style={[styles.coverageNum, isLagging && { color: EditorialColors.accent }]}>
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

              <View style={{ marginTop: EditorialSpacing.sm }}>
                <SegBar
                  value={item.coverage}
                  max={100}
                  segments={8}
                  color={isLagging ? EditorialColors.accent : EditorialColors.ink}
                />
              </View>
            </View>
          );
        })}

      {/* ── AUDIT ACTION ── */}
      <View style={{ marginTop: EditorialSpacing.xl }}>
        <EditorialButton
          title="OPEN HOD APPROVAL QUEUE"
          variant="primary"
          fullWidth
          onPress={() => navigation.navigate('ApprovalScreen')}
          rightIcon={<Feather name="arrow-right" size={16} color={EditorialColors.white} />}
        />
      </View>
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
  metricsBox: {
    backgroundColor: EditorialColors.white,
    borderWidth: 2,
    borderColor: EditorialColors.ink,
    borderRadius: 0,
    padding: EditorialSpacing.lg,
    marginBottom: EditorialSpacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: EditorialSpacing.md,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  vDivider: {
    width: 1,
    backgroundColor: EditorialColors.track,
  },
  statLabel: {
    fontFamily: EditorialFonts.bold,
    fontSize: 9,
    color: EditorialColors.muted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 18,
    color: EditorialColors.ink,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: EditorialSpacing.xl,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: EditorialColors.track,
    backgroundColor: EditorialColors.white,
    marginRight: EditorialSpacing.sm,
  },
  filterChipActive: {
    backgroundColor: EditorialColors.ink,
    borderColor: EditorialColors.ink,
  },
  filterText: {
    fontFamily: EditorialFonts.bold,
    fontSize: 11,
    color: EditorialColors.ink,
    letterSpacing: 0.5,
  },
  filterTextActive: {
    color: EditorialColors.white,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  countText: {
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
  topCard: {
    borderWidth: 2,
    borderColor: EditorialColors.ink,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBox: {
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: EditorialColors.bg,
  },
  rankText: {
    fontFamily: EditorialFonts.bold,
    fontSize: 11,
    color: EditorialColors.ink,
  },
  sectionTitle: {
    fontFamily: EditorialFonts.bold,
    fontSize: 13,
    color: EditorialColors.ink,
    letterSpacing: 0.2,
  },
  ccText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 11,
    color: EditorialColors.muted,
    marginTop: 2,
  },
  coverageBox: {
    alignItems: 'flex-end',
  },
  coverageNum: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 16,
    color: EditorialColors.ink,
    marginBottom: 3,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusBadgeNormal: {
    borderColor: EditorialColors.ink,
    backgroundColor: EditorialColors.white,
  },
  statusBadgeLagging: {
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
  statusBadgeTextLagging: {
    color: EditorialColors.accent,
  },
});

export default DeptAnalyticsScreen;
