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
import { generateReportHTML } from '@services/api/reportPdfTemplate';
import { generateReportWord } from '@services/api/reportWordTemplate';

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

  interface DeptSubject {
    code: string;
    year: string;
    name: string;
    faculty: string;
    topics: number;
  }

  // Dynamic Subjects list builder for HOD department
  const getMockSubjectsForDept = (code: string): DeptSubject[] => {
    return [
      { code: 'CS3591', year: '3rd Year', name: 'Computer Networks', faculty: 'Ms.E Uva Shakthi', topics: 5 },
      { code: 'CS3501', year: '3rd Year', name: 'Compiler Design', faculty: 'Mr.J Lin Eby Chandra', topics: 5 },
      { code: 'CB3491', year: '3rd Year', name: 'Cryptography and Cyber Security', faculty: 'Mr.S Faizal Mukthar Hussain', topics: 5 },
      { code: 'CS3551', year: '3rd Year', name: 'Distributed Computing', faculty: 'Ms.R Rajalakshmi', topics: 5 },
      { code: 'CCS375', year: '3rd Year', name: 'Web Technologies', faculty: 'Ms.P Divya', topics: 5 },
      { code: 'CCS370', year: '3rd Year', name: 'UI and UX Design', faculty: 'Ms.Punitha EM', topics: 5 },
      { code: 'MX3084', year: '3rd Year', name: 'Disaster Management', faculty: 'Ms.Arun Kamala', topics: 5 },
    ];
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
                  onDownloadPress={() => handleExportReport(selectedReport)}
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
