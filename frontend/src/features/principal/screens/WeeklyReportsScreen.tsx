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

export const WeeklyReportsScreen = () => {
  const reports = useReportStore((state) => state.reports);
  const adminReports = reports.filter((r) => r.status === 'SENT_TO_ADMIN');

  const [selectedReport, setSelectedReport] = useState<ConsolidatedReport | null>(null);

  const generateHTMLForReport = (rep: ConsolidatedReport) => {
    const sectionChar = rep.classId.split('-')[1] || 'A';
    const displayClass = rep.classId.includes('CSE') ? 'III Year / V Semester' : 'II Year / III Semester';
    const displayDept = rep.classId.includes('CSE') ? 'Computer Science and Engineering' : 'Computer Science and Business Systems (CSBS)';

    const getDates = (week: number) => {
      const startDay = 20 + (week - 5) * 7;
      const startMonth = 5;
      const endDay = startDay + 5;
      return {
        from: `${startDay.toString().padStart(2, '0')}.0${startMonth}.2024`,
        to: `${endDay.toString().padStart(2, '0')}.0${startMonth}.2024`,
      };
    };

    const dates = getDates(rep.weekNumber);

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

    const totalHours = rep.subjects.reduce((sum, s) => sum + (s.completedTopicsCount * 1.5), 0);

    const tableRowsHtml = rep.subjects.map((subj, index) => {
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
            <td class="value">Week ${rep.weekNumber}</td>
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
            <td class="value">${rep.submittedBy || 'Class Coordinator'}</td>
            <td class="label">Overall Coverage</td>
            <td class="value" style="font-weight: bold; color: #0F52BA;">${rep.overallCoverage}%</td>
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
          <p class="remarks-content">${rep.ccRemarks || 'Nil'}</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleExportPDF = async (rep: ConsolidatedReport) => {
    try {
      const html = generateHTMLForReport(rep);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (err) {
      console.error('Failed to export PDF:', err);
      Alert.alert('Export Failed', 'An error occurred while generating the PDF.');
    }
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
            onDownloadPress={() => handleExportPDF(selectedReport)}
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
    padding: 16,
    paddingBottom: 32,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F52BA',
    marginLeft: 8,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 10,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 20,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  reportRowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  submittedBy: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  coverageChip: {
    alignSelf: 'center',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#F1F5F9',
  },
  hodFeedbackBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    marginBottom: 12,
  },
  feedbackTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  feedbackContent: {
    fontSize: 13,
    color: '#334155',
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },
  feedbackDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },
  auditBtn: {
    backgroundColor: '#0F52BA',
    borderRadius: 12,
    paddingVertical: 2,
  },
  auditBtnLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default WeeklyReportsScreen;
