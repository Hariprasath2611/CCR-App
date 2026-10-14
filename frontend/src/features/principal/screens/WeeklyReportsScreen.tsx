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
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { SegBar } from '@components/editorial/SegBar';

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
        <StatusBar barStyle="dark-content" backgroundColor={EditorialColors.bg} />
        <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, EditorialSpacing.topSafeArea) }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedReport(null)}
            activeOpacity={0.7}
            accessibilityLabel="Back to queue"
          >
            <Feather name="arrow-left" size={20} color={EditorialColors.ink} />
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
              <Text style={styles.primaryActionBtnText}>EXPORT PDF</Text>
              <Feather name="download" size={16} color={EditorialColors.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineActionBtn}
              onPress={() => handleExportWord(selectedReport)}
              activeOpacity={0.7}
            >
              <Text style={styles.outlineActionBtnText}>EXPORT WORD</Text>
              <Feather name="file-text" size={16} color={EditorialColors.ink} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

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
          <Label text="CENTRAL ADMINISTRATION" />
          <Text style={styles.headerTitle}>
            EXECUTIVE AUDIT<Text style={styles.accentDot}>.</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Consolidated weekly syllabus reports approved by HODs and ready for Principal signature.
          </Text>
        </View>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>FORWARDED SUBMISSIONS</Text>
          <Label text={`${adminReports.length} REPORTS`} />
        </View>

        {/* Reports List */}
        {adminReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>AUDITING QUEUE EMPTY</Text>
            <Text style={styles.emptySub}>
              No weekly course reports have been forwarded by HODs yet.
            </Text>
          </View>
        ) : (
          <View style={styles.reportList}>
            {adminReports.map((report) => {
              const isLagging = report.overallCoverage < 75;
              return (
                <View key={report.id} style={styles.reportRow}>
                  <View style={styles.rowTop}>
                    <View style={styles.infoCol}>
                      <View style={styles.badgeRow}>
                        <View style={styles.classBadge}>
                          <Text style={styles.classBadgeText}>{report.classId}</Text>
                        </View>
                        <Label text={`WEEK ${report.weekNumber}`} />
                      </View>
                      <Text style={styles.reportTitle}>
                        Week {report.weekNumber} Academic Submission
                      </Text>
                      <Label
                        text={`BY: ${report.submittedBy?.toUpperCase()} • APPROVED: ${report.approvedAt || 'PENDING'}`}
                        style={styles.metaLabel}
                      />
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

                  {/* 25-Segment Bar */}
                  <View style={styles.segBarWrapper}>
                    <SegBar
                      totalSegments={25}
                      filledSegments={Math.round((report.overallCoverage / 100) * 25)}
                      isLagging={isLagging}
                    />
                  </View>

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
                      <Text style={styles.auditBtnText}>AUDIT REPORT</Text>
                      <Feather name="arrow-right" size={14} color={EditorialColors.white} />
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
    backgroundColor: EditorialColors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
  },
  content: {
    paddingHorizontal: EditorialSpacing.screenHorizontal,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: EditorialSpacing.screenHorizontal,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    backgroundColor: EditorialColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeaderTag: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
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
    fontSize: 12,
    color: EditorialColors.muted,
    lineHeight: 18,
  },
  heavySpacer: {
    marginVertical: 18,
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
  reportList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
  },
  reportRow: {
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.ink,
    paddingVertical: 16,
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
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  classBadgeText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 10,
    color: EditorialColors.ink,
  },
  reportTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 16,
    lineHeight: 20,
    color: EditorialColors.ink,
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
    marginBottom: 10,
  },
  remarksBlock: {
    borderLeftWidth: 2,
    borderLeftColor: EditorialColors.ink,
    paddingLeft: 10,
    marginVertical: 8,
  },
  remarksText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: EditorialColors.muted,
    fontStyle: 'italic',
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  auditBtn: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  auditBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.white,
  },
  detailActions: {
    gap: 12,
    marginTop: 20,
  },
  primaryActionBtn: {
    height: 54,
    width: '100%',
    backgroundColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  primaryActionBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.white,
  },
  outlineActionBtn: {
    height: 54,
    width: '100%',
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  outlineActionBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.ink,
  },
  emptyContainer: {
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 14,
    letterSpacing: 2,
    color: EditorialColors.ink,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
