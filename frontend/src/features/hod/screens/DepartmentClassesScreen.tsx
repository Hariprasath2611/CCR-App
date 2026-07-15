import React, { useState } from 'react';
import { Alert, StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, ProgressBar, Badge, Button, Portal, Modal, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useReportStore, ConsolidatedReport } from '@features/cc/store/useReportStore';
import { WeeklyCourseCoverageReportCard } from '../../cc/components/WeeklyCourseCoverageReportCard';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

interface ClassData {
  classId: string;
  name: string;
  year: string;
  coverage: number;
  pendingCount: number;
}

// DEPT_SUBJECTS_LIST removed

export const DepartmentClassesScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const reports = useReportStore((state) => state.reports);
  const subjectProgressList = useReportStore((state) => state.subjectProgressList);

  const [activeTab, setActiveTab] = useState<'classes' | 'subjects'>('classes');
  const [selectedYear, setSelectedYear] = useState<string>('2nd Year');
  const [selectedReport, setSelectedReport] = useState<ConsolidatedReport | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Helper to extract department code
  const getDeptCode = (deptName: string = '') => {
    const upper = deptName.toUpperCase();
    if (upper.includes('CSBS') || upper.includes('BUSINESS SYSTEMS')) return 'CSBS';
    if (upper.includes('CSE') || upper.includes('COMPUTER SCIENCE')) return 'CSE';
    if (upper.includes('AERO') || upper.includes('AERONAUTICAL')) return 'AERO';
    if (upper.includes('CIVIL')) return 'CIVIL';
    if (upper.includes('ECE') || upper.includes('ELECTRONICS')) return 'ECE';
    if (upper.includes('EEE') || upper.includes('ELECTRICAL')) return 'EEE';
    if (upper.includes('IT') || upper.includes('INFORMATION')) return 'IT';
    if (upper.includes('MECH') || upper.includes('MECHANICAL')) return 'MECH';
    return 'CSE';
  };

  const deptCode = getDeptCode(user?.department || 'Computer Science Engineering');

  // Dynamic Class builder based on existing consolidated reports
  const getClassesForDept = (code: string): ClassData[] => {
    // Return classes that actually have reports in the store
    const classMap: Record<string, ClassData> = {};
    for (const report of reports) {
      if (report.classId.includes(code)) {
        if (!classMap[report.classId]) {
          classMap[report.classId] = {
            classId: report.classId,
            name: report.classId,
            year: report.classId.includes('1st') ? '1st Year' : report.classId.includes('2nd') ? '2nd Year' : report.classId.includes('3rd') ? '3rd Year' : '4th Year',
            coverage: report.overallCoverage,
            pendingCount: report.status === 'SUBMITTED_TO_HOD' ? 1 : 0,
          };
        }
      }
    }
    return Object.values(classMap);
  };

  const allDeptClasses = getClassesForDept(deptCode);
  const filteredClasses = allDeptClasses.filter((c) => c.year === selectedYear);

  // Dynamic Subjects list builder for HOD department
  const getMockSubjectsForDept = (code: string) => {
    return [];
  };

  const departmentSubjects = getMockSubjectsForDept(deptCode);

  const getMockSubjectsForClass = (classId: string, dCode: string) => {
    return [];
  };

  const handleOpenSpreadsheet = (cls: ClassData) => {
    const week = 12;
    const existingReport = reports.find((r) => r.classId === cls.classId && r.weekNumber === week);

    if (!existingReport) {
      Alert.alert('No Report Available', `No consolidated syllabus report is available for ${cls.classId} for Week ${week}.`);
      return;
    }

    setSelectedReport(existingReport);
    setModalVisible(true);
  };

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

  return (
    <View style={styles.container}>
      {/* ── SEGMENT TABS ── */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'classes' && styles.activeTabButton]}
          onPress={() => setActiveTab('classes')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="google-classroom" size={18} color={activeTab === 'classes' ? '#FFFFFF' : Palette.textLight} />
          <Text style={[styles.tabText, activeTab === 'classes' && styles.activeTabText]}>Classes Grid</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'subjects' && styles.activeTabButton]}
          onPress={() => setActiveTab('subjects')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="book-open-page-variant" size={18} color={activeTab === 'subjects' ? '#FFFFFF' : Palette.textLight} />
          <Text style={[styles.tabText, activeTab === 'subjects' && styles.activeTabText]}>Subject Catalog</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'classes' ? (
        <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.headerBox}>
            <Text style={styles.title}>{user?.department || 'Computer Science Engineering'}</Text>
            <Text style={styles.subtitle}>Audit syllabus coverage spreadsheets mapped for your academic classes.</Text>
          </View>

          {/* Year selector tabs */}
          <View style={styles.yearSelectorContainer}>
            {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((year) => {
              const isSelected = selectedYear === year;
              return (
                <TouchableOpacity
                  key={year}
                  onPress={() => setSelectedYear(year)}
                  style={[styles.yearBtn, isSelected && styles.yearBtnActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.yearBtnText, isSelected && styles.yearBtnTextActive]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Classes lists */}
          <View style={styles.classesList}>
            {filteredClasses.map((cls) => (
              <Card key={cls.classId} style={styles.classCard}>
                <Card.Content>
                  <View style={styles.classHeader}>
                    <View>
                      <Text style={styles.className}>{cls.name}</Text>
                      <Text style={styles.classDeptCode}>{deptCode} Department</Text>
                    </View>
                    {cls.pendingCount > 0 ? (
                      <Badge style={styles.pendingBadge}>{`${cls.pendingCount} Pending`}</Badge>
                    ) : (
                      <Badge style={styles.okBadge}>All Logged</Badge>
                    )}
                  </View>

                  <View style={styles.progressSection}>
                    <View style={styles.progressLabelRow}>
                      <Text style={styles.progressLabel}>Average Coverage</Text>
                      <Text style={styles.progressValue}>{cls.coverage}%</Text>
                    </View>
                    <ProgressBar progress={cls.coverage / 100} color={Palette.primary} style={styles.progressBar} />
                  </View>

                  <View style={styles.actionsRow}>
                    <Button
                      mode="outlined"
                      compact
                      icon="eye"
                      style={[styles.actionBtn, { flex: 1, marginRight: 8 }]}
                      labelStyle={styles.actionBtnLabel}
                      onPress={() => navigation.navigate('FacultyProgress', { classId: cls.classId })}
                    >
                      Inspect Progress
                    </Button>
                    <Button
                      mode="contained"
                      compact
                      icon="table"
                      style={[styles.actionBtn, { flex: 1.2 }]}
                      labelStyle={[styles.actionBtnLabel, { color: '#FFFFFF' }]}
                      buttonColor={Palette.primary}
                      onPress={() => handleOpenSpreadsheet(cls)}
                    >
                      Spreadsheet Details
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.headerBox}>
            <Text style={styles.title}>Department Subjects Details</Text>
            <Text style={styles.subtitle}>Syllabus configuration details for all subjects mapped under {user?.department || 'CSE'}.</Text>
          </View>

          {/* Subjects Grid */}
          <View style={styles.subjectsGrid}>
            {departmentSubjects.map((sub) => (
              <Card key={sub.code} style={styles.subjectCard}>
                <Card.Content>
                  <View style={styles.subjectHeader}>
                    <View style={styles.subCodeBadge}>
                      <Text style={styles.subCodeText}>{sub.code}</Text>
                    </View>
                    <Text style={styles.subYearBadge}>{sub.year}</Text>
                  </View>
                  <Text style={styles.subjectName}>{sub.name}</Text>
                  
                  <Divider style={styles.subDivider} />
                  
                  <View style={styles.subjectMeta}>
                    <View style={styles.metaItem}>
                      <Feather name="user" size={13} color={Palette.textLight} />
                      <Text style={styles.metaText} numberOfLines={1}>{sub.faculty}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Feather name="list" size={13} color={Palette.textLight} />
                      <Text style={styles.metaText}>{sub.topics} Syllabus Units</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ── SPREADSHEET DETAIL OVERLAY MODAL ── */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedReport && (
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleBox}>
                  <Text style={styles.modalTitle}>{selectedReport.classId} Course Coverage</Text>
                  <Text style={styles.modalSubtitle}>
                    Official Auditing Sheet · Week {selectedReport.weekNumber}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Feather name="x" size={22} color={Palette.textLight} />
                </TouchableOpacity>
              </View>

              <Divider style={styles.modalDivider} />

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <WeeklyCourseCoverageReportCard 
                  report={selectedReport} 
                  showDownloadButton={true} 
                  onDownloadPress={() => handleExportPDF(selectedReport)}
                />
              </ScrollView>

              <Divider style={styles.modalDivider} />

              <View style={styles.modalFooter}>
                <Button
                  mode="contained"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}
                  buttonColor={Palette.primary}
                >
                  Close Document
                </Button>
              </View>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
    paddingTop: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 5,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: Palette.primary,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textLight,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  headerBox: {
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Palette.textDark,
  },
  subtitle: {
    fontSize: 12.5,
    color: Palette.textLight,
    lineHeight: 18,
    marginTop: 4,
  },
  yearSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  yearBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
    backgroundColor: '#F1F5F9',
  },
  yearBtnActive: {
    backgroundColor: Palette.primary,
  },
  yearBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.textLight,
  },
  yearBtnTextActive: {
    color: '#FFFFFF',
  },
  classesList: {
    marginBottom: 8,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  className: {
    fontSize: 15.5,
    fontWeight: '800',
    color: Palette.textDark,
  },
  classDeptCode: {
    fontSize: 11.5,
    color: Palette.textLight,
    fontWeight: '500',
    marginTop: 1,
  },
  pendingBadge: {
    backgroundColor: '#FEF2F2',
    color: Palette.error,
    fontWeight: '800',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  okBadge: {
    backgroundColor: '#ECFDF5',
    color: Palette.success,
    fontWeight: '800',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  progressSection: {
    marginBottom: 14,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11.5,
    color: Palette.textLight,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Palette.primary,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  actionBtn: {
    borderRadius: 10,
    borderColor: Palette.primary,
    borderWidth: 1.2,
  },
  actionBtnLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Subjects styles
  subjectsGrid: {
    gap: 12,
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subCodeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subCodeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.primary,
  },
  subYearBadge: {
    fontSize: 11.5,
    color: Palette.textLight,
    fontWeight: '600',
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.textDark,
    marginBottom: 8,
  },
  subDivider: {
    marginVertical: 8,
    backgroundColor: '#F1F5F9',
  },
  subjectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  metaText: {
    fontSize: 11.5,
    color: Palette.textLight,
    fontWeight: '500',
  },

  // Modal styles
  modalContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: width - 32,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  modalTitleBox: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Palette.textDark,
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: Palette.textLight,
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  modalDivider: {
    backgroundColor: '#E2E8F0',
  },
  modalScroll: {
    padding: 16,
  },
  modalFooter: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  modalCloseButton: {
    borderRadius: 12,
    width: '100%',
    paddingVertical: 4,
  },
});

export default DepartmentClassesScreen;
