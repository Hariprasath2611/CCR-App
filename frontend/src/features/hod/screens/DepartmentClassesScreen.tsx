import React, { useState } from 'react';
import { Alert, StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useReportStore, ConsolidatedReport } from '@features/cc/store/useReportStore';
import { WeeklyCourseCoverageReportCard } from '../../cc/components/WeeklyCourseCoverageReportCard';
import { Feather } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateReportHTML } from '@services/api/reportPdfTemplate';
import { generateReportWord } from '@services/api/reportWordTemplate';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCCForSection } from '@config/facultyBoard';
import {
  DayRibbonColors,
  DayRibbonFonts,
  DayRibbonShapes,
  DayRibbonSpacing,
} from '@theme/dayRibbon';
import { ProgressBar } from '@components/editorial/ProgressBar';
import { EditorialChip } from '@components/editorial/EditorialChip';

interface ClassData {
  classId: string;
  name: string;
  year: string;
  coverage: number;
  pendingCount: number;
}

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const DepartmentClassesScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const reports = useReportStore((state) => state.reports);

  const [activeTab, setActiveTab] = useState<'classes' | 'subjects'>('classes');
  const [selectedYear, setSelectedYear] = useState<string>('2nd Year');
  const [selectedReport, setSelectedReport] = useState<ConsolidatedReport | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

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

  const getClassesForDept = (code: string): ClassData[] => {
    const classMap: Record<string, ClassData> = {};

    const default1stYear = [
      { classId: '1st Year SEC-A', name: '1st Year SEC-A', year: '1st Year', coverage: 78, pendingCount: 0 },
      { classId: '1st Year SEC-B', name: '1st Year SEC-B', year: '1st Year', coverage: 82, pendingCount: 0 },
      { classId: '1st Year SEC-C', name: '1st Year SEC-C', year: '1st Year', coverage: 75, pendingCount: 1 },
      { classId: '1st Year SEC-D', name: '1st Year SEC-D', year: '1st Year', coverage: 80, pendingCount: 0 },
      { classId: '1st Year SEC-E', name: '1st Year SEC-E', year: '1st Year', coverage: 70, pendingCount: 0 },
      { classId: '1st Year SEC-F', name: '1st Year SEC-F', year: '1st Year', coverage: 85, pendingCount: 0 },
      { classId: '1st Year SEC-G', name: '1st Year SEC-G', year: '1st Year', coverage: 72, pendingCount: 1 },
    ];
    for (const def of default1stYear) {
      classMap[def.classId] = def;
    }

    for (const report of reports) {
      if (report.classId.includes(code) || report.classId.includes('1st Year')) {
        if (!classMap[report.classId]) {
          classMap[report.classId] = {
            classId: report.classId,
            name: report.classId,
            year: report.classId.includes('1st') ? '1st Year' : report.classId.includes('2nd') ? '2nd Year' : report.classId.includes('3rd') ? '3rd Year' : '4th Year',
            coverage: report.overallCoverage,
            pendingCount: report.status === 'SUBMITTED_TO_HOD' ? 1 : 0,
          };
        } else {
          classMap[report.classId].coverage = report.overallCoverage;
          if (report.status === 'SUBMITTED_TO_HOD') classMap[report.classId].pendingCount = 1;
        }
      }
    }
    const resultList = Object.values(classMap);
    resultList.sort((a, b) => a.classId.localeCompare(b.classId, undefined, { numeric: true, sensitivity: 'base' }));
    return resultList;
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
      Alert.alert('Export Error', 'Failed to generate PDF document.');
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
      Alert.alert('Export Error', 'Failed to export Word document.');
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
            paddingTop: Math.max(insets.top, DayRibbonSpacing.screenTop),
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.captionTag}>DEPARTMENT CURRICULUM • {deptCode}</Text>
          <Text style={styles.headerTitle}>Department Classes</Text>
          <Text style={styles.headerSubtitle}>
            Course coverage monitoring, class progress and syllabus logs.
          </Text>
        </View>

        {/* Tab Toggle: Classes vs Subjects */}
        <View style={styles.tabToggleRow}>
          <EditorialChip
            label="Classes"
            selected={activeTab === 'classes'}
            onPress={() => setActiveTab('classes')}
          />
          <EditorialChip
            label="Subjects"
            selected={activeTab === 'subjects'}
            onPress={() => setActiveTab('subjects')}
          />
        </View>

        {/* Year Filter Chips */}
        <View style={styles.yearChipRow}>
          {YEARS.map((yr) => (
            <EditorialChip
              key={yr}
              label={yr}
              selected={selectedYear === yr}
              onPress={() => setSelectedYear(yr)}
            />
          ))}
        </View>

        {activeTab === 'classes' ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>
                {selectedYear.toUpperCase()} SECTIONS
              </Text>
              <Text style={styles.sectionHeaderMeta}>{filteredClasses.length} SECTIONS</Text>
            </View>

            <View style={styles.classList}>
              {filteredClasses.map((cls) => {
                const ccInfo = getCCForSection(cls.classId);
                const isBehind = cls.coverage < 75;
                return (
                  <View key={cls.classId} style={styles.classCard}>
                    <View style={styles.cardTop}>
                      <View style={styles.classInfo}>
                        <Text style={styles.className}>{cls.name}</Text>
                        <Text style={styles.ccMetaLabel}>
                          CC: {ccInfo?.facultyName || 'Unassigned'}
                          {cls.pendingCount > 0 ? ' • Pending Review' : ''}
                        </Text>
                      </View>

                      <View style={styles.rightValueBox}>
                        <Text
                          style={[
                            styles.percentText,
                            isBehind ? styles.warnPercentText : styles.cobaltPercentText,
                          ]}
                        >
                          {cls.coverage}%
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <ProgressBar
                      progress={cls.coverage}
                      isBehindPlan={isBehind}
                      height={8}
                      style={styles.progressBar}
                    />

                    {/* Card Actions */}
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.outlineActionBtn}
                        onPress={() => handleOpenSpreadsheet(cls)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.outlineActionBtnText}>Spreadsheet</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.primaryActionBtn}
                        onPress={() =>
                          navigation.navigate('SubjectReports', { classId: cls.classId })
                        }
                        activeOpacity={0.85}
                      >
                        <Text style={styles.primaryActionBtnText}>View Reports</Text>
                        <Feather name="arrow-right" size={14} color={DayRibbonColors.white} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>
                {selectedYear.toUpperCase()} SUBJECTS
              </Text>
              <Text style={styles.sectionHeaderMeta}>{departmentSubjects.length} COURSES</Text>
            </View>

            <View style={styles.classList}>
              {departmentSubjects.map((sub) => (
                <View key={sub.code} style={styles.subjectCard}>
                  <View style={styles.codeMetaRow}>
                    <Text style={styles.subjectCode}>{sub.code}</Text>
                    <Text style={styles.subjectYear}>{sub.year}</Text>
                  </View>
                  <Text style={styles.className}>{sub.name}</Text>
                  <Text style={styles.ccMetaLabel}>
                    Faculty: {sub.faculty} • {sub.topics} Topics
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Modal for viewing spreadsheet */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Consolidated Spreadsheet</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseBtn}
                  accessibilityLabel="Close modal"
                >
                  <Feather name="x" size={20} color={DayRibbonColors.ink} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {selectedReport && (
                  <WeeklyCourseCoverageReportCard
                    report={selectedReport}
                    showDownloadButton={false}
                  />
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalSecondaryBtn}
                  onPress={() => selectedReport && handleExportWord(selectedReport)}
                  activeOpacity={0.8}
                >
                  <Feather name="file-text" size={16} color={DayRibbonColors.ink} />
                  <Text style={styles.modalSecondaryBtnText}>Word</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={() => selectedReport && handleExportPDF(selectedReport)}
                  activeOpacity={0.8}
                >
                  <Feather name="download" size={16} color={DayRibbonColors.white} />
                  <Text style={styles.modalPrimaryBtnText}>Export PDF</Text>
                </TouchableOpacity>
              </View>
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
  header: {
    marginBottom: 16,
  },
  captionTag: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: DayRibbonColors.ink,
    letterSpacing: -0.5,
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
    marginBottom: 12,
  },
  yearChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
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
    letterSpacing: 0.5,
    color: DayRibbonColors.ink,
  },
  sectionHeaderMeta: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    color: DayRibbonColors.muted,
  },
  classList: {
    width: '100%',
  },
  classCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 16,
    marginBottom: 14,
    ...DayRibbonShapes.shadow,
  },
  subjectCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 16,
    marginBottom: 12,
    ...DayRibbonShapes.shadow,
  },
  codeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  subjectCode: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.cobalt,
  },
  subjectYear: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  classInfo: {
    flex: 1,
    marginRight: 12,
  },
  className: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    lineHeight: 22,
    color: DayRibbonColors.ink,
    marginBottom: 4,
  },
  ccMetaLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    color: DayRibbonColors.muted,
  },
  rightValueBox: {
    alignItems: 'flex-end',
  },
  percentText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 26,
    lineHeight: 30,
  },
  cobaltPercentText: {
    color: DayRibbonColors.cobalt,
  },
  warnPercentText: {
    color: DayRibbonColors.warn,
  },
  progressBar: {
    marginTop: 12,
    marginBottom: 14,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  outlineActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineActionBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.ink,
  },
  primaryActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: DayRibbonColors.cobalt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryActionBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 19, 48, 0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    maxHeight: '90%',
    padding: 20,
    ...DayRibbonShapes.shadow,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 20,
    color: DayRibbonColors.ink,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    maxHeight: 460,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalSecondaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalSecondaryBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    color: DayRibbonColors.ink,
  },
  modalPrimaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: DayRibbonColors.cobalt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalPrimaryBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    color: DayRibbonColors.white,
  },
});

export default DepartmentClassesScreen;
