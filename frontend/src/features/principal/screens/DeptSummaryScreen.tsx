import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StatusBar,
  Modal,
} from 'react-native';
import { useReportStore, ConsolidatedReport } from '@features/cc/store/useReportStore';
import { WeeklyCourseCoverageReportCard } from '../../cc/components/WeeklyCourseCoverageReportCard';
import { Feather } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateReportHTML } from '@services/api/reportPdfTemplate';
import { generateReportWord } from '@services/api/reportWordTemplate';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCCForSection } from '@config/facultyBoard';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { Label } from '@components/editorial/Label';
import { ProgressBar } from '@components/editorial/ProgressBar';
import { EditorialChip } from '@components/editorial/EditorialChip';

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
  { id: 'AERO', name: 'Aeronautical Engineering', code: 'AERO', icon: 'airplane', iconColor: '#111111', bgColor: '#FFFFFF', coverage: 81, classesCount: 8 },
  { id: 'CIVIL', name: 'Civil Engineering', code: 'CIVIL', icon: 'home-city', iconColor: '#111111', bgColor: '#FFFFFF', coverage: 73, classesCount: 8 },
  { id: 'CSE', name: 'Computer Science and Engineering', code: 'CSE', icon: 'laptop', iconColor: '#111111', bgColor: '#FFFFFF', coverage: 82, classesCount: 12 },
  { id: 'CSE-AIML', name: 'CSE (AI and Machine Learning)', code: 'CSE-AIML', icon: 'brain', iconColor: '#111111', bgColor: '#FFFFFF', coverage: 85, classesCount: 8 },
  { id: 'CCE', name: 'Computer and Communication Eng.', code: 'CCE', icon: 'transit-connection-variant', iconColor: '#111111', bgColor: '#FFFFFF', coverage: 78, classesCount: 8 },
  { id: 'CSBS', name: 'Computer Science & Business Systems', code: 'CSBS', icon: 'briefcase-outline', iconColor: '#111111', bgColor: '#FFFFFF', coverage: 84, classesCount: 8 },
  { id: 'ECE', name: 'Electronics and Communication Eng.', code: 'ECE', icon: 'memory', iconColor: '#111111', bgColor: '#FFFFFF', coverage: 80, classesCount: 8 },
  { id: 'EEE', name: 'Electrical & Electronics Eng.', code: 'EEE', icon: 'flash', iconColor: '#111111', bgColor: '#FFFFFF', coverage: 75, classesCount: 8 },
  { id: 'EIE', name: 'Electronics & Instrumentation Eng.', code: 'EIE', icon: 'sine-wave', iconColor: '#111111', bgColor: '#FFFFFF', coverage: 76, classesCount: 8 },
  { id: 'MECH', name: 'Mechanical Engineering', code: 'MECH', icon: 'cog', iconColor: '#111111', bgColor: '#FFFFFF', coverage: 71, classesCount: 8 },
  { id: 'RA', name: 'Robotics and Automation', code: 'RA', icon: 'robot', iconColor: '#111111', bgColor: '#FFFFFF', coverage: 79, classesCount: 8 },
  { id: 'IT', name: 'Information Technology', code: 'IT', icon: 'web', iconColor: '#111111', bgColor: '#FFFFFF', coverage: 79, classesCount: 8 },
  { id: 'ME-VLSI', name: 'M.E – VLSI Design', code: 'ME-VLSI', icon: 'memory', iconColor: '#111111', bgColor: '#FFFFFF', coverage: 88, classesCount: 4 },
  { id: 'MBA', name: 'Master of Business Administration', code: 'MBA', icon: 'briefcase', iconColor: '#111111', bgColor: '#FFFFFF', coverage: 83, classesCount: 6 },
  { id: 'MCA', name: 'Master of Computer Applications', code: 'MCA', icon: 'code-tags', iconColor: '#111111', bgColor: '#FFFFFF', coverage: 86, classesCount: 6 },
  { id: 'TEXTILE', name: 'Textile Technology', code: 'TEXTILE', icon: 'tshirt-crew', iconColor: '#111111', bgColor: '#FFFFFF', coverage: 74, classesCount: 8 },
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

