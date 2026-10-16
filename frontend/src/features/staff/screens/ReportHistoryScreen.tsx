import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { ProgressBar } from '@components/editorial/ProgressBar';
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
  const insets = useSafeAreaInsets();
  const [historyLogs] = useState<HistoryLogItem[]>(SAMPLE_HISTORY);

  return (
    <View style={styles.screenWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor={DayRibbonColors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, DayRibbonSpacing.screenTop),
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.captionText}>AUDIT & LOG ARCHIVE</Text>
          <Text style={styles.headerTitle}>Report History</Text>
          <Text style={styles.headerSubtitle}>
            Chronological audit of verified weekly syllabus coverage and classroom periods.
          </Text>
        </View>

        {/* 3-Column Stat Row in Cards */}
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{historyLogs.length}</Text>
            <Text style={styles.statLabel}>Weeks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>
              {historyLogs.reduce((acc, h) => acc + h.periodsHandled, 0)}
            </Text>
            <Text style={styles.statLabel}>Periods</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: DayRibbonColors.cobalt }]}>80%</Text>
            <Text style={styles.statLabel}>Latest</Text>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>CHRONOLOGICAL LOGS</Text>
          <Text style={styles.sectionBadge}>{historyLogs.length} SUBMISSIONS</Text>
        </View>

        {/* History Rows as Day Ribbon Cards */}
        <View style={styles.logList}>
          {historyLogs.map((log) => {
            const isLagging = log.percent < 75;
            return (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.rowTop}>
                  {/* Left Week Number Block */}
                  <View style={styles.weekDateCol}>
                    <Text style={styles.weekNum}>{log.weekNumber}</Text>
                    <Text style={styles.weekLabel}>WEEK</Text>
                  </View>

                  {/* Vertical Divider */}
                  <View style={styles.vertDivider} />

                  {/* Log Content Info */}
                  <View style={styles.infoCol}>
                    <View style={styles.codeRow}>
                      <Text style={styles.subjectCode}>{log.subjectCode}</Text>
                      <Text style={styles.sectionMeta}>• {log.classSection} • {log.unit}</Text>
                    </View>
                    <Text style={styles.subjectName}>{log.subjectName}</Text>
                    <Text style={styles.topicsText} numberOfLines={2}>
                      {log.topicsCovered}
                    </Text>
                    <Text style={styles.metaLabel}>
                      {log.dateRange} • {log.periodsHandled}/{log.periodsPlanned} periods
                    </Text>
                  </View>

                  {/* Right Percentage */}
                  <View style={styles.rightValueBox}>
                    <Text
                      style={[
                        styles.percentText,
                        isLagging ? styles.warnPercentText : null,
                      ]}
                    >
                      {log.percent}%
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarWrapper}>
                  <ProgressBar
                    percent={log.percent}
                    isBehind={isLagging}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  content: {
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
  },
  header: {
    marginBottom: ms(16),
  },
  captionText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(28),
    color: DayRibbonColors.ink,
    marginTop: ms(4),
    marginBottom: ms(4),
  },
  headerSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    color: DayRibbonColors.muted,
    lineHeight: ms(18),
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
    marginBottom: ms(20),
  },
  statCard: {
    flex: 1,
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.radiusButton,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    paddingVertical: ms(12),
    alignItems: 'center',
  },
  statNum: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(24),
    color: DayRibbonColors.ink,
    marginBottom: ms(2),
  },
  statLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(12),
  },
  sectionHeaderTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(12),
    letterSpacing: 0.5,
    color: DayRibbonColors.ink,
  },
  sectionBadge: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(11),
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
  },
  logList: {
    gap: ms(12),
  },
  logCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.radiusCard,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: ms(16),
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: ms(12),
  },
  weekDateCol: {
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNum: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(26),
    color: DayRibbonColors.cobalt,
    lineHeight: ms(30),
  },
  weekLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(9.5),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    marginTop: ms(2),
  },
  vertDivider: {
    width: 1,
    height: 48,
    backgroundColor: DayRibbonColors.line,
    marginHorizontal: ms(12),
  },
  infoCol: {
    flex: 1,
    marginRight: ms(8),
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    marginBottom: ms(2),
  },
  subjectCode: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(11),
    color: DayRibbonColors.cobalt,
  },
  sectionMeta: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
  },
  subjectName: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(15),
    color: DayRibbonColors.ink,
    marginBottom: ms(3),
  },
  topicsText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(12),
    lineHeight: ms(16),
    color: DayRibbonColors.muted,
    marginBottom: ms(4),
  },
  metaLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
  },
  rightValueBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  percentText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(24),
    color: DayRibbonColors.cobalt,
  },
  warnPercentText: {
    color: DayRibbonColors.warn,
  },
  progressBarWrapper: {
    marginTop: ms(4),
  },
});

export default ReportHistoryScreen;
