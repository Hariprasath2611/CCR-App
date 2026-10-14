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
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { SegBar } from '@components/editorial/SegBar';
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
      <StatusBar barStyle="dark-content" backgroundColor={EditorialColors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, EditorialSpacing.topSafeArea),
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Label text={`DEPARTMENT CURRICULUM • ${deptCode}`} />
          <Text style={styles.headerTitle}>
            DEPARTMENT CLASSES<Text style={styles.accentDot}>.</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Course coverage monitoring, class progress and syllabus logs.
          </Text>
        </View>

        {/* 4px Heavy Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* Tab Toggle: Classes vs Subjects */}
        <View style={styles.tabToggleRow}>
          <EditorialChip
            label="CLASSES"
            selected={activeTab === 'classes'}
            onPress={() => setActiveTab('classes')}
          />
          <EditorialChip
            label="SUBJECTS"
            selected={activeTab === 'subjects'}
            onPress={() => setActiveTab('subjects')}
          />
        </View>

        {/* Year Filter Chips */}
        <View style={styles.yearChipRow}>
          {YEARS.map((yr) => (
            <EditorialChip
              key={yr}
              label={yr.toUpperCase()}
              selected={selectedYear === yr}
              onPress={() => setSelectedYear(yr)}
            />
          ))}
        </View>

        {/* 1px Hairline Rule */}
        <Rule thickness="hairline" style={styles.hairlineSpacer} />

        {activeTab === 'classes' ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>
                {selectedYear.toUpperCase()} SECTIONS
              </Text>
              <Label text={`${filteredClasses.length} SECTIONS`} />
            </View>

            <View style={styles.classList}>
              {filteredClasses.map((cls) => {
                const ccInfo = getCCForSection(cls.classId);
                const isLagging = cls.coverage < 75;
                return (
                  <View key={cls.classId} style={styles.classRow}>
                    <View style={styles.rowTop}>
                      <View style={styles.classInfo}>
                        <Text style={styles.className}>{cls.name}</Text>
                        <Label
                          text={`CC: ${ccInfo?.facultyName?.toUpperCase() || 'UNASSIGNED'}${
                            cls.pendingCount > 0 ? ' • PENDING REVIEW' : ''
                          }`}
                          style={styles.ccMetaLabel}
                        />
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

                    {/* 25-Segment Bar */}
                    <View style={styles.segBarWrapper}>
                      <SegBar
                        totalSegments={25}
                        filledSegments={Math.round((cls.coverage / 100) * 25)}
                        isLagging={isLagging}
                      />
                    </View>

                    {/* Row Action Buttons */}
                    <View style={styles.rowActions}>
                      <TouchableOpacity
                        style={styles.actionOutlineBtn}
                        onPress={() => handleOpenSpreadsheet(cls)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionOutlineBtnText}>SPREADSHEET</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionPrimaryBtn}
                        onPress={() =>
                          navigation.navigate('SubjectReports', { classId: cls.classId })
                        }
                        activeOpacity={0.85}
                      >
                        <Text style={styles.actionPrimaryBtnText}>VIEW REPORTS</Text>
                        <Feather name="arrow-right" size={14} color={EditorialColors.white} />
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
              <Label text={`${departmentSubjects.length} COURSES`} />
            </View>

            <View style={styles.classList}>
              {departmentSubjects.map((sub) => (
                <View key={sub.code} style={styles.classRow}>
                  <View style={styles.rowTop}>
                    <View style={styles.classInfo}>
                      <Text style={styles.subjectCode}>{sub.code}</Text>
                      <Text style={styles.className}>{sub.name}</Text>
                      <Label text={`FACULTY: ${sub.faculty.toUpperCase()} • ${sub.topics} TOPICS`} />
                    </View>
                  </View>
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
                <Text style={styles.modalTitle}>
                  CONSOLIDATED SPREADSHEET<Text style={styles.accentDot}>.</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}
                  accessibilityLabel="Close modal"
                >
                  <Feather name="x" size={20} color={EditorialColors.ink} />
                </TouchableOpacity>
              </View>

              <Rule thickness="hairline" style={{ marginBottom: 16 }} />

              {selectedReport && (
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                  <WeeklyCourseCoverageReportCard report={selectedReport} showDownloadButton={false} />

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalActionBtn}
                      onPress={() => handleExportPDF(selectedReport)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.modalActionBtnText}>EXPORT PDF</Text>
                      <Feather name="download" size={14} color={EditorialColors.white} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalOutlineBtn}
                      onPress={() => handleExportWord(selectedReport)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalOutlineBtnText}>EXPORT WORD</Text>
                      <Feather name="file-text" size={14} color={EditorialColors.ink} />
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
    backgroundColor: EditorialColors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
  },
  content: {
    paddingHorizontal: EditorialSpacing.screenHorizontal,
  },
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: EditorialFonts.display,
    fontSize: 34,
    lineHeight: 38,
    color: EditorialColors.ink,
    letterSpacing: -0.5,
    marginTop: 4,
    marginBottom: 4,
  },
  accentDot: {
    color: EditorialColors.accent,
  },
  headerSubtitle: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
    lineHeight: 18,
  },
  heavySpacer: {
    marginVertical: 18,
  },
  hairlineSpacer: {
    marginVertical: 16,
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
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.ink,
  },
  classList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
  },
  classRow: {
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.ink,
    paddingVertical: 14,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  classInfo: {
    flex: 1,
    marginRight: 12,
  },
  subjectCode: {
    fontFamily: EditorialFonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    color: EditorialColors.muted,
    marginBottom: 2,
  },
  className: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 17,
    lineHeight: 22,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  ccMetaLabel: {
    letterSpacing: 1.5,
  },
  rightValueBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  percentText: {
    fontFamily: EditorialFonts.display,
    fontSize: 28,
    lineHeight: 32,
    color: EditorialColors.ink,
  },
  accentPercentText: {
    color: EditorialColors.accent,
  },
  segBarWrapper: {
    marginTop: 2,
    marginBottom: 12,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  actionOutlineBtn: {
    height: 38,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionOutlineBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
  },
  actionPrimaryBtn: {
    height: 38,
    paddingHorizontal: 14,
    backgroundColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionPrimaryBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 17, 17, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: EditorialColors.bg,
    borderWidth: 2,
    borderColor: EditorialColors.ink,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: EditorialFonts.display,
    fontSize: 18,
    color: EditorialColors.ink,
    letterSpacing: 0.5,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalActionBtn: {
    flex: 1,
    height: 48,
    backgroundColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalActionBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 1.5,
    color: EditorialColors.white,
  },
  modalOutlineBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalOutlineBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
  },
});
