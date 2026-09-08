import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useReportStore, ConsolidatedReport } from '../store/useReportStore';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
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
    // If not submitted yet, parse details from reportId e.g. "3rd Year CSE-A_W12" or similar
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
        <MaterialCommunityIcons name="file-cancel-outline" size={64} color={Palette.textLight} />
        <Text style={styles.errorTitle}>Report Not Found</Text>
        <Text style={styles.errorSub}>The requested report could not be loaded.</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backBtn}>
          Go Back
        </Button>
      </View>
    );
  }

  const { classId, weekNumber, overallCoverage, subjects, ccRemarks, status } = report;

  // Calculate layout variables
  const sectionChar = classId.split('-')[1] || 'A';
  const displayClass = classId.includes('CSE') ? 'III Year / V Semester' : 'II Year / III Semester';
  const displayDept = classId.includes('CSE') ? 'Computer Science and Engineering' : 'Computer Science and Business Systems (CSBS)';

  const getDates = (week: number) => {
    const baseDate = new Date(2024, 4, 20); // 20 May 2024 (months are 0-indexed)
    const weeksDiff = week - 5;
    const startDate = new Date(baseDate.getTime() + weeksDiff * 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);

    const formatDate = (d: Date) => {
      const dd = d.getDate().toString().padStart(2, '0');
      const mm = (d.getMonth() + 1).toString().padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    };

    return {
      from: formatDate(startDate),
      to: formatDate(endDate),
    };
  };

  const dates = getDates(weekNumber);

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const html = generateReportHTML(report);
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
      const uri = await generateReportWord(report);
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
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name="file-document-multiple-outline" size={32} color="#0F52BA" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Export Syllabus Report</Text>
              <Text style={styles.subtitle}>
                Class: {classId} · Week {weekNumber}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Overall Coverage:</Text>
            <Text style={styles.metaVal}>{overallCoverage}%</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Subjects Included:</Text>
            <Text style={styles.metaVal}>{subjects.length}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Report Status:</Text>
            <Text style={[styles.metaVal, { color: Palette.primary, fontWeight: '800' }]}>{status}</Text>
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.desc}>
            This action compiles the weekly course coverage statistics and planned syllabus topics into a standardized document ready for printing or institutional submission.
          </Text>

          <Button
            mode="contained"
            icon="file-pdf-box"
            style={styles.exportBtn}
            labelStyle={styles.btnLabel}
            onPress={handleExportPDF}
            disabled={isExporting}
          >
            {isExportingPDF ? 'Generating PDF...' : 'Share / Export PDF Report'}
          </Button>

          <Button
            mode="contained"
            icon="file-word-box"
            style={[styles.exportBtn, { backgroundColor: '#2B579A', marginTop: ms(12) }]}
            labelStyle={styles.btnLabel}
            onPress={handleExportWord}
            disabled={isExporting}
          >
            {isExportingWord ? 'Generating DOCX...' : 'Share / Export Word Report'}
          </Button>

          {isExporting && (
            <ActivityIndicator size="small" color={Palette.primary} style={{ marginTop: ms(12) }} />
          )}
        </Card.Content>
      </Card>
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
    justifyContent: 'center',
    minHeight: '80%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(6) },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardContent: {
    padding: ms(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    backgroundColor: '#FEF2F2',
    padding: ms(12),
    borderRadius: ms(14),
  },
  headerText: {
    marginLeft: ms(16),
    flex: 1,
  },
  title: {
    fontSize: ms(18),
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: ms(12),
    color: '#64748B',
    marginTop: ms(2),
  },
  divider: {
    marginVertical: ms(18),
    backgroundColor: '#E2E8F0',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: ms(4),
  },
  metaLabel: {
    fontSize: ms(13),
    color: '#64748B',
    fontWeight: '500',
  },
  metaVal: {
    fontSize: ms(13),
    color: '#0F172A',
    fontWeight: '700',
  },
  desc: {
    fontSize: ms(12),
    color: '#64748B',
    lineHeight: 1.8,
    textAlign: 'center',
    marginBottom: ms(8),
  },
  exportBtn: {
    marginTop: ms(16),
    backgroundColor: '#0F52BA',
    borderRadius: ms(12),
    paddingVertical: ms(6),
  },
  btnLabel: {
    fontSize: ms(14),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ms(32),
    backgroundColor: '#F8FAFC',
  },
  errorTitle: {
    fontSize: ms(18),
    fontWeight: '800',
    color: Palette.textDark,
    marginTop: ms(16),
  },
  errorSub: {
    fontSize: ms(13),
    color: Palette.textLight,
    marginTop: ms(4),
    textAlign: 'center',
  },
  backBtn: {
    marginTop: ms(20),
    borderRadius: ms(10),
    backgroundColor: Palette.primary,
  },
});

export default ReportExportScreen;
