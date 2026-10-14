import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, ProgressBar, Chip, Avatar, Button } from 'react-native-paper';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useReportStore } from '@features/cc/store/useReportStore';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ms } from '@theme/responsive';

const { width } = Dimensions.get('window');

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
      {/* Overview Card */}
      <View style={styles.overviewCard}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.deptLabel}>
              {user?.department || 'Computer Science Engineering'}
            </Text>
            <Text style={styles.overviewTitle}>Department Syllabus Analytics</Text>
          </View>
          <View style={styles.percentBadge}>
            <Text style={styles.percentText}>{avgCoverage}%</Text>
          </View>
        </View>

        <ProgressBar
          progress={avgCoverage / 100}
          color={Palette.primary}
          style={styles.mainProgressBar}
        />

        <View style={styles.overviewStatsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statNum}>{filtered.length}</Text>
            <Text style={styles.statLabel}>Monitored Sections</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statNum, { color: Palette.success }]}>{aheadCount + onTrackCount}</Text>
            <Text style={styles.statLabel}>On Schedule</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statNum, { color: Palette.error }]}>{laggingCount}</Text>
            <Text style={styles.statLabel}>Lagging</Text>
          </View>
        </View>
      </View>

      {/* Year Filter */}
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

      {/* Section Leaderboard */}
      <Text style={styles.sectionHeader}>Section Performance Leaderboard</Text>

      {filtered
        .sort((a, b) => b.coverage - a.coverage)
        .map((item, idx) => {
          const isTop = idx === 0;
          return (
            <Card key={`${item.year}_${item.section}`} style={styles.sectionCard}>
              <Card.Content>
                <View style={styles.sectionCardHeader}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: ms(10) }}>
                    <Text style={styles.sectionTitle}>
                      {item.year} {item.section}
                    </Text>
                    <Text style={styles.ccText}>CC: {item.cc}</Text>
                  </View>
                  <View style={styles.coverageBox}>
                    <Text style={styles.coverageNum}>{item.coverage}%</Text>
                    <Chip
                      style={{
                        backgroundColor:
                          item.status === 'AHEAD'
                            ? '#ECFDF5'
                            : item.status === 'ON_TRACK'
                            ? '#EFF6FF'
                            : '#FEF2F2',
                        height: ms(24),
                      }}
                      textStyle={{
                        fontSize: ms(10),
                        fontWeight: '800',
                        color:
                          item.status === 'AHEAD'
                            ? Palette.success
                            : item.status === 'ON_TRACK'
                            ? Palette.primary
                            : Palette.error,
                      }}
                    >
                      {item.status.replace('_', ' ')}
                    </Chip>
                  </View>
                </View>

                <ProgressBar
                  progress={item.coverage / 100}
                  color={
                    item.status === 'LAGGING'
                      ? Palette.error
                      : item.coverage >= 80
                      ? Palette.primary
                      : Palette.warning
                  }
                  style={styles.cardProgressBar}
                />
              </Card.Content>
            </Card>
          );
        })}

      {/* Audit Action */}
      <Button
        mode="contained"
        icon="clipboard-check-outline"
        style={styles.auditBtn}
        onPress={() => navigation.navigate('ApprovalScreen')}
      >
        Open HOD Approval Queue
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: ms(16),
    paddingBottom: ms(40),
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    padding: ms(18),
    marginBottom: ms(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ms(12),
  },
  deptLabel: {
    fontSize: ms(12),
    color: Palette.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  overviewTitle: {
    fontSize: ms(18),
    fontWeight: '900',
    color: Palette.textDark,
    marginTop: ms(2),
  },
  percentBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: ms(12),
    paddingVertical: ms(6),
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  percentText: {
    fontSize: ms(18),
    fontWeight: '900',
    color: Palette.primary,
  },
  mainProgressBar: {
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: '#E2E8F0',
    marginBottom: ms(14),
  },
  overviewStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: ms(12),
    paddingVertical: ms(10),
  },
  statCell: {
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    fontSize: ms(17),
    fontWeight: '900',
    color: Palette.textDark,
  },
  statLabel: {
    fontSize: ms(11),
    color: Palette.textLight,
    marginTop: ms(2),
  },
  statDivider: {
    width: 1,
    height: ms(22),
    backgroundColor: '#CBD5E1',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: ms(16),
  },
  filterChip: {
    paddingVertical: ms(6),
    paddingHorizontal: ms(14),
    borderRadius: ms(20),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: ms(8),
  },
  filterChipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  filterText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: Palette.textLight,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: ms(15),
    fontWeight: '800',
    color: Palette.textDark,
    marginBottom: ms(12),
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    marginBottom: ms(10),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ms(10),
  },
  rankBadge: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: ms(12),
    fontWeight: '900',
    color: Palette.textDark,
  },
  sectionTitle: {
    fontSize: ms(14.5),
    fontWeight: '800',
    color: Palette.textDark,
  },
  ccText: {
    fontSize: ms(12),
    color: Palette.textLight,
    marginTop: ms(1),
  },
  coverageBox: {
    alignItems: 'flex-end',
  },
  coverageNum: {
    fontSize: ms(14),
    fontWeight: '900',
    color: Palette.primary,
    marginBottom: ms(4),
  },
  cardProgressBar: {
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: '#E2E8F0',
  },
  auditBtn: {
    backgroundColor: Palette.primary,
    borderRadius: ms(12),
    marginTop: ms(12),
    paddingVertical: ms(4),
  },
});

export default DeptAnalyticsScreen;
