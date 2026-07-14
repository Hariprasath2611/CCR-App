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

  const getAllSubjectsForDept = (deptCode: string) => {
    return [];
  };

  // Helper to generate classes list for a selected dept & year dynamically from reports
  const getClassesForDeptAndYear = (deptId: string, year: string): ClassProgressInfo[] => {
    const deptReports = reports.filter(
      (r) => r.classId.toLowerCase().includes(deptId.toLowerCase()) && r.classId.toLowerCase().includes(year.toLowerCase())
    );
    
    const classMap: Record<string, ClassProgressInfo> = {};
    for (const report of deptReports) {
      if (!classMap[report.classId]) {
        classMap[report.classId] = {
          classId: report.classId,
          name: report.classId,
          coverage: report.overallCoverage,
          pendingCount: report.status === 'SUBMITTED_TO_HOD' ? 1 : 0,
        };
      }
    }
    return Object.values(classMap);
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

          <View style={styles.classesContainer}>
            {activeClasses.map((cls) => (
              <Card key={cls.classId} style={styles.classCard} onPress={() => handleClassSelect(cls)}>
                <Card.Content>
                  <View style={styles.classHeader}>
                    <View>
                      <Text style={styles.className}>{cls.name}</Text>
                      <Text style={styles.classDeptCode}>{selectedDept.code} Department</Text>
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
            ))}
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
                <WeeklyCourseCoverageReportCard report={selectedReport} showDownloadButton={true} />
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  breadcrumbText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textLight,
  },
  breadcrumbActive: {
    color: Palette.primary,
    fontWeight: '700',
  },
  breadcrumbSeparator: {
    marginHorizontal: 8,
  },

  // Headers
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  headerBox: {
    marginBottom: 20,
    marginTop: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.textDark,
  },
  subtitle: {
    fontSize: 13,
    color: Palette.textLight,
    marginTop: 4,
    lineHeight: 18,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.primary,
    marginLeft: 6,
  },

  // Step 1: Department cards
  deptCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  iconFrame: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  deptCode: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.textDark,
  },
  deptName: {
    fontSize: 12,
    color: Palette.textLight,
    fontWeight: '500',
    marginTop: 2,
    height: 36,
    lineHeight: 18,
  },
  deptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  deptCount: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.textLight,
  },
  deptCoverage: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBar: {
    height: 5,
    borderRadius: 2.5,
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
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  yearCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  yearIndicator: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  yearIndicatorText: {
    fontSize: 13,
    fontWeight: '800',
  },
  yearTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.textDark,
  },
  yearCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  yearClassesMuted: {
    fontSize: 11,
    color: Palette.textLight,
    fontWeight: '500',
  },
  yearPercent: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  yearProgressBar: {
    height: 4,
    borderRadius: 2,
  },

  // Step 3: Classes
  classesContainer: {
    marginTop: 4,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  className: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.textDark,
  },
  classDeptCode: {
    fontSize: 12,
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
    marginBottom: 12,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: Palette.textLight,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  classProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  inspectBtn: {
    alignSelf: 'flex-start',
    marginLeft: -8,
  },
  inspectLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Palette.primary,
  },

  // Detail Modal styles
  modalContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: width - 32,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  modalTitleBox: {
    flex: 1,
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Palette.textDark,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Palette.textLight,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  modalDivider: {
    marginVertical: 8,
  },
  modalScroll: {
    marginVertical: 8,
  },
  modalSubjectCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  modalSubjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  modalSubjectLeft: {
    flex: 1,
    paddingRight: 8,
  },
  modalSubjectCode: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.primary,
  },
  modalSubjectName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Palette.textDark,
    marginTop: 2,
  },
  modalSubjectFaculty: {
    fontSize: 12,
    color: Palette.textLight,
    fontWeight: '500',
    marginTop: 2,
  },
  modalSubjectRight: {
    alignItems: 'flex-end',
  },
  modalStatusBadge: {
    paddingHorizontal: 8,
    borderRadius: 6,
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
    marginTop: 4,
  },
  modalProgressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalProgressLabel: {
    fontSize: 11,
    color: Palette.textLight,
    fontWeight: '600',
  },
  modalProgressValue: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  modalProgressBar: {
    height: 5,
    borderRadius: 2.5,
    marginBottom: 6,
  },
  modalTopicsCount: {
    fontSize: 10.5,
    color: Palette.textLight,
    fontWeight: '500',
  },
  modalFooter: {
    paddingTop: 10,
  },
  modalCloseButton: {
    borderRadius: 12,
  },
  // Switcher and Subject styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 5,
    marginBottom: 16,
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
});

export default DeptSummaryScreen;
