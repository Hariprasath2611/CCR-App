import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import {
  Text,
  Card,
  ProgressBar,
  Badge,
  Portal,
  Modal,
  Divider,
  Button,
} from 'react-native-paper';
import { useReportStore, ConsolidatedReport } from '@features/cc/store/useReportStore';
import { WeeklyCourseCoverageReportCard } from '../../cc/components/WeeklyCourseCoverageReportCard';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateReportHTML } from '@services/api/reportPdfTemplate';
import { generateReportWord } from '@services/api/reportWordTemplate';

import { ms } from '@theme/responsive';
import { FacultyBoardCard } from '@components/common/FacultyBoardCard';
import { getCCForSection, getHODForYear } from '@config/facultyBoard';

const { width } = Dimensions.get('window');

interface DeptInfo {
  id: string;
  name: string;
  code: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  coverage: number;
  classesCount: number;
}

export const DEPARTMENTS: DeptInfo[] = [
  { id: 'AERO', name: 'Aeronautical Engineering', code: 'AERO', icon: 'airplane', iconColor: '#0EA5E9', bgColor: '#F0F9FF', coverage: 81, classesCount: 8 },
  { id: 'CIVIL', name: 'Civil Engineering', code: 'CIVIL', icon: 'home-city', iconColor: '#14B8A6', bgColor: '#F0FDFA', coverage: 73, classesCount: 8 },
  { id: 'CSE', name: 'Computer Science and Engineering', code: 'CSE', icon: 'laptop', iconColor: '#3B82F6', bgColor: '#EEF2FF', coverage: 82, classesCount: 12 },
  { id: 'CSE-AIML', name: 'CSE (Artificial Intelligence and Machine Learning)', code: 'CSE-AIML', icon: 'brain', iconColor: '#EC4899', bgColor: '#FDF2F8', coverage: 85, classesCount: 8 },
  { id: 'CCE', name: 'Computer and Communication Engineering', code: 'CCE', icon: 'transit-connection-variant', iconColor: '#6366F1', bgColor: '#EEF2FF', coverage: 78, classesCount: 8 },
  { id: 'CSBS', name: 'Computer Science and Business Systems', code: 'CSBS', icon: 'briefcase-outline', iconColor: '#F97316', bgColor: '#FFF7ED', coverage: 84, classesCount: 8 },
  { id: 'ECE', name: 'Electronics and Communication Engineering', code: 'ECE', icon: 'memory', iconColor: '#8B5CF6', bgColor: '#F5F3FF', coverage: 80, classesCount: 8 },
  { id: 'EEE', name: 'Electrical and Electronics Engineering', code: 'EEE', icon: 'flash', iconColor: '#EAB308', bgColor: '#FEF9C3', coverage: 75, classesCount: 8 },
  { id: 'EIE', name: 'Electronics and Instrumentation Engineering', code: 'EIE', icon: 'sine-wave', iconColor: '#06B6D4', bgColor: '#ECFEFF', coverage: 76, classesCount: 8 },
  { id: 'MECH', name: 'Mechanical Engineering', code: 'MECH', icon: 'cog', iconColor: '#64748B', bgColor: '#F8FAFC', coverage: 71, classesCount: 8 },
  { id: 'RA', name: 'Robotics and Automation', code: 'RA', icon: 'robot', iconColor: '#EF4444', bgColor: '#FEF2F2', coverage: 79, classesCount: 8 },
  { id: 'IT', name: 'Information Technology', code: 'IT', icon: 'web', iconColor: '#10B981', bgColor: '#ECFDF5', coverage: 79, classesCount: 8 },
  { id: 'ME-VLSI', name: 'M.E – VLSI Design', code: 'ME-VLSI', icon: 'memory', iconColor: '#A855F7', bgColor: '#F3E8FF', coverage: 88, classesCount: 4 },
  { id: 'MBA', name: 'MBA – Master of Business Administration', code: 'MBA', icon: 'briefcase', iconColor: '#D946EF', bgColor: '#FDF4FF', coverage: 83, classesCount: 6 },
  { id: 'MCA', name: 'MCA – Master of Computer Applications', code: 'MCA', icon: 'code-tags', iconColor: '#14B8A6', bgColor: '#F0FDFA', coverage: 86, classesCount: 6 },
  { id: 'TEXTILE', name: 'Textile Technology', code: 'TEXTILE', icon: 'tshirt-crew', iconColor: '#F43F5E', bgColor: '#FFF1F2', coverage: 74, classesCount: 8 },
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

interface ClassProgressInfo {
  classId: string;
  name: string;
  coverage: number;
  pendingCount: number;
}

interface SubjectProgressInfo {
  code: string;
  name: string;
  faculty: string;
  coverage: number;
  status: 'Pending' | 'Submitted';
  completedTopicsCount: number;
  totalTopicsCount: number;
}

export const DeptSummaryScreen = () => {
  const subjectProgressList = useReportStore((state) => state.subjectProgressList);
  const reports = useReportStore((state) => state.reports);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDept, setSelectedDept] = useState<DeptInfo | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassProgressInfo | null>(null);
  const [selectedReport, setSelectedReport] = useState<ConsolidatedReport | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [deptTab, setDeptTab] = useState<'years' | 'subjects'>('years');

  const dynamicDepartments = DEPARTMENTS.map((dept) => {
    const deptReports = reports.filter(r => r.classId.toLowerCase().includes(dept.code.toLowerCase()));
    const totalClasses = new Set(deptReports.map(r => r.classId)).size;
    const avgCoverage = deptReports.length > 0
      ? Math.round(deptReports.reduce((sum, r) => sum + r.overallCoverage, 0) / deptReports.length)
      : 0;

    return {
      ...dept,
      classesCount: totalClasses,
      coverage: avgCoverage,
    };
  });

  interface DeptSubject {
    code: string;
    year: string;
    name: string;
    faculty: string;
    topics: number;
  }

  const getAllSubjectsForDept = (deptCode: string): DeptSubject[] => {
    return [
      { code: `${deptCode}3591`, year: '3rd Year', name: 'Computer Networks', faculty: 'Dr. Sundaram A', topics: 5 },
      { code: `${deptCode}3501`, year: '3rd Year', name: 'Compiler Design', faculty: 'Prof. Priyadharshini M', topics: 5 },
      { code: `${deptCode}3491`, year: '3rd Year', name: 'Cryptography and Cyber Security', faculty: 'Dr. Suresh Babu', topics: 5 },
      { code: `${deptCode}3551`, year: '3rd Year', name: 'Distributed Computing', faculty: 'Prof. Divya R', topics: 5 },
    ];
  };

  // Helper to generate classes list for a selected dept & year dynamically from reports
  const getClassesForDeptAndYear = (deptId: string, year: string): ClassProgressInfo[] => {
    const classMap: Record<string, ClassProgressInfo> = {};

    if (year === '1st Year') {
      const default1stYear = [
        { classId: '1st Year SEC-A', name: '1st Year SEC-A', coverage: 78, pendingCount: 0 },
        { classId: '1st Year SEC-B', name: '1st Year SEC-B', coverage: 82, pendingCount: 0 },
        { classId: '1st Year SEC-C', name: '1st Year SEC-C', coverage: 75, pendingCount: 1 },
        { classId: '1st Year SEC-D', name: '1st Year SEC-D', coverage: 80, pendingCount: 0 },
        { classId: '1st Year SEC-E', name: '1st Year SEC-E', coverage: 70, pendingCount: 0 },
        { classId: '1st Year SEC-F', name: '1st Year SEC-F', coverage: 85, pendingCount: 0 },
        { classId: '1st Year SEC-G', name: '1st Year SEC-G', coverage: 72, pendingCount: 1 },
      ];
      for (const item of default1stYear) {
        classMap[item.classId] = item;
      }
    }

    const deptReports = reports.filter(
      (r) => r.classId.toLowerCase().includes(deptId.toLowerCase()) && r.classId.toLowerCase().includes(year.toLowerCase())
    );
    
    for (const report of deptReports) {
      if (!classMap[report.classId]) {
        classMap[report.classId] = {
          classId: report.classId,
          name: report.classId,
          coverage: report.overallCoverage,
          pendingCount: report.status === 'SUBMITTED_TO_HOD' ? 1 : 0,
        };
      } else {
        classMap[report.classId].coverage = report.overallCoverage;
      }
    }
    const resultList = Object.values(classMap);
    resultList.sort((a, b) => a.classId.localeCompare(b.classId, undefined, { numeric: true, sensitivity: 'base' }));
    return resultList;
  };

  const getMockSubjectsForDept = (deptCode: string, year: number): { code: string; name: string; faculty: string }[] => {
    return [];
  };

  // Helper to generate subject syllabus coverage for any class
  const getSubjectsProgressForClass = (classId: string): SubjectProgressInfo[] => {
    const week = '12';
    const storeKey = `${classId}_${week}`;

    if (subjectProgressList[storeKey]) {
      return subjectProgressList[storeKey].map(s => ({
        code: s.code,
        name: s.name,
        faculty: s.faculty,
        coverage: s.coverage,
        status: s.status,
        completedTopicsCount: s.completedTopicsCount,
        totalTopicsCount: s.totalTopicsCount,
      }));
    }
    return [];
  };

  const activeClasses = selectedDept && selectedYear ? getClassesForDeptAndYear(selectedDept.id, selectedYear) : [];
  const activeSubjects = selectedClass ? getSubjectsProgressForClass(selectedClass.classId) : [];

  const handleDeptSelect = (dept: DeptInfo) => {
    setSelectedDept(dept);
    setStep(2);
    setDeptTab('years');
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setStep(3);
  };

  const handleClassSelect = (cls: ClassProgressInfo) => {
    setSelectedClass(cls);
    
    const week = 12;
    const existingReport = reports.find((r) => r.classId === cls.classId && r.weekNumber === week);

    if (!existingReport) {
      Alert.alert('No Report Available', `No consolidated syllabus report is available for ${cls.classId} for Week ${week}.`);
      return;
    }

    setSelectedReport(existingReport);
    setDetailModalVisible(true);
  };

  const handleBreadcrumbClick = (targetStep: number) => {
    if (targetStep === 1) {
      setSelectedDept(null);
      setSelectedYear(null);
      setSelectedClass(null);
      setSelectedReport(null);
      setStep(1);
    } else if (targetStep === 2) {
      setSelectedYear(null);
      setSelectedClass(null);
      setSelectedReport(null);
      setStep(2);
    }
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

  // Breadcrumbs element
  const renderBreadcrumbs = () => {
    return (
      <View style={styles.breadcrumbContainer}>
        <TouchableOpacity onPress={() => handleBreadcrumbClick(1)}>
          <Text style={[styles.breadcrumbText, step === 1 && styles.breadcrumbActive]}>Departments</Text>
        </TouchableOpacity>
        
        {selectedDept && (
          <>
            <Feather name="chevron-right" size={14} color={Palette.textLight} style={styles.breadcrumbSeparator} />
            <TouchableOpacity onPress={() => handleBreadcrumbClick(2)}>
              <Text style={[styles.breadcrumbText, step === 2 && styles.breadcrumbActive]}>{selectedDept.code}</Text>
            </TouchableOpacity>
          </>
        )}

        {selectedYear && (
          <>
            <Feather name="chevron-right" size={14} color={Palette.textLight} style={styles.breadcrumbSeparator} />
            <Text style={[styles.breadcrumbText, step === 3 && styles.breadcrumbActive]}>{selectedYear}</Text>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Breadcrumb Navigation ── */}
      {renderBreadcrumbs()}

      {/* ── STEP 1: Departments Grid ── */}
      {step === 1 && (
        <FlatList
          data={dynamicDepartments}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerBox}>
              <Text style={styles.title}>All Departments</Text>
              <Text style={styles.subtitle}>Select a department to view detailed years & syllabus coverage</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.deptCard}
              onPress={() => handleDeptSelect(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconFrame, { backgroundColor: item.bgColor }]}>
                <MaterialCommunityIcons name={item.icon as any} size={28} color={item.iconColor} />
              </View>
              <Text style={styles.deptCode}>{item.code}</Text>
              <Text style={styles.deptName} numberOfLines={2}>{item.name}</Text>
              
              <View style={styles.deptFooter}>
                <Text style={styles.deptCount}>{item.classesCount} Classes</Text>
                <Text style={[styles.deptCoverage, { color: item.iconColor }]}>{item.coverage}%</Text>
              </View>
              <ProgressBar progress={item.coverage / 100} color={item.iconColor} style={styles.progressBar} />
            </TouchableOpacity>
          )}
        />
      )}

      {/* ── STEP 2: Years Selection ── */}
      {step === 2 && selectedDept && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerBox}>
            <TouchableOpacity style={styles.backLink} onPress={() => handleBreadcrumbClick(1)}>
              <Feather name="arrow-left" size={16} color={Palette.primary} />
              <Text style={styles.backLinkText}>Back to Departments</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{selectedDept.name}</Text>
            <Text style={styles.subtitle}>Select the academic year to view classes or browse mapped department subjects.</Text>
          </View>

          {/* ── DEP SWITCHER TABS ── */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, deptTab === 'years' && styles.activeTabButton]}
              onPress={() => setDeptTab('years')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="google-classroom" size={18} color={deptTab === 'years' ? '#FFFFFF' : Palette.textLight} />
              <Text style={[styles.tabText, deptTab === 'years' && styles.activeTabText]}>Classes & Years</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, deptTab === 'subjects' && styles.activeTabButton]}
              onPress={() => setDeptTab('subjects')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="book-open-page-variant" size={18} color={deptTab === 'subjects' ? '#FFFFFF' : Palette.textLight} />
              <Text style={[styles.tabText, deptTab === 'subjects' && styles.activeTabText]}>Subject Catalog</Text>
            </TouchableOpacity>
          </View>

          {deptTab === 'years' ? (
            <View style={styles.yearsGrid}>
              {YEARS.map((year, idx) => {
                const yearClasses = getClassesForDeptAndYear(selectedDept.code, year);
                const yearClassesCount = yearClasses.length;
                const yearCoverage = yearClassesCount > 0
                  ? Math.round(yearClasses.reduce((sum, c) => sum + c.coverage, 0) / yearClassesCount)
                  : 0;
                const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];
                const yearColor = colors[idx] || Palette.primary;
                return (
                  <TouchableOpacity
                    key={year}
                    style={styles.yearCard}
                    onPress={() => handleYearSelect(year)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.yearCardTop}>
                      <View style={[styles.yearIndicator, { backgroundColor: yearColor + '15' }]}>
                        <Text style={[styles.yearIndicatorText, { color: yearColor }]}>Y{idx + 1}</Text>
                      </View>
                      <Text style={styles.yearTitle}>{year}</Text>
                    </View>
                    <View style={styles.yearCardStats}>
                      <Text style={styles.yearClassesMuted}>{yearClassesCount} Classes Mapped</Text>
                      <Text style={[styles.yearPercent, { color: yearColor }]}>{yearCoverage}% Avg</Text>
                    </View>
                    <ProgressBar progress={yearCoverage / 100} color={yearColor} style={styles.yearProgressBar} />
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.subjectsGrid}>
              {getAllSubjectsForDept(selectedDept.code).map((sub) => (
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
          )}
        </ScrollView>
      )}

      {/* ── STEP 3: Classes List ── */}
      {step === 3 && selectedDept && selectedYear && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerBox}>
            <TouchableOpacity style={styles.backLink} onPress={() => handleBreadcrumbClick(2)}>
              <Feather name="arrow-left" size={16} color={Palette.primary} />
              <Text style={styles.backLinkText}>Back to Years</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{selectedYear} Classes</Text>
            <Text style={styles.subtitle}>
              Syllabus progress details for {selectedDept.code} - {selectedYear}
            </Text>
          </View>

          {/* Academic Leadership Board (HOD & CCs) for selected year */}
          <FacultyBoardCard yearOrDept={selectedYear} showTitle={true} />

          <View style={styles.classesContainer}>
            {activeClasses.map((cls) => {
              const ccInfo = getCCForSection(cls.classId);
              return (
                <Card key={cls.classId} style={styles.classCard} onPress={() => handleClassSelect(cls)}>
                  <Card.Content>
                    <View style={styles.classHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.className}>{cls.name}</Text>
                        <Text style={styles.classDeptCode}>{selectedDept.code} Department</Text>
                        {ccInfo && (
                          <Text style={{ fontSize: ms(12), color: Palette.primary, fontWeight: '700', marginTop: ms(3) }}>
                            CC: {ccInfo.facultyName} ({ccInfo.department})
                          </Text>
                        )}
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
                      <Text style={[styles.progressValue, { color: Palette.primary }]}>
                        {cls.coverage}%
                      </Text>
                    </View>
                    <ProgressBar
                      progress={cls.coverage / 100}
                      color={Palette.primary}
                      style={styles.classProgressBar}
                    />
                  </View>

                  <Button
                    mode="text"
                    compact
                    icon="eye-outline"
                    labelStyle={styles.inspectLabel}
                    style={styles.inspectBtn}
                    onPress={() => handleClassSelect(cls)}
                  >
                    View Syllabus Progress
                  </Button>
                </Card.Content>
              </Card>
            );
          })}
          </View>
        </ScrollView>
      )}

      {/* ── CLASS PROGRESS DETAIL OVERLAY MODAL ── */}
      <Portal>
        <Modal
          visible={detailModalVisible}
          onDismiss={() => setDetailModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedReport && (
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleBox}>
                  <Text style={styles.modalTitle}>{selectedReport.classId} Course Coverage</Text>
                  <Text style={styles.modalSubtitle}>
                    Official Auditing Sheet · Week {selectedReport.weekNumber}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setDetailModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <Feather name="x" size={22} color={Palette.textLight} />
                </TouchableOpacity>
              </View>

              <Divider style={styles.modalDivider} />

              {/* Modal Body */}
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <WeeklyCourseCoverageReportCard 
                  report={selectedReport} 
                  showDownloadButton={true} 
                  onDownloadPress={() => handleExportReport(selectedReport)}
                />
              </ScrollView>

              <Divider style={styles.modalDivider} />

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <Button
                  mode="contained"
                  onPress={() => setDetailModalVisible(false)}
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
  },
  
  // Breadcrumbs styles
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: ms(12),
    paddingHorizontal: ms(20),
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  breadcrumbText: {
    fontSize: ms(13),
    fontWeight: '600',
    color: Palette.textLight,
  },
  breadcrumbActive: {
    color: Palette.primary,
    fontWeight: '700',
  },
  breadcrumbSeparator: {
    marginHorizontal: ms(8),
  },

  // Headers
  scrollContent: {
    paddingHorizontal: ms(20),
    paddingTop: ms(16),
    paddingBottom: ms(32),
  },
  listContainer: {
    paddingHorizontal: ms(20),
    paddingTop: ms(16),
    paddingBottom: ms(32),
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  headerBox: {
    marginBottom: ms(20),
    marginTop: ms(4),
  },
  title: {
    fontSize: ms(22),
    fontWeight: '900',
    color: Palette.textDark,
  },
  subtitle: {
    fontSize: ms(13),
    color: Palette.textLight,
    marginTop: ms(4),
    lineHeight: 18,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ms(10),
  },
  backLinkText: {
    fontSize: ms(14),
    fontWeight: '700',
    color: Palette.primary,
    marginLeft: ms(6),
  },

  // Step 1: Department cards
  deptCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    padding: ms(16),
    marginBottom: ms(16),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(4) },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  iconFrame: {
    width: ms(46),
    height: ms(46),
    borderRadius: ms(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ms(12),
  },
  deptCode: {
    fontSize: ms(16),
    fontWeight: '800',
    color: Palette.textDark,
  },
  deptName: {
    fontSize: ms(12),
    color: Palette.textLight,
    fontWeight: '500',
    marginTop: ms(2),
    height: ms(36),
    lineHeight: 18,
  },
  deptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: ms(10),
    marginBottom: ms(6),
  },
  deptCount: {
    fontSize: ms(11),
    fontWeight: '600',
    color: Palette.textLight,
  },
  deptCoverage: {
    fontSize: ms(12),
    fontWeight: '800',
  },
  progressBar: {
    height: ms(5),
    borderRadius: ms(2.5),
  },

  // Step 2: Year cards
  yearsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  yearCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: ms(18),
    padding: ms(16),
    marginBottom: ms(14),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: ms(0), height: ms(2) },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  yearCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ms(12),
  },
  yearIndicator: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(10),
  },
  yearIndicatorText: {
    fontSize: ms(13),
    fontWeight: '800',
  },
  yearTitle: {
    fontSize: ms(14),
    fontWeight: '800',
    color: Palette.textDark,
  },
  yearCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(6),
  },
  yearClassesMuted: {
    fontSize: ms(11),
    color: Palette.textLight,
    fontWeight: '500',
  },
  yearPercent: {
    fontSize: ms(12.5),
    fontWeight: '800',
  },
  yearProgressBar: {
    height: ms(4),
    borderRadius: ms(2),
  },

  // Step 3: Classes
  classesContainer: {
    marginTop: ms(4),
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    marginBottom: ms(14),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(4) },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ms(14),
  },
  className: {
    fontSize: ms(16),
    fontWeight: '800',
    color: Palette.textDark,
  },
  classDeptCode: {
    fontSize: ms(12),
    color: Palette.textLight,
    fontWeight: '500',
    marginTop: ms(1),
  },
  pendingBadge: {
    backgroundColor: '#FEF2F2',
    color: Palette.error,
    fontWeight: '800',
    paddingHorizontal: ms(8),
    borderRadius: ms(6),
  },
  okBadge: {
    backgroundColor: '#ECFDF5',
    color: Palette.success,
    fontWeight: '800',
    paddingHorizontal: ms(8),
    borderRadius: ms(6),
  },
  progressSection: {
    marginBottom: ms(12),
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ms(6),
  },
  progressLabel: {
    fontSize: ms(12),
    color: Palette.textLight,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: ms(13),
    fontWeight: '800',
  },
  classProgressBar: {
    height: ms(6),
    borderRadius: ms(3),
  },
  inspectBtn: {
    alignSelf: 'flex-start',
    marginLeft: ms(-8),
  },
  inspectLabel: {
    fontSize: ms(12.5),
    fontWeight: '700',
    color: Palette.primary,
  },

  // Detail Modal styles
  modalContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: ms(16),
  },
  modalContent: {
    width: width - 32,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: ms(24),
    overflow: 'hidden',
    elevation: 10,
    padding: ms(16),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: ms(8),
  },
  modalTitleBox: {
    flex: 1,
    marginRight: ms(8),
  },
  modalTitle: {
    fontSize: ms(18),
    fontWeight: '900',
    color: Palette.textDark,
  },
  modalSubtitle: {
    fontSize: ms(12),
    color: Palette.textLight,
    marginTop: ms(2),
  },
  closeBtn: {
    padding: ms(6),
  },
  modalDivider: {
    marginVertical: ms(8),
  },
  modalScroll: {
    marginVertical: ms(8),
  },
  modalSubjectCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: ms(14),
    marginBottom: ms(12),
  },
  modalSubjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ms(10),
  },
  modalSubjectLeft: {
    flex: 1,
    paddingRight: ms(8),
  },
  modalSubjectCode: {
    fontSize: ms(11),
    fontWeight: '800',
    color: Palette.primary,
  },
  modalSubjectName: {
    fontSize: ms(14.5),
    fontWeight: '800',
    color: Palette.textDark,
    marginTop: ms(2),
  },
  modalSubjectFaculty: {
    fontSize: ms(12),
    color: Palette.textLight,
    fontWeight: '500',
    marginTop: ms(2),
  },
  modalSubjectRight: {
    alignItems: 'flex-end',
  },
  modalStatusBadge: {
    paddingHorizontal: ms(8),
    borderRadius: ms(6),
    fontWeight: '800',
  },
  statusLogged: {
    backgroundColor: '#ECFDF5',
    color: Palette.success,
  },
  statusPending: {
    backgroundColor: '#FEF2F2',
    color: Palette.error,
  },
  modalProgressSection: {
    marginTop: ms(4),
  },
  modalProgressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ms(6),
  },
  modalProgressLabel: {
    fontSize: ms(11),
    color: Palette.textLight,
    fontWeight: '600',
  },
  modalProgressValue: {
    fontSize: ms(12.5),
    fontWeight: '800',
  },
  modalProgressBar: {
    height: ms(5),
    borderRadius: ms(2.5),
    marginBottom: ms(6),
  },
  modalTopicsCount: {
    fontSize: ms(10.5),
    color: Palette.textLight,
    fontWeight: '500',
  },
  modalFooter: {
    paddingTop: ms(10),
  },
  modalCloseButton: {
    borderRadius: ms(12),
  },
  // Switcher and Subject styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: ms(14),
    padding: ms(5),
    marginBottom: ms(16),
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ms(10),
    borderRadius: ms(10),
    gap: ms(6),
  },
  activeTabButton: {
    backgroundColor: Palette.primary,
    elevation: 2,
  },
  tabText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: Palette.textLight,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  subjectsGrid: {
    gap: ms(12),
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(2) },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(8),
  },
  subCodeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: ms(8),
    paddingVertical: ms(4),
    borderRadius: ms(6),
  },
  subCodeText: {
    fontSize: ms(11),
    fontWeight: '800',
    color: Palette.primary,
  },
  subYearBadge: {
    fontSize: ms(11.5),
    color: Palette.textLight,
    fontWeight: '600',
  },
  subjectName: {
    fontSize: ms(15),
    fontWeight: '800',
    color: Palette.textDark,
    marginBottom: ms(8),
  },
  subDivider: {
    marginVertical: ms(8),
    backgroundColor: '#F1F5F9',
  },
  subjectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    flex: 1,
  },
  metaText: {
    fontSize: ms(11.5),
    color: Palette.textLight,
    fontWeight: '500',
  },
});

export default DeptSummaryScreen;
