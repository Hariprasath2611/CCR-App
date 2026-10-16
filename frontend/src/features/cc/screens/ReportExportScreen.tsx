import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useReportStore, ConsolidatedReport } from '../store/useReportStore';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { AppButton } from '@components/common/AppButton';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { CCStackParamList } from '@navigation/types';
import { generateReportHTML } from '@services/api/reportPdfTemplate';
import { generateReportWord } from '@services/api/reportWordTemplate';
import { ms } from '@theme/responsive';

type RouteParams = RouteProp<CCStackParamList, 'ReportExport'>;

export const ReportExportScreen = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const reportId = route.params?.reportId;

  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const reports = useReportStore((state) => state.reports);
  const subjectProgressList = useReportStore((state) => state.subjectProgressList);

  // 1. Resolve Report (check compiled reports or compile draft)
  let report = reports.find((r) => r.id === reportId);
  
  if (!report && reportId) {
    const parts = reportId.split('_W');
    if (parts.length === 2) {
      const classId = parts[0];
      const weekNumber = parseInt(parts[1]);
      const subjects = subjectProgressList[`${classId}_${weekNumber}`] || [];
      const averageCoverage = subjects.length > 0 
        ? Math.round(subjects.reduce((sum, s) => sum + s.coverage, 0) / subjects.length) 
        : 0;

      report = {
        id: reportId,
        classId,
        weekNumber,
        overallCoverage: averageCoverage,
        submittedBy: 'Class Coordinator (Draft)',
        submittedAt: new Date().toISOString().split('T')[0],
        ccRemarks: 'Draft weekly report progress spreadsheet.',
        status: 'PENDING_CC',
        subjects,
      };
    }
  }

  if (!report) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorCaption}>ERROR</Text>
        <Text style={styles.errorTitle}>Report Not Found</Text>
        <Text style={styles.errorSub}>The requested report could not be located in local memory.</Text>
        <View style={styles.buttonSpacing}>
          <AppButton mode="contained" title="Return" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  const { classId, weekNumber, overallCoverage, subjects, status } = report;

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const html = generateReportHTML(report!);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (err) {
      console.error('Failed to export PDF:', err);
      Alert.alert('Export Failed', 'An error occurred while generating the PDF.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportWord = async () => {
    setIsExportingWord(true);
    try {
      const uri = await generateReportWord(report!);
      await Sharing.shareAsync(uri, {
        UTI: 'com.microsoft.word.doc',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    } catch (err) {
      console.error('Failed to export Word:', err);
      Alert.alert('Export Failed', 'An error occurred while generating the Word document.');
    } finally {
      setIsExportingWord(false);
    }
  };

  const isExporting = isExportingPDF || isExportingWord;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={styles.headerBox}>
        <Text style={styles.captionText}>DOCUMENT GENERATION</Text>
        <Text style={styles.headingText}>Syllabus Report Export</Text>
        <Text style={styles.subHeadingText}>
          {classId} · Academic Week {weekNumber}
        </Text>
      </View>

      {/* ── METRIC SNAPSHOT ── */}
      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{overallCoverage}%</Text>
          <Text style={styles.statLabel}>Coverage</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{subjects.length}</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, styles.statusVal]} numberOfLines={1}>
            {status === 'APPROVED_BY_HOD' ? 'Approved' : 'Pending'}
          </Text>
          <Text style={styles.statLabel}>Status</Text>
        </View>
      </View>

      {/* ── EXPORT OPTIONS BLOCK ── */}
      <View style={styles.formBlock}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Official Dossier Generation</Text>
        </View>

        <Text style={styles.desc}>
          This action compiles weekly syllabus metrics, topic completion logs, and coordinator remarks into Anna University regulation-compliant documentation for departmental filing or institutional inspection.
        </Text>

        <View style={styles.buttonSpacing}>
          <AppButton
            mode="contained"
            title={isExportingPDF ? 'Generating PDF...' : 'Export PDF Report'}
            onPress={handleExportPDF}
            loading={isExportingPDF}
            disabled={isExporting}
          />
        </View>

        <View style={styles.buttonSpacing}>
          <AppButton
            mode="outlined"
            title={isExportingWord ? 'Generating Word...' : 'Export Word Report (.docx)'}
            onPress={handleExportWord}
            loading={isExportingWord}
            disabled={isExporting}
          />
        </View>

        {isExporting && (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color={DayRibbonColors.cobalt} />
          </View>
        )}
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
    fontSize: ms(22),
    color: DayRibbonColors.cobalt,
    marginBottom: ms(2),
  },
  statusVal: {
    fontSize: ms(16),
    color: DayRibbonColors.ink,
  },
  statLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  formBlock: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.radiusCard,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: ms(16),
    marginBottom: ms(24),
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: DayRibbonColors.line,
    paddingBottom: ms(10),
    marginBottom: ms(12),
  },
  sectionTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(15),
    color: DayRibbonColors.ink,
  },
  desc: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    lineHeight: ms(19),
    color: DayRibbonColors.muted,
    marginBottom: ms(16),
  },
  buttonSpacing: {
    marginTop: ms(12),
  },
  loaderBox: {
    marginTop: ms(12),
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ms(24),
    backgroundColor: DayRibbonColors.bg,
  },
  errorCaption: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(11),
    color: DayRibbonColors.warn,
    letterSpacing: 0.5,
  },
  errorTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(22),
    color: DayRibbonColors.ink,
    marginTop: ms(6),
  },
  errorSub: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    color: DayRibbonColors.muted,
    marginTop: ms(4),
    textAlign: 'center',
  },
});

export default ReportExportScreen;
