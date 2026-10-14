import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useReportStore, ConsolidatedReport } from '../store/useReportStore';
import { EditorialColors, EditorialFonts, EditorialSpacing } from '@theme/editorial';
import { Rule } from '@components/editorial/Rule';
import { Label } from '@components/editorial/Label';
import { StatRow } from '@components/editorial/StatRow';
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
        <Label text="ERROR" color={EditorialColors.accent} />
        <Text style={styles.errorTitle}>REPORT NOT FOUND.</Text>
        <Text style={styles.errorSub}>The requested report could not be located in local memory.</Text>
        <View style={styles.buttonSpacing}>
          <AppButton mode="contained" title="RETURN" onPress={() => navigation.goBack()} />
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── HEADER ── */}
      <View style={styles.headerBox}>
        <Label text="DOCUMENT GENERATION" />
        <Text style={styles.headingText}>SYLLABUS REPORT EXPORT.</Text>
        <Text style={styles.subHeadingText}>
          CLASS: {classId.toUpperCase()} · ACADEMIC WEEK {weekNumber}
        </Text>
      </View>
      <Rule thick style={styles.heroRule} />

      {/* ── METRIC SNAPSHOT ── */}
      <View style={styles.statBox}>
        <StatRow
          columns={[
            { label: 'OVERALL COVERAGE', value: `${overallCoverage}%` },
            { label: 'COURSES AUDITED', value: `${subjects.length}` },
            { label: 'STATUS', value: status },
          ]}
        />
      </View>

      {/* ── EXPORT OPTIONS BLOCK ── */}
      <View style={styles.formBlock}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionNumber}>01</Text>
          <Text style={styles.sectionTitle}>OFFICIAL DOSSIER GENERATION</Text>
        </View>

        <Text style={styles.desc}>
          This action compiles weekly syllabus metrics, topic completion logs, and coordinator remarks into Anna University regulation-compliant documentation for departmental filing or institutional inspection.
        </Text>

        <View style={styles.buttonSpacing}>
          <AppButton
            mode="contained"
            title={isExportingPDF ? 'GENERATING PDF...' : 'EXPORT PDF REPORT'}
            onPress={handleExportPDF}
            loading={isExportingPDF}
            disabled={isExporting}
          />
        </View>

        <View style={styles.buttonSpacing}>
          <AppButton
            mode="outline"
            title={isExportingWord ? 'GENERATING WORD...' : 'EXPORT WORD REPORT (.DOCX)'}
            onPress={handleExportWord}
            loading={isExportingWord}
            disabled={isExporting}
          />
        </View>

        {isExporting && (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color={EditorialColors.ink} />
          </View>
        )}
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
    paddingHorizontal: EditorialSpacing.screenHorizontal,
    paddingTop: EditorialSpacing.topSafeArea,
    paddingBottom: ms(48),
  },
  headerBox: {
    marginBottom: ms(8),
  },
  headingText: {
    fontFamily: EditorialFonts.display,
    fontSize: ms(24),
    lineHeight: ms(28),
    color: EditorialColors.ink,
    marginTop: ms(4),
  },
  subHeadingText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: ms(11),
    color: EditorialColors.muted,
    letterSpacing: 0.5,
    marginTop: ms(4),
  },
  heroRule: {
    marginBottom: ms(20),
  },
  statBox: {
    marginBottom: ms(20),
  },
  formBlock: {
    backgroundColor: EditorialColors.white,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    padding: ms(16),
    marginBottom: ms(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderBottomWidth: 1,
    borderBottomColor: EditorialColors.ink,
    paddingBottom: ms(8),
    marginBottom: ms(12),
  },
  sectionNumber: {
    fontFamily: EditorialFonts.display,
    fontSize: ms(18),
    color: EditorialColors.accent,
    marginRight: ms(8),
  },
  sectionTitle: {
    fontFamily: EditorialFonts.bold,
    fontSize: ms(13),
    letterSpacing: 1,
    color: EditorialColors.ink,
  },
  desc: {
    fontFamily: EditorialFonts.regular,
    fontSize: ms(12),
    lineHeight: ms(18),
    color: EditorialColors.muted,
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
    backgroundColor: EditorialColors.bg,
  },
  errorTitle: {
    fontFamily: EditorialFonts.display,
    fontSize: ms(20),
    color: EditorialColors.ink,
    marginTop: ms(8),
  },
  errorSub: {
    fontFamily: EditorialFonts.regular,
    fontSize: ms(13),
    color: EditorialColors.muted,
    marginTop: ms(4),
    textAlign: 'center',
  },
});

export default ReportExportScreen;

