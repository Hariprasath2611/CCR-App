import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar, Alert } from 'react-native';
import { useReportStore, ConsolidatedReport } from '../../cc/store/useReportStore';
import { WeeklyCourseCoverageReportCard } from '../../cc/components/WeeklyCourseCoverageReportCard';
import { Feather } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateReportHTML } from '@services/api/reportPdfTemplate';
import { generateReportWord } from '@services/api/reportWordTemplate';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { Label } from '@components/editorial/Label';
import { ProgressBar } from '@components/editorial/ProgressBar';

export const WeeklyReportsScreen = () => {
  const insets = useSafeAreaInsets();
  const reports = useReportStore((state) => state.reports);
  const adminReports = reports.filter((r) => r.status === 'SENT_TO_ADMIN');

  const [selectedReport, setSelectedReport] = useState<ConsolidatedReport | null>(null);

  const handleExportPDF = async (rep: ConsolidatedReport) => {
    try {
      const html = generateReportHTML(rep);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (err) {
      Alert.alert('Export Failed', 'An error occurred while generating the PDF.');
    }
  };

  const handleExportWord = async (rep: ConsolidatedReport) => {
    try {
      const uri = await generateReportWord(rep);
      await Sharing.shareAsync(uri, {
        UTI: 'com.microsoft.word.doc',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    } catch (err) {
      Alert.alert('Export Failed', 'An error occurred while generating the Word document.');
    }
  };

  const handleExportReport = (rep: ConsolidatedReport) => {
    Alert.alert(
      'Export Report',
      'Choose a file format to export the weekly course coverage report:',
      [
        { text: 'PDF Document', onPress: () => handleExportPDF(rep) },
        { text: 'Word Document (DOCX)', onPress: () => handleExportWord(rep) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  if (selectedReport) {
    return (
      <View style={styles.screenWrapper}>
        <StatusBar barStyle="dark-content" backgroundColor={DayRibbonColors.bg} />
        <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, DayRibbonSpacing.topSafeArea) }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedReport(null)}
            activeOpacity={0.7}
            accessibilityLabel="Back to queue"
          >
            <Feather name="arrow-left" size={20} color={DayRibbonColors.ink} />
          </TouchableOpacity>
          <Text style={styles.topHeaderTag}>AUDIT REPORT</Text>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <WeeklyCourseCoverageReportCard
            report={selectedReport}
            showDownloadButton={true}
            onDownloadPress={() => handleExportReport(selectedReport)}
          />

          <View style={styles.detailActions}>
            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={() => handleExportPDF(selectedReport)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionBtnText}>Export PDF</Text>
              <Feather name="download" size={16} color={DayRibbonColors.surface} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineActionBtn}
              onPress={() => handleExportWord(selectedReport)}
              activeOpacity={0.7}
            >
              <Text style={styles.outlineActionBtnText}>Export Word</Text>
              <Feather name="file-text" size={16} color={DayRibbonColors.ink} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screenWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor={DayRibbonColors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, DayRibbonSpacing.topSafeArea),
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Label text="CENTRAL ADMINISTRATION" />
          <Text style={styles.headerTitle}>Executive Audit</Text>
          <Text style={styles.headerSubtitle}>
            Consolidated weekly syllabus reports approved by HODs and ready for Principal signature.
          </Text>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>FORWARDED SUBMISSIONS</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{adminReports.length} REPORTS</Text>
          </View>
        </View>

        {/* Reports List */}
        {adminReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="inbox" size={24} color={DayRibbonColors.muted} />
            </View>
            <Text style={styles.emptyTitle}>Auditing Queue Empty</Text>
            <Text style={styles.emptySub}>
              No weekly course reports have been forwarded by HODs yet.
            </Text>
          </View>
        ) : (
          <View style={styles.reportList}>
            {adminReports.map((report) => {
              const isLagging = report.overallCoverage < 75;
              return (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.rowTop}>
                    <View style={styles.infoCol}>
                      <View style={styles.badgeRow}>
                        <View style={styles.classBadge}>
                          <Text style={styles.classBadgeText}>{report.classId}</Text>
                        </View>
                        <Text style={styles.weekTag}>Week {report.weekNumber}</Text>
                      </View>
                      <Text style={styles.reportTitle}>
                        Week {report.weekNumber} Academic Submission
                      </Text>
                      <Text style={styles.metaLabel}>
                        By: {report.submittedBy} • Approved: {report.approvedAt || 'Pending'}
                      </Text>
                    </View>

                    <View style={styles.rightValueBox}>
                      <Text
                        style={[
                          styles.percentText,
                          isLagging ? styles.accentPercentText : null,
                        ]}
                      >
                        {report.overallCoverage}%
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <ProgressBar
                    progress={report.overallCoverage / 100}
                    isLagging={isLagging}
                    style={styles.progressSpacing}
                  />

                  {/* HOD Remarks */}
                  {report.hodRemarks ? (
                    <View style={styles.remarksBlock}>
                      <Text style={styles.remarksText}>
                        "{report.hodRemarks}"
                      </Text>
                    </View>
                  ) : null}

                  {/* Row Actions */}
                  <View style={styles.rowActions}>
                    <TouchableOpacity
                      style={styles.auditBtn}
                      onPress={() => setSelectedReport(report)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.auditBtnText}>Audit Report</Text>
                      <Feather name="arrow-right" size={14} color={DayRibbonColors.surface} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeaderTag: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    letterSpacing: 1.5,
    color: DayRibbonColors.muted,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: DayRibbonColors.ink,
    marginTop: 4,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    letterSpacing: 1.2,
    color: DayRibbonColors.ink,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: DayRibbonShapes.chipRadius,
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  countBadgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.muted,
  },
  reportList: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 16,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoCol: {
    flex: 1,
    marginRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  classBadge: {
    backgroundColor: DayRibbonColors.bg,
    borderRadius: DayRibbonShapes.chipRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  classBadgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.ink,
  },
  weekTag: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    color: DayRibbonColors.muted,
  },
  reportTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    lineHeight: 22,
    color: DayRibbonColors.ink,
    marginBottom: 2,
  },
  metaLabel: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  rightValueBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  percentText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 26,
    lineHeight: 30,
    color: DayRibbonColors.cobalt,
  },
  accentPercentText: {
    color: DayRibbonColors.warn,
  },
  progressSpacing: {
    marginTop: 4,
    marginBottom: 10,
  },
  remarksBlock: {
    backgroundColor: DayRibbonColors.bg,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: DayRibbonColors.cobalt,
    padding: 10,
    marginVertical: 8,
  },
  remarksText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    lineHeight: 16,
    color: DayRibbonColors.ink,
    fontStyle: 'italic',
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  auditBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: DayRibbonColors.cobalt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  auditBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.surface,
  },
  detailActions: {
    gap: 12,
    marginTop: 20,
  },
  primaryActionBtn: {
    height: 52,
    width: '100%',
    borderRadius: DayRibbonShapes.buttonRadius,
    backgroundColor: DayRibbonColors.cobalt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryActionBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.surface,
  },
  outlineActionBtn: {
    height: 52,
    width: '100%',
    borderRadius: DayRibbonShapes.buttonRadius,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  outlineActionBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.ink,
  },
  emptyContainer: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DayRibbonColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 18,
    color: DayRibbonColors.ink,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