interface ClassProgressInfo {
  classId: string;
  name: string;
  coverage: number;
  pendingCount: number;
}

export const DeptSummaryScreen = () => {
  const insets = useSafeAreaInsets();
  const reports = useReportStore((state) => state.reports);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDept, setSelectedDept] = useState<DeptInfo | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ConsolidatedReport | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [deptTab, setDeptTab] = useState<'years' | 'subjects'>('years');

  const dynamicDepartments = DEPARTMENTS.map((dept) => {
    const deptReports = reports.filter(r => r.classId.toLowerCase().includes(dept.code.toLowerCase()));
    const totalClasses = new Set(deptReports.map(r => r.classId)).size;
    const avgCoverage = deptReports.length > 0
      ? Math.round(deptReports.reduce((sum, r) => sum + r.overallCoverage, 0) / deptReports.length)
      : dept.coverage;

    return {
      ...dept,
      classesCount: totalClasses || dept.classesCount,
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
      { code: `${deptCode}3491`, year: '3rd Year', name: 'Cryptography & Security', faculty: 'Dr. Suresh Babu', topics: 5 },
      { code: `${deptCode}3551`, year: '3rd Year', name: 'Distributed Computing', faculty: 'Prof. Divya R', topics: 5 },
    ];
  };

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
      for (const def of default1stYear) {
        classMap[def.classId] = def;
      }
    } else {
      const sections = ['A', 'B'];
      for (const sec of sections) {
        const cId = `${year} ${deptId}-${sec}`;
        classMap[cId] = {
          classId: cId,
          name: cId,
          coverage: 80,
          pendingCount: 0,
        };
      }
    }

    for (const report of reports) {
      if (report.classId.includes(deptId) || (year === '1st Year' && report.classId.includes('1st Year'))) {
        if (classMap[report.classId]) {
          classMap[report.classId].coverage = report.overallCoverage;
          if (report.status === 'SUBMITTED_TO_HOD') classMap[report.classId].pendingCount = 1;
        }
      }
    }

    return Object.values(classMap);
  };

  const handleDeptSelect = (dept: DeptInfo) => {
    setSelectedDept(dept);
    setStep(2);
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setStep(3);
  };

  const handleClassSelect = (cls: ClassProgressInfo) => {
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
      setSelectedReport(null);
      setStep(1);
    } else if (targetStep === 2) {
      setSelectedYear(null);
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
      Alert.alert('Export Failed', 'An error occurred while generating the Word document.');
    }
  };

  return (
    <View style={styles.screenWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor={DayRibbonColors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, DayRibbonSpacing.topSafeArea),
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Breadcrumb Navigation */}
        <View style={styles.breadcrumbBar}>
          <TouchableOpacity
            style={[styles.crumbChip, step === 1 && styles.crumbChipActive]}
            onPress={() => handleBreadcrumbClick(1)}
            activeOpacity={0.7}
          >
            <Text style={[styles.crumbText, step === 1 && styles.crumbTextActive]}>DEPTS</Text>
          </TouchableOpacity>
          {selectedDept && (
            <>
              <Feather name="chevron-right" size={14} color={DayRibbonColors.muted} />
              <TouchableOpacity
                style={[styles.crumbChip, step === 2 && styles.crumbChipActive]}
                onPress={() => handleBreadcrumbClick(2)}
                activeOpacity={0.7}
              >
                <Text style={[styles.crumbText, step === 2 && styles.crumbTextActive]}>{selectedDept.code}</Text>
              </TouchableOpacity>
            </>
          )}
          {selectedYear && (
            <>
              <Feather name="chevron-right" size={14} color={DayRibbonColors.muted} />
              <View style={[styles.crumbChip, styles.crumbChipActive]}>
                <Text style={[styles.crumbText, styles.crumbTextActive]}>{selectedYear.toUpperCase()}</Text>
              </View>
            </>
          )}
        </View>

        {/* STEP 1: Departments List */}
        {step === 1 && (
          <>
            <View style={styles.header}>
              <Label text="INSTITUTIONAL DIRECTORY" />
              <Text style={styles.headerTitle}>All Departments</Text>
              <Text style={styles.headerSubtitle}>
                Select an engineering or postgraduate department to inspect syllabus progress.
              </Text>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>ACADEMIC DEPARTMENTS</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{dynamicDepartments.length} TOTAL</Text>
              </View>
            </View>

            <View style={styles.deptList}>
              {dynamicDepartments.map((dept) => {
                const isLagging = dept.coverage < 75;
                return (
                  <TouchableOpacity
                    key={dept.id}
                    style={styles.deptCard}
                    onPress={() => handleDeptSelect(dept)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.rowTop}>
                      <View style={styles.infoCol}>
                        <View style={styles.codeRow}>
                          <Text style={styles.deptCode}>{dept.code}</Text>
                          <Text style={styles.classesMeta}>{dept.classesCount} Classes</Text>
                        </View>
                        <Text style={styles.deptName}>{dept.name}</Text>
                      </View>

                      <View style={styles.rightValueBox}>
                        <Text
                          style={[
                            styles.percentText,
                            isLagging ? styles.accentPercentText : null,
                          ]}
                        >
                          {dept.coverage}%
                        </Text>
                      </View>
                    </View>

                    <ProgressBar
                      progress={dept.coverage / 100}
                      isLagging={isLagging}
                      style={styles.progressSpacing}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* STEP 2: Department Drill-Down */}
        {step === 2 && selectedDept && (
          <>
            <View style={styles.header}>
              <Label text={`DEPARTMENT • ${selectedDept.code}`} />
              <Text style={styles.headerTitle}>{selectedDept.name}</Text>
              <Text style={styles.headerSubtitle}>
                Select an academic year to inspect sections or view course catalog.
              </Text>
            </View>

            {/* Toggle Tab */}
            <View style={styles.tabToggleRow}>
              <EditorialChip
                label="YEARS & CLASSES"
                selected={deptTab === 'years'}
                onPress={() => setDeptTab('years')}
              />
              <EditorialChip
                label="COURSE CATALOG"
                selected={deptTab === 'subjects'}
                onPress={() => setDeptTab('subjects')}
              />
            </View>

            {deptTab === 'years' ? (
              <View style={styles.deptList}>
                {YEARS.map((yr, idx) => {
                  const yrClasses = getClassesForDeptAndYear(selectedDept.code, yr);
                  const yrAvg = Math.round(
                    yrClasses.reduce((sum, c) => sum + c.coverage, 0) / (yrClasses.length || 1)
                  );
                  const isLagging = yrAvg < 75;

                  return (
                    <TouchableOpacity
                      key={yr}
                      style={styles.deptCard}
                      onPress={() => handleYearSelect(yr)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.rowTop}>
                        <View style={styles.infoCol}>
                          <Text style={styles.deptCode}>YEAR 0{idx + 1}</Text>
                          <Text style={styles.deptName}>{yr}</Text>
                          <Text style={styles.classesMeta}>{yrClasses.length} Sections Mapped</Text>
                        </View>

                        <View style={styles.rightValueBox}>
                          <Text
                            style={[
                              styles.percentText,
                              isLagging ? styles.accentPercentText : null,
                            ]}
                          >
                            {yrAvg}%
                          </Text>
                        </View>
                      </View>

                      <ProgressBar
                        progress={yrAvg / 100}
                        isLagging={isLagging}
                        style={styles.progressSpacing}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.deptList}>
                {getAllSubjectsForDept(selectedDept.code).map((sub) => (
                  <View key={sub.code} style={styles.deptCard}>
                    <View style={styles.rowTop}>
                      <View style={styles.infoCol}>
                        <Text style={styles.deptCode}>{sub.code}</Text>
                        <Text style={styles.deptName}>{sub.name}</Text>
                        <Text style={styles.classesMeta}>
                          Faculty: {sub.faculty} • {sub.topics} Units
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* STEP 3: Classes in Year */}
        {step === 3 && selectedDept && selectedYear && (
          <>
            <View style={styles.header}>
              <Label text={`${selectedDept.code} • ${selectedYear.toUpperCase()}`} />
              <Text style={styles.headerTitle}>Section Audit</Text>
              <Text style={styles.headerSubtitle}>
                Class syllabus completion and verified coordinator spreadsheets.
              </Text>
            </View>

            <View style={styles.deptList}>
              {getClassesForDeptAndYear(selectedDept.code, selectedYear).map((cls) => {
                const isLagging = cls.coverage < 75;
                const ccInfo = getCCForSection(cls.classId);

                return (
                  <View key={cls.classId} style={styles.deptCard}>
                    <View style={styles.rowTop}>
                      <View style={styles.infoCol}>
                        <Text style={styles.deptCode}>{cls.classId}</Text>
                        <Text style={styles.classesMeta}>
                          Coordinator: {ccInfo?.facultyName || 'Assigned CC'}
                        </Text>
                      </View>

                      <View style={styles.rightValueBox}>
                        <Text
                          style={[
                            styles.percentText,
                            isLagging ? styles.accentPercentText : null,
                          ]}
                        >
                          {cls.coverage}%
                        </Text>
                      </View>
                    </View>

                    <ProgressBar
                      progress={cls.coverage / 100}
                      isLagging={isLagging}
                      style={styles.progressSpacing}
                    />

                    <View style={styles.rowActions}>
                      <TouchableOpacity
                        style={styles.actionOutlineBtn}
                        onPress={() => handleClassSelect(cls)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionOutlineBtnText}>Spreadsheet</Text>
                        <Feather name="arrow-right" size={14} color={DayRibbonColors.ink} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Modal for Spreadsheet Details */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={detailModalVisible}
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Consolidated Spreadsheet</Text>
                <TouchableOpacity
                  onPress={() => setDetailModalVisible(false)}
                  style={styles.modalCloseButton}
                  accessibilityLabel="Close modal"
                >
                  <Feather name="x" size={20} color={DayRibbonColors.ink} />
                </TouchableOpacity>
              </View>

              {selectedReport && (
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                  <WeeklyCourseCoverageReportCard report={selectedReport} showDownloadButton={false} />

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalActionBtn}
                      onPress={() => handleExportPDF(selectedReport)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.modalActionBtnText}>Export PDF</Text>
                      <Feather name="download" size={16} color={DayRibbonColors.surface} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalOutlineBtn}
                      onPress={() => handleExportWord(selectedReport)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalOutlineBtnText}>Export Word</Text>
                      <Feather name="file-text" size={16} color={DayRibbonColors.ink} />
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  content: {
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  crumbChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DayRibbonShapes.chipRadius,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: 'transparent',
  },
  crumbChipActive: {
    borderColor: DayRibbonColors.ink,
    backgroundColor: DayRibbonColors.ink,
  },
  crumbText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.muted,
  },
  crumbTextActive: {
    color: DayRibbonColors.surface,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: DayRibbonColors.ink,
    marginTop: 4,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
    lineHeight: 18,
  },
  tabToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    letterSpacing: 1.2,
    color: DayRibbonColors.ink,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: DayRibbonShapes.chipRadius,
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  countBadgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.muted,
  },
  deptList: {
    gap: 12,
  },
  deptCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 16,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoCol: {
    flex: 1,
    marginRight: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  deptCode: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.cobalt,
  },
  classesMeta: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  deptName: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    lineHeight: 22,
    color: DayRibbonColors.ink,
    marginBottom: 2,
  },
  rightValueBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  percentText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 26,
    lineHeight: 30,
    color: DayRibbonColors.cobalt,
  },
  accentPercentText: {
    color: DayRibbonColors.warn,
  },
  progressSpacing: {
    marginTop: 4,
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionOutlineBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionOutlineBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.ink,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 19, 48, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 20,
    color: DayRibbonColors.ink,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalActionBtn: {
    flex: 1,
    height: 52,
    borderRadius: DayRibbonShapes.buttonRadius,
    backgroundColor: DayRibbonColors.cobalt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalActionBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    color: DayRibbonColors.surface,
  },
  modalOutlineBtn: {
    flex: 1,
    height: 52,
    borderRadius: DayRibbonShapes.buttonRadius,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalOutlineBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    color: DayRibbonColors.ink,
  },
});
