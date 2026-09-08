import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Button, Divider } from 'react-native-paper';
import { useReportStore, ConsolidatedReport } from '../../cc/store/useReportStore';
import { WeeklyCourseCoverageReportCard } from '../../cc/components/WeeklyCourseCoverageReportCard';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { generateReportHTML } from '@services/api/reportPdfTemplate';
import { generateReportWord } from '@services/api/reportWordTemplate';

import { ms } from '@theme/responsive';

export const WeeklyReportsScreen = () => {
  const reports = useReportStore((state) => state.reports);
  const adminReports = reports.filter((r) => r.status === 'SENT_TO_ADMIN');

  const [selectedReport, setSelectedReport] = useState<ConsolidatedReport | null>(null);

  const handleExportPDF = async (rep: ConsolidatedReport) => {
    try {
      const html = generateReportHTML(rep);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (err) {
      console.error('Failed to export PDF:', err);
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
      console.error('Failed to export Word:', err);
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

  const getProgressColor = (pct: number) => {
    if (pct >= 75) return Palette.success;
    if (pct >= 50) return Palette.warning;
    return Palette.error;
  };

  if (selectedReport) {
    return (
      <View style={styles.container}>
        {/* Back navigation header */}
        <TouchableOpacity
          style={styles.backHeader}
          onPress={() => setSelectedReport(null)}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#0F52BA" />
          <Text style={styles.backText}>Go back to Auditing Queue</Text>
        </TouchableOpacity>

        <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
          <WeeklyCourseCoverageReportCard 
            report={selectedReport} 
            showDownloadButton={true} 
            onDownloadPress={() => handleExportReport(selectedReport)}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Course Coverage Auditing</Text>
      <Text style={styles.pageSubtitle}>
        Consolidated weekly syllabus sheets approved by HODs and ready for Principal signature.
      </Text>

      {adminReports.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <MaterialCommunityIcons name="file-multiple-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Auditing Queue Empty</Text>
            <Text style={styles.emptySub}>No weekly course reports have been forwarded by HODs yet.</Text>
          </Card.Content>
        </Card>
      ) : (
        adminReports.map((report) => (
          <Card key={report.id} style={styles.reportRowCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.classTitle}>{report.classId} · Week {report.weekNumber}</Text>
                  <Text style={styles.submittedBy}>Submitted by: {report.submittedBy}</Text>
                </View>
                <Chip
                  compact
                  style={[styles.coverageChip, { backgroundColor: getProgressColor(report.overallCoverage) + '15' }]}
                  textStyle={{ color: getProgressColor(report.overallCoverage), fontWeight: 'bold' }}
                >
                  {report.overallCoverage}% Avg
                </Chip>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.hodFeedbackBox}>
                <Text style={styles.feedbackTitle}>HOD Remarks & Approval Signature:</Text>
                <Text style={styles.feedbackContent}>
                  "{report.hodRemarks || 'Approved and signed with no additional remarks.'}"
                </Text>
                <Text style={styles.feedbackDate}>Approved Date: {report.approvedAt}</Text>
              </View>

              <Button
                mode="contained"
                icon="file-search-outline"
                style={styles.auditBtn}
                labelStyle={styles.auditBtnLabel}
                onPress={() => setSelectedReport(report)}
              >
                Audit Report Document
              </Button>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Premium off-white workspace canvas
  },
  content: {
    padding: ms(16),
    paddingBottom: ms(32),
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: ms(16),
    paddingBottom: ms(32),
  },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ms(14),
    paddingHorizontal: ms(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backText: {
    fontSize: ms(14),
    fontWeight: '700',
    color: '#0F52BA',
    marginLeft: ms(8),
  },
  pageTitle: {
    fontSize: ms(22),
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: ms(10),
  },
  pageSubtitle: {
    fontSize: ms(13),
    color: '#64748B',
    marginBottom: ms(20),
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: ms(20),
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ms(32),
  },
  emptyTitle: {
    fontSize: ms(16),
    fontWeight: 'bold',
    color: '#475569',
    marginTop: ms(12),
  },
  emptySub: {
    fontSize: ms(12),
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: ms(4),
    paddingHorizontal: ms(20),
  },
  reportRowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: ms(16),
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(2) },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classTitle: {
    fontSize: ms(18),
    fontWeight: 'bold',
    color: '#1E293B',
  },
  submittedBy: {
    fontSize: ms(12),
    color: '#64748B',
    marginTop: ms(2),
  },
  coverageChip: {
    alignSelf: 'center',
  },
  divider: {
    marginVertical: ms(12),
    backgroundColor: '#F1F5F9',
  },
  hodFeedbackBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: ms(10),
    padding: ms(10),
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    marginBottom: ms(12),
  },
  feedbackTitle: {
    fontSize: ms(10),
    fontWeight: '800',
    color: '#10B981',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  feedbackContent: {
    fontSize: ms(13),
    color: '#334155',
    fontStyle: 'italic',
    marginTop: ms(4),
    lineHeight: 18,
  },
  feedbackDate: {
    fontSize: ms(11),
    color: '#94A3B8',
    marginTop: ms(6),
  },
  auditBtn: {
    backgroundColor: '#0F52BA',
    borderRadius: ms(12),
    paddingVertical: ms(2),
  },
  auditBtnLabel: {
    fontSize: ms(13),
    fontWeight: 'bold',
  },
});

export default WeeklyReportsScreen;
