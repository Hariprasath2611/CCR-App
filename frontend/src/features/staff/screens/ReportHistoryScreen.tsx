import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, ProgressBar, Button } from 'react-native-paper';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useReportStore } from '@features/cc/store/useReportStore';
import { ms } from '@theme/responsive';

interface HistoryLogItem {
  id: string;
  weekNumber: number;
  subjectCode: string;
  subjectName: string;
  classSection: string;
  dateRange: string;
  unit: string;
  topicsCovered: string;
  periodsPlanned: number;
  periodsHandled: number;
  percent: number;
  status: 'SUBMITTED' | 'APPROVED' | 'IN_PROGRESS';
}

const SAMPLE_HISTORY: HistoryLogItem[] = [
  {
    id: 'hist_12',
    weekNumber: 12,
    subjectCode: 'CS3591',
    subjectName: 'Computer Networks',
    classSection: '1st Year SEC-B',
    dateRange: '15/07/2026 - 20/07/2026',
    unit: 'Unit 4',
    topicsCovered: 'Transport Layer Protocols, TCP 3-way Handshake, Flow Control',
    periodsPlanned: 4,
    periodsHandled: 4,
    percent: 80,
    status: 'APPROVED',
  },
  {
    id: 'hist_11',
    weekNumber: 11,
    subjectCode: 'CS3591',
    subjectName: 'Computer Networks',
    classSection: '1st Year SEC-B',
    dateRange: '08/07/2026 - 13/07/2026',
    unit: 'Unit 3',
    topicsCovered: 'Routing Algorithms, Distance Vector & Link State Routing',
    periodsPlanned: 4,
    periodsHandled: 4,
    percent: 74,
    status: 'APPROVED',
  },
  {
    id: 'hist_10',
    weekNumber: 10,
    subjectCode: 'CS3591',
    subjectName: 'Computer Networks',
    classSection: '1st Year SEC-B',
    dateRange: '01/07/2026 - 06/07/2026',
    unit: 'Unit 3',
    topicsCovered: 'Network Layer Architecture, IPv4 and IPv6 Addressing',
    periodsPlanned: 4,
    periodsHandled: 3,
    percent: 68,
    status: 'APPROVED',
  },
  {
    id: 'hist_9',
    weekNumber: 9,
    subjectCode: 'CS3591',
    subjectName: 'Computer Networks',
    classSection: '1st Year SEC-B',
    dateRange: '24/06/2026 - 29/06/2026',
    unit: 'Unit 2',
    topicsCovered: 'Data Link Layer, Framing, Error Detection (CRC)',
    periodsPlanned: 4,
    periodsHandled: 4,
    percent: 60,
    status: 'APPROVED',
  },
];

export const ReportHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [historyLogs, setHistoryLogs] = useState<HistoryLogItem[]>(SAMPLE_HISTORY);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Syllabus Log History</Text>
        <Text style={styles.headerSub}>
          Chronological audit of all your submitted weekly course coverage logs and verified periods.
        </Text>
      </View>

      {/* History Items */}
      {historyLogs.map((log) => {
        const isFull = log.periodsHandled >= log.periodsPlanned;
        return (
          <Card key={log.id} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.weekBadge}>
                  <Text style={styles.weekBadgeText}>Week {log.weekNumber}</Text>
                </View>
                <View style={styles.dateBox}>
                  <Feather name="calendar" size={13} color="#64748B" />
                  <Text style={styles.dateText}>{log.dateRange}</Text>
                </View>
              </View>

              <Text style={styles.subjectTitle}>
                {log.subjectCode} · {log.subjectName}
              </Text>
              <Text style={styles.classSub}>{log.classSection} · {log.unit}</Text>

              <View style={styles.topicsBox}>
                <Text style={styles.topicsLabel}>Covered Topics:</Text>
                <Text style={styles.topicsText}>{log.topicsCovered}</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCol}>
                  <Text style={styles.statVal}>
                    {log.periodsHandled}/{log.periodsPlanned}
                  </Text>
                  <Text style={styles.statLabel}>Periods Handled</Text>
                </View>

                <View style={styles.statCol}>
                  <Text style={[styles.statVal, { color: Palette.primary }]}>
                    {log.percent}%
                  </Text>
                  <Text style={styles.statLabel}>Cumulative Progress</Text>
                </View>

                <View style={styles.statCol}>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: isFull ? '#ECFDF5' : '#FFFBEB' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: isFull ? Palette.success : Palette.warning },
                      ]}
                    >
                      {isFull ? 'ON PLAN' : 'LAGGING'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <ProgressBar
                  progress={log.percent / 100}
                  color={Palette.primary}
                  style={styles.progressBar}
                />
                <Button
                  mode="text"
                  compact
                  icon="open-in-new"
                  onPress={() =>
                    navigation.navigate('WeeklyProgress', {
                      subjectCode: log.subjectCode,
                      weekNumber: log.weekNumber,
                      classSection: log.classSection,
                    })
                  }
                  textColor={Palette.primary}
                >
                  View / Edit
                </Button>
              </View>
            </Card.Content>
          </Card>
        );
      })}
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
  header: {
    marginBottom: ms(16),
  },
  headerTitle: {
    fontSize: ms(20),
    fontWeight: '900',
    color: Palette.textDark,
  },
  headerSub: {
    fontSize: ms(12.5),
    color: Palette.textLight,
    marginTop: ms(2),
    lineHeight: ms(18),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    marginBottom: ms(14),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(8),
  },
  weekBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: ms(10),
    paddingVertical: ms(3),
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  weekBadgeText: {
    fontSize: ms(12),
    fontWeight: '800',
    color: Palette.primary,
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: ms(12),
    color: '#64748B',
    marginLeft: ms(4),
    fontWeight: '500',
  },
  subjectTitle: {
    fontSize: ms(15),
    fontWeight: '800',
    color: Palette.textDark,
  },
  classSub: {
    fontSize: ms(12.5),
    color: Palette.primary,
    fontWeight: '700',
    marginTop: ms(2),
  },
  topicsBox: {
    backgroundColor: '#F8FAFC',
    padding: ms(10),
    borderRadius: ms(10),
    marginTop: ms(10),
  },
  topicsLabel: {
    fontSize: ms(11),
    fontWeight: '800',
    color: Palette.textLight,
    textTransform: 'uppercase',
  },
  topicsText: {
    fontSize: ms(12.5),
    color: '#334155',
    marginTop: ms(2),
    lineHeight: ms(17),
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: ms(12),
    paddingTop: ms(8),
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: ms(15),
    fontWeight: '900',
    color: Palette.textDark,
  },
  statLabel: {
    fontSize: ms(11),
    color: Palette.textLight,
    marginTop: ms(2),
  },
  statusPill: {
    paddingHorizontal: ms(10),
    paddingVertical: ms(4),
    borderRadius: ms(8),
  },
  statusPillText: {
    fontSize: ms(11),
    fontWeight: '800',
  },
  cardFooter: {
    marginTop: ms(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: '#E2E8F0',
    marginRight: ms(12),
  },
});

export default ReportHistoryScreen;
