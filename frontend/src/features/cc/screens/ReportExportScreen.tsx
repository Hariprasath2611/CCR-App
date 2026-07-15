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

type RouteParams = RouteProp<CCStackParamList, 'ReportExport'>;

export const ReportExportScreen = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const reportId = route.params?.reportId;

  const [isExporting, setIsExporting] = useState(false);
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

  const getBriefTopics = (code: string): string[] => {
    const lookup: Record<string, string[]> = {
      CS3591: ['OSI & TCP/IP Network Models', 'Data Link Layer & Framing', 'Routing Algorithms'],
      CS3501: ['Lexical Analysis & DFA', 'Syntax Analysis & Parsers', 'Syntax Directed Translation'],
      CB3491: ['Symmetric Key Encryption', 'Public Key Cryptography', 'Firewalls & Cyber Security'],
      CS3551: ['Message Passing IPC', 'Distributed File Systems', 'Mutual Exclusion Algorithms'],
      CCS375: ['HTML5 structure & CSS3 styling', 'JavaScript DOM manipulation', 'React Component Architecture'],
      CCS370: ['User Research & Personas', 'Wireframing & Prototyping', 'Usability Testing Methods'],
      MX3084: ['Natural Hazards & Cyclones', 'Mitigation Systems & Plans', 'Risk Assessment Strategies'],
    };
    return lookup[code] || ['Unit syllabus topics covered', 'Weekly planned sub-topics', 'Class presentation session'];
  };

  const totalHours = subjects.reduce((sum, s) => sum + (s.completedTopicsCount * 1.5), 0);

  const generateHTML = () => {
    const tableRowsHtml = subjects.map((subj, index) => {
      const actualTopicsText = subj.topicsCoveredText || '';
      const topics = actualTopicsText
        ? actualTopicsText.split(/[,\n]/).map(t => t.trim()).filter(Boolean)
        : getBriefTopics(subj.code);
      const completedHours = Math.round(subj.completedTopicsCount * 1.5);
      const isCompleted = subj.coverage >= 60;

      const topicsBullets = topics.map(t => `<li>${t}</li>`).join('');

      return `
        <tr>
          <td>${index + 1}</td>
          <td style="font-weight: bold; color: #0F52BA;">${subj.code}</td>
          <td>${subj.name}</td>
          <td>${subj.faculty}</td>
          <td>${completedHours}</td>
          <td><ul style="margin: 0; padding-left: 15px;">${topicsBullets}</ul></td>
          <td style="font-weight: bold; color: ${isCompleted ? '#10B981' : '#EF4444'};">${isCompleted ? 'Yes' : 'No'}</td>
          <td>${isCompleted ? '-' : (subj.reasonsForPending || 'Topics not completed')}</td>
          <td>${subj.extraHoursRequested ? '2' : '-'}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Weekly Course Coverage Report</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 25px; color: #1E293B; background-color: #FFFFFF; }
          .header-box { text-align: center; border-bottom: 2px solid #0F52BA; padding-bottom: 15px; margin-bottom: 25px; }
          .doc-title { font-size: 22px; font-weight: 800; color: #0F52BA; margin: 0; letter-spacing: 0.5px; text-transform: uppercase; }
          .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          .meta-table td { padding: 10px; border: 1px solid #E2E8F0; font-size: 13px; vertical-align: middle; }
          .meta-table td.label { font-weight: bold; background-color: #F8FAFC; width: 20%; color: #475569; }
          .meta-table td.value { width: 30%; color: #1E293B; }
          .data-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .data-table th, .data-table td { border: 1px solid #CBD5E1; padding: 12px 10px; text-align: left; font-size: 12px; }
          .data-table th { background-color: #0F52BA; color: #FFFFFF; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
          .data-table tr:nth-child(even) { background-color: #F8FAFC; }
          .footer-row { font-weight: bold; background-color: #F1F5F9; }
          .remarks-box { border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; background-color: #F8FAFC; margin-top: 20px; }
          .remarks-title { font-weight: bold; font-size: 13px; color: #0F52BA; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
          .remarks-content { font-size: 13px; color: #475569; line-height: 1.6; margin: 0; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <h1 class="doc-title">Weekly Course Coverage Report</h1>
        </div>
        <table class="meta-table">
          <tr>
            <td class="label">Department</td>
            <td class="value">${displayDept}</td>
            <td class="label">Report Week No.</td>
            <td class="value">Week ${weekNumber}</td>
          </tr>
          <tr>
            <td class="label">Class / Sem</td>
            <td class="value">${displayClass}</td>
            <td class="label">From Date</td>
            <td class="value">${dates.from}</td>
          </tr>
          <tr>
            <td class="label">Section</td>
            <td class="value">${sectionChar}</td>
            <td class="label">To Date</td>
            <td class="value">${dates.to}</td>
          </tr>
          <tr>
            <td class="label">Prepared By</td>
            <td class="value">${report.submittedBy || 'Class Coordinator'}</td>
            <td class="label">Overall Coverage</td>
            <td class="value" style="font-weight: bold; color: #0F52BA;">${overallCoverage}%</td>
          </tr>
        </table>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 5%">S.No</th>
              <th style="width: 12%">Course Code</th>
              <th style="width: 18%">Course Name</th>
              <th style="width: 15%">Faculty Name</th>
              <th style="width: 10%">Hours Completed</th>
              <th style="width: 20%">Topics Covered (Brief)</th>
              <th style="width: 10%">On Schedule</th>
              <th style="width: 10%">If No, Reason</th>
              <th style="width: 10%">Extra Hours</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
            <tr class="footer-row">
              <td colspan="4" style="text-align: right; text-transform: uppercase; letter-spacing: 0.5px;">Total Hours Completed</td>
              <td>${totalHours}</td>
              <td colspan="4"></td>
            </tr>
          </tbody>
        </table>

        <div class="remarks-box">
          <p class="remarks-title">Topics planned for next week</p>
          <p class="remarks-content">Continue with remaining topics as per the syllabus lesson plan.</p>
        </div>

        <div class="remarks-box">
          <p class="remarks-title">Remarks (if any)</p>
          <p class="remarks-content">${ccRemarks || 'Nil'}</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const html = generateHTML();
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (err) {
      console.error('Failed to export PDF:', err);
      Alert.alert('Export Failed', 'An error occurred while generating the PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name="file-pdf-box" size={32} color="#EF4444" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Export Spreadsheet Report</Text>
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
            This action compiles the weekly course coverage statistics and planned syllabus topics into a standardized PDF document ready for printing or institutional submission.
          </Text>

          <Button
            mode="contained"
            icon="share-variant"
            style={styles.exportBtn}
            labelStyle={styles.btnLabel}
            onPress={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? 'Generating PDF...' : 'Share / Export PDF Report'}
          </Button>

          {isExporting && (
            <ActivityIndicator size="small" color={Palette.primary} style={{ marginTop: 12 }} />
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
    padding: 16,
    justifyContent: 'center',
    minHeight: '80%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 14,
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    marginVertical: 18,
    backgroundColor: '#E2E8F0',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  metaLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  metaVal: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  desc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 1.8,
    textAlign: 'center',
    marginBottom: 8,
  },
  exportBtn: {
    marginTop: 16,
    backgroundColor: '#0F52BA',
    borderRadius: 12,
    paddingVertical: 6,
  },
  btnLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F8FAFC',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.textDark,
    marginTop: 16,
  },
  errorSub: {
    fontSize: 13,
    color: Palette.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  backBtn: {
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: Palette.primary,
  },
});

export default ReportExportScreen;
