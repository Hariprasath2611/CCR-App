import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, ProgressBar, Badge, Button, Portal, Modal, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useReportStore, ConsolidatedReport } from '@features/cc/store/useReportStore';
import { WeeklyCourseCoverageReportCard } from '../../cc/components/WeeklyCourseCoverageReportCard';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ClassData {
  classId: string;
  name: string;
  year: string;
  coverage: number;
  pendingCount: number;
}

const DEPT_SUBJECTS_LIST: Record<string, string[]> = {
  AERO: ['Aerodynamics', 'Aircraft Structures', 'Propulsion', 'Control Engineering', 'Flight Dynamics', 'Avionics'],
  CIVIL: ['Structural Analysis', 'Foundation Engineering', 'Environmental Engineering', 'Reinforced Concrete Elements', 'Surveying', 'Hydraulics'],
  CSE: ['Theory of Computation', 'Database Systems', 'Computer Networks', 'OS Principles', 'Compiler Design', 'Software Engineering'],
  'CSE-AIML': ['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Data Science & Visualisation', 'Natural Language Processing', 'Computer Vision'],
  CCE: ['Digital Communication Systems', 'Computer Communication Networks', 'Information Theory and Coding', 'Java Programming', 'Signals & Systems', 'Electromagnetics'],
  CSBS: ['Design & Analysis of Algorithms', 'Business Communication', 'Fundamentals of Management', 'Software Testing', 'Financial Accounting', 'Human Resource Management'],
  ECE: ['Digital Communication', 'Discrete-Time Signal Processing', 'Computer Architecture & Org', 'Transmission Lines & Wave Guides', 'Microprocessors', 'VLSI Design'],
  EEE: ['Power System Analysis', 'Microprocessors & Microcontrollers', 'Power Electronics', 'Transmission & Distribution', 'Electrical Machines', 'Control Systems'],
  EIE: ['Industrial Instrumentation', 'Process Control', 'Analytical Instruments', 'Microprocessors and Applications', 'Transducer Engineering', 'Logic and Distributed Control'],
  MECH: ['Design of Machine Elements', 'Dynamics of Machines', 'Metrology & Measurements', 'Thermal Engineering', 'Fluid Mechanics', 'Kinematics of Machinery'],
  RA: ['Robot Kinematics & Dynamics', 'Sensors and Transducers', 'Control Systems for Robotics', 'Embedded Systems Design', 'Robotic Vision', 'Industrial Automation'],
  IT: ['Web Technology', 'Computer Network & Admin', 'Software Product Engineering', 'Data Mining & Warehousing', 'Mobile Computing', 'Object Oriented Analysis & Design'],
  'ME-VLSI': ['ASIC and FPGA Design', 'CAD for VLSI Circuits', 'Testing of VLSI Circuits', 'Low Power VLSI Design', 'DSP Structures for VLSI', 'RF IC Design'],
  MBA: ['Marketing Management', 'Financial Management', 'Human Resource Management', 'Operations Management', 'Organizational Behavior', 'Strategic Management'],
  MCA: ['Advanced Java Programming', 'Cloud Computing Technologies', 'Mobile Application Development', 'Cyber Security & Forensics', 'Web Application Development', 'Data Structures using C++'],
  TEXTILE: ['Yarn Manufacture', 'Fabric Manufacture', 'Textile Chemical Processing', 'Fiber Science & Technology', 'Textile Testing', 'Garment Technology'],
};

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

  // Dynamic Class mock builder based on HOD's department
  const getClassesForDept = (code: string): ClassData[] => {
    return [
      { classId: `1st Year ${code}-A`, name: `1st Year ${code}-A`, year: '1st Year', coverage: 78, pendingCount: 0 },
      { classId: `1st Year ${code}-B`, name: `1st Year ${code}-B`, year: '1st Year', coverage: 74, pendingCount: 0 },
      { classId: `2nd Year ${code}-A`, name: `2nd Year ${code}-A`, year: '2nd Year', coverage: 82, pendingCount: 0 },
      // Keep CSE-B as in existing store
      { classId: code === 'CSE' ? 'CSE-B' : `2nd Year ${code}-B`, name: `2nd Year ${code}-B`, year: '2nd Year', coverage: 65, pendingCount: 1 },
      { classId: `3rd Year ${code}-A`, name: `3rd Year ${code}-A`, year: '3rd Year', coverage: 85, pendingCount: 0 },
      { classId: `3rd Year ${code}-B`, name: `3rd Year ${code}-B`, year: '3rd Year', coverage: 79, pendingCount: 0 },
      { classId: `4th Year ${code}-A`, name: `4th Year ${code}-A`, year: '4th Year', coverage: 90, pendingCount: 0 },
      { classId: `4th Year ${code}-B`, name: `4th Year ${code}-B`, year: '4th Year', coverage: 88, pendingCount: 0 },
    ];
  };

  const allDeptClasses = getClassesForDept(deptCode);
  const filteredClasses = allDeptClasses.filter((c) => c.year === selectedYear);

  // Dynamic Subjects list builder for HOD department
  const getMockSubjectsForDept = (code: string) => {
    const templates = DEPT_SUBJECTS_LIST[code] || ['Core Course I', 'Core Course II', 'Core Course III', 'Core Course IV'];
    const faculties = [
      'Dr. Sundaram A', 'Prof. Priyadharshini M', 'Dr. Suresh Babu', 'Prof. Divya R',
      'Dr. Vignesh K', 'Prof. Archana S', 'Dr. Ganesan V', 'Prof. Anandhi T',
      'Dr. Meena Kumari', 'Prof. Karthick D', 'Prof. Rajesh K', 'Dr. Anita S'
    ];

    return [1, 2, 3, 4].flatMap((yearNum) => {
      const yearRoman = ['I', 'II', 'III', 'IV'][yearNum - 1] || 'III';
      return [0, 1, 2, 3].map((idx) => {
        const templateName = templates[idx % templates.length];
        const name = yearNum === 1 ? `Fundamentals of ${templateName}` : `${templateName} ${yearRoman}`;
        const codeNum = 8000 + (yearNum * 100) + (idx + 1) * 10;
        const subCode = `${code}${codeNum}`;
        const faculty = faculties[(code.charCodeAt(0) + yearNum + idx) % faculties.length];
        return {
          code: subCode,
          name,
          faculty,
          year: `${yearNum}${yearNum === 1 ? 'st' : yearNum === 2 ? 'nd' : yearNum === 3 ? 'rd' : 'th'} Year`,
          topics: 8 + (idx % 3),
        };
      });
    });
  };

  const departmentSubjects = getMockSubjectsForDept(deptCode);

  const getMockSubjectsForClass = (classId: string, dCode: string) => {
    let yearNum = 3;
    if (classId.includes('1st Year') || classId.includes('1st')) yearNum = 1;
    else if (classId.includes('2nd Year') || classId.includes('2nd')) yearNum = 2;
    else if (classId.includes('3rd Year') || classId.includes('3rd')) yearNum = 3;
    else if (classId.includes('4th Year') || classId.includes('4th')) yearNum = 4;

    const templates = DEPT_SUBJECTS_LIST[dCode] || ['Core Course I', 'Core Course II', 'Core Course III', 'Core Course IV'];
    const faculties = [
      'Dr. Sundaram A', 'Prof. Priyadharshini M', 'Dr. Suresh Babu', 'Prof. Divya R',
      'Dr. Vignesh K', 'Prof. Archana S', 'Dr. Ganesan V', 'Prof. Anandhi T',
      'Dr. Meena Kumari', 'Prof. Karthick D', 'Prof. Rajesh K', 'Dr. Anita S'
    ];

    const yearRoman = ['I', 'II', 'III', 'IV'][yearNum - 1] || 'III';

    return [0, 1, 2, 3].map((idx) => {
      const templateName = templates[idx % templates.length];
      const name = yearNum === 1 ? `Fundamentals of ${templateName}` : `${templateName} ${yearRoman}`;
      const codeNum = 8000 + (yearNum * 100) + (idx + 1) * 10;
      const subCode = `${dCode}${codeNum}`;
      const faculty = faculties[(dCode.charCodeAt(0) + yearNum + idx) % faculties.length];
      
      let coverage = Math.min(60 + (idx * 8) + (yearNum * 2), 95);
      if (classId.includes('-A')) {
        coverage = Math.min(78 + (idx * 4), 98);
      } else if (classId.includes('-B') || classId === 'CSE-B') {
        coverage = Math.min(68 + (idx * 5), 92);
      }

      const totalTopics = 8 + idx;
      const completedTopics = Math.round((coverage / 100) * totalTopics);

      return {
        code: subCode,
        name,
        faculty,
        coverage,
        status: 'Submitted' as const,
        completedTopicsCount: completedTopics,
        totalTopicsCount: totalTopics,
        reasonsForPending: coverage < 70 ? 'Lab hours clashing with internal exams.' : undefined,
        extraHoursRequested: coverage < 70 ? true : undefined,
      };
    });
  };

  const handleOpenSpreadsheet = (cls: ClassData) => {
    const week = 12;
    const storeKey = `${cls.classId}_${week}`;
    const progressList = subjectProgressList[storeKey] || [];

    // Fallback: build provisional subject logs if not in central store
    const subjectsToShow = progressList.length > 0 ? progressList.map(s => ({
      code: s.code,
      name: s.name,
      faculty: s.faculty,
      coverage: s.coverage,
      status: s.status,
      completedTopicsCount: s.completedTopicsCount,
      totalTopicsCount: s.totalTopicsCount,
      reasonsForPending: s.reasonsForPending,
      extraHoursRequested: s.extraHoursRequested,
    })) : getMockSubjectsForClass(cls.classId, deptCode);

    const averageCoverage = subjectsToShow.length > 0
      ? Math.round(subjectsToShow.reduce((sum, s) => sum + s.coverage, 0) / subjectsToShow.length)
      : cls.coverage;

    const existingReport = reports.find((r) => r.classId === cls.classId && r.weekNumber === week);

    const mockReport: ConsolidatedReport = existingReport || {
      id: `report-${cls.classId}-W${week}`,
      classId: cls.classId,
      weekNumber: week,
      overallCoverage: averageCoverage,
      submittedBy: 'Class Coordinator',
      submittedAt: '2026-07-08',
      ccRemarks: cls.pendingCount > 0
        ? 'Some lab hours clashing with internal assessments. Extra hours compensatory slots request raised.'
        : 'All topics are completed as per the mapped syllabus schedule.',
      status: cls.pendingCount > 0 ? 'SUBMITTED_TO_HOD' : 'SENT_TO_ADMIN',
      subjects: subjectsToShow,
      hodRemarks: 'Reviewed and verified with department logbooks.',
    };

    setSelectedReport(mockReport);
    setModalVisible(true);
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
                <WeeklyCourseCoverageReportCard report={selectedReport} showDownloadButton={false} />
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
