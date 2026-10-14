import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { SegBar } from '@components/editorial/SegBar';

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
      <StatusBar barStyle="dark-content" backgroundColor={EditorialColors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, EditorialSpacing.topSafeArea),
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Label text="AUDIT & LOG ARCHIVE" />
          <Text style={styles.headerTitle}>
            REPORT HISTORY<Text style={styles.accentDot}>.</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Chronological audit of verified weekly syllabus coverage and classroom periods.
          </Text>
        </View>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* 3-Column Stat Row */}
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{historyLogs.length}</Text>
            <Label text="WEEKS" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>
              {historyLogs.reduce((acc, h) => acc + h.periodsHandled, 0)}
            </Text>
            <Label text="PERIODS" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>80%</Text>
            <Label text="LATEST" />
          </View>
        </View>

        {/* 1px Hairline Rule */}
        <Rule thickness="hairline" style={styles.hairlineSpacer} />

        {/* Section Title */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>CHRONOLOGICAL LOGS</Text>
          <Label text={`${historyLogs.length} SUBMISSIONS`} />
        </View>

        {/* History Rows */}
        <View style={styles.logList}>
          {historyLogs.map((log) => {
            const isLagging = log.percent < 40;
            return (
              <View key={log.id} style={styles.logRow}>
                <View style={styles.rowTop}>
                  {/* Left Week Date Column */}
                  <View style={styles.weekDateCol}>
                    <Text style={styles.weekNum}>{log.weekNumber}</Text>
                    <Label text="WEEK" />
                  </View>

                  {/* Vertical Divider */}
                  <View style={styles.vertDivider} />

                  {/* Log Content Info */}
                  <View style={styles.infoCol}>
                    <View style={styles.codeRow}>
                      <Text style={styles.subjectCode}>{log.subjectCode}</Text>
                      <Text style={styles.sectionMeta}>{log.classSection} • {log.unit}</Text>
                    </View>
                    <Text style={styles.subjectName}>{log.subjectName}</Text>
                    <Text style={styles.topicsText} numberOfLines={2}>
                      {log.topicsCovered}
                    </Text>
                    <Label
                      text={`${log.dateRange} • ${log.periodsHandled}/${log.periodsPlanned} PERIODS`}
                      style={styles.metaLabel}
                    />
                  </View>

                  {/* Right Percentage */}
                  <View style={styles.rightValueBox}>
                    <Text
                      style={[
                        styles.percentText,
                        isLagging ? styles.accentPercentText : null,
                      ]}
                    >
                      {log.percent}%
                    </Text>
                  </View>
                </View>

                {/* 25-Segment Bar */}
                <View style={styles.segBarWrapper}>
                  <SegBar
                    totalSegments={25}
                    filledSegments={Math.round((log.percent / 100) * 25)}
                    isLagging={isLagging}
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
    backgroundColor: EditorialColors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
  },
  content: {
    paddingHorizontal: EditorialSpacing.screenHorizontal,
  },
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: EditorialFonts.display,
    fontSize: 36,
    lineHeight: 40,
    color: EditorialColors.ink,
    letterSpacing: -0.5,
    marginTop: 4,
    marginBottom: 4,
  },
  accentDot: {
    color: EditorialColors.accent,
  },
  headerSubtitle: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    color: EditorialColors.muted,
    lineHeight: 18,
  },
  heavySpacer: {
    marginVertical: 18,
  },
  hairlineSpacer: {
    marginVertical: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: EditorialFonts.display,
    fontSize: 30,
    lineHeight: 34,
    color: EditorialColors.ink,
    marginBottom: 2,
  },
  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: EditorialColors.ink,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.ink,
  },
  logList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
  },
  logRow: {
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.ink,
    paddingVertical: 14,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  weekDateCol: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNum: {
    fontFamily: EditorialFonts.display,
    fontSize: 28,
    lineHeight: 32,
    color: EditorialColors.ink,
    marginBottom: 2,
  },
  vertDivider: {
    width: 1,
    height: 52,
    backgroundColor: EditorialColors.ink,
    marginHorizontal: 12,
  },
  infoCol: {
    flex: 1,
    marginRight: 10,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  subjectCode: {
    fontFamily: EditorialFonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    color: EditorialColors.muted,
  },
  sectionMeta: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
  },
  subjectName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 16,
    lineHeight: 20,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  topicsText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: EditorialColors.muted,
    marginBottom: 4,
  },
  metaLabel: {
    letterSpacing: 1.5,
  },
  rightValueBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  percentText: {
    fontFamily: EditorialFonts.display,
    fontSize: 28,
    lineHeight: 32,
    color: EditorialColors.ink,
  },
  accentPercentText: {
    color: EditorialColors.accent,
  },
  segBarWrapper: {
    marginTop: 2,
  },
});
