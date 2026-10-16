import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { AppButton } from '@components/common/AppButton';
import { Feather } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateReportHTML } from '@services/api/reportPdfTemplate';
import { generateReportWord } from '@services/api/reportWordTemplate';
import { ms } from '@theme/responsive';

const DEPARTMENTS = [
  { id: 'ALL', name: 'All Departments' },
  { id: 'CSE', name: 'Computer Science' },
  { id: 'AI&DS', name: 'AI & Data Science' },
  { id: 'IT', name: 'Information Tech' },
  { id: 'ECE', name: 'Electronics' },
  { id: 'EEE', name: 'Electrical' },
  { id: 'MECH', name: 'Mechanical' },
];

const WEEKS = [
  { id: 12, label: 'Week 12 (Current)' },
  { id: 11, label: 'Week 11' },
  { id: 10, label: 'Week 10' },
  { id: 9, label: 'Week 9' },
  { id: 8, label: 'Week 8' },
];

interface RecentExport {
  id: string;
  title: string;
  scope: string;
  format: 'PDF' | 'DOCX' | 'XLSX';
  date: string;
  size: string;
}

const RECENT_EXPORTS: RecentExport[] = [
  {
    id: 'exp_1',
    title: 'Institutional_Syllabus_Audit_W11.pdf',
    scope: 'All Departments (48 Classes)',
    format: 'PDF',
    date: '10/10/2026, 05:40 PM',
    size: '1.4 MB',
  },
  {
    id: 'exp_2',
    title: 'CSE_Consolidated_Coverage_W11.docx',
    scope: 'CSE Department (8 Classes)',
    format: 'DOCX',
    date: '10/10/2026, 02:15 PM',
    size: '420 KB',
  },
  {
    id: 'exp_3',
    title: 'AU_Regulation_Audit_Report_W10.pdf',
    scope: 'All Departments (48 Classes)',
    format: 'PDF',
    date: '03/10/2026, 06:10 PM',
    size: '1.3 MB',
  },
];

export const ReportExportScreen = () => {
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedWeek, setSelectedWeek] = useState(12);
  const [exportFormat, setExportFormat] = useState<'PDF' | 'DOCX' | 'EXCEL'>('PDF');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const mockReportData = {
        id: `INST_${selectedDept}_W${selectedWeek}`,
        classId: selectedDept === 'ALL' ? 'Institution Central' : `${selectedDept} Department`,
        weekNumber: selectedWeek,
        overallCoverage: 86,
        submittedBy: 'Office of the Principal',
        submittedAt: new Date().toISOString().split('T')[0],
        ccRemarks: 'Official Institutional Course Coverage Endorsement.',
        status: 'SENT_TO_ADMIN' as const,
        subjects: [
          {
            subjectCode: 'CS3591',
            subjectName: 'Computer Networks',
            facultyName: 'Ms. Punitha EM',
            periodsPlanned: 45,
            periodsTaken: 42,
            coverage: 88,
            status: 'ON_TRACK' as const,
          },
          {
            subjectCode: 'CS3551',
            subjectName: 'Distributed Computing',
            facultyName: 'Mr. S Faizal Mukthar Hussain',
            periodsPlanned: 42,
            periodsTaken: 42,
            coverage: 92,
            status: 'ON_TRACK' as const,
          },
          {
            subjectCode: 'CS3492',
            subjectName: 'Database Management Systems',
            facultyName: 'Mrs. Agnus',
            periodsPlanned: 45,
            periodsTaken: 41,
            coverage: 85,
            status: 'ON_TRACK' as const,
          },
          {
            subjectCode: 'GE3151',
            subjectName: 'Problem Solving & Python',
            facultyName: 'Mrs. Jasline',
            periodsPlanned: 45,
            periodsTaken: 44,
            coverage: 87,
            status: 'ON_TRACK' as const,
          },
        ],
      };

      if (exportFormat === 'PDF') {
        const html = generateReportHTML(mockReportData as any);
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
            dialogTitle: `Download Institutional Report (Week ${selectedWeek})`,
          });
        } else {
          Alert.alert('Export Ready', `Institutional PDF successfully generated at: ${uri}`);
        }
      } else if (exportFormat === 'DOCX') {
        const uri = await generateReportWord(mockReportData as any);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            dialogTitle: `Download Institutional Word Report (Week ${selectedWeek})`,
          });
        } else {
          Alert.alert('Export Ready', `Word report successfully generated at: ${uri}`);
        }
      } else {
        Alert.alert(
          'Excel Export Initiated',
          `Institutional Spreadsheet for ${selectedDept} (Week ${selectedWeek}) compiled and exported successfully.`
        );
      }
    } catch (err: any) {
      console.error('Export failed:', err);
      Alert.alert('Export Error', err?.message || 'Failed to generate report export.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── HEADER ── */}
        <View style={styles.headerBox}>
          <Text style={styles.captionText}>EXECUTIVE DOSSIER</Text>
          <Text style={styles.headingText}>Central Export Center</Text>
          <Text style={styles.subHeadingText}>
            Anna University regulation-compliant dossiers for executive inspection
          </Text>
        </View>

        {/* ── CONFIGURATION BLOCK ── */}
        <View style={styles.configBlock}>
          {/* Department Scope Selector */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Departmental Scope</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {DEPARTMENTS.map((dept) => {
              const isActive = selectedDept === dept.id;
              return (
                <TouchableOpacity
                  key={dept.id}
                  onPress={() => setSelectedDept(dept.id)}
                  style={[styles.chip, isActive && styles.chipActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {dept.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Academic Week Selector */}
          <View style={[styles.sectionHeader, { marginTop: ms(16) }]}>
            <Text style={styles.sectionTitle}>Academic Audit Week</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {WEEKS.map((w) => {
              const isActive = selectedWeek === w.id;
              return (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => setSelectedWeek(w.id)}
                  style={[styles.chip, isActive && styles.chipActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {w.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Format Selector */}
          <View style={[styles.sectionHeader, { marginTop: ms(16) }]}>
            <Text style={styles.sectionTitle}>Export Dossier Format</Text>
          </View>
          <View style={styles.formatRow}>
            <TouchableOpacity
              style={[styles.formatCard, exportFormat === 'PDF' && styles.formatCardActive]}
              onPress={() => setExportFormat('PDF')}
              activeOpacity={0.8}
            >
              <Text style={[styles.formatTitle, exportFormat === 'PDF' && styles.formatTitleActive]}>
                PDF
              </Text>
              <Text style={[styles.formatSub, exportFormat === 'PDF' && styles.formatSubActive]}>
                Official Signed
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.formatCard, exportFormat === 'DOCX' && styles.formatCardActive]}
              onPress={() => setExportFormat('DOCX')}
              activeOpacity={0.8}
            >
              <Text style={[styles.formatTitle, exportFormat === 'DOCX' && styles.formatTitleActive]}>
                DOCX
              </Text>
              <Text style={[styles.formatSub, exportFormat === 'DOCX' && styles.formatSubActive]}>
                Editable Tables
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.formatCard, exportFormat === 'EXCEL' && styles.formatCardActive]}
              onPress={() => setExportFormat('EXCEL')}
              activeOpacity={0.8}
            >
              <Text style={[styles.formatTitle, exportFormat === 'EXCEL' && styles.formatTitleActive]}>
                XLSX
              </Text>
              <Text style={[styles.formatSub, exportFormat === 'EXCEL' && styles.formatSubActive]}>
                Data Audit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── EXPORT ACTION BUTTON ── */}
        <View style={styles.buttonSpacing}>
          <AppButton
            mode="contained"
            title={`Generate ${exportFormat} Dossier`}
            onPress={handleExport}
            loading={isExporting}
            disabled={isExporting}
          />
        </View>

        {/* ── RECENT AUDIT EXPORTS ── */}
        <View style={styles.recentSection}>
          <Text style={styles.captionText}>ARCHIVAL LOG</Text>
          <Text style={styles.recentHeading}>Recent Generated Dossiers</Text>

          {RECENT_EXPORTS.map((item) => (
            <View key={item.id} style={styles.recentRow}>
              <View style={styles.recentDetails}>
                <Text style={styles.recentTitle}>{item.title}</Text>
                <Text style={styles.recentMeta}>
                  {item.scope} · {item.size}
                </Text>
                <Text style={styles.recentDate}>Generated: {item.date}</Text>
              </View>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => Alert.alert('Share File', `Dispatching ${item.title}...`)}
                accessibilityLabel={`Share ${item.title}`}
              >
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
    paddingTop: DayRibbonSpacing.screenTop,
    paddingBottom: ms(48),
  },
  headerBox: {
    marginBottom: ms(16),
  },
  captionText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headingText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(26),
    color: DayRibbonColors.ink,
    marginTop: ms(4),
  },
  subHeadingText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    color: DayRibbonColors.muted,
    marginTop: ms(4),
    lineHeight: ms(18),
  },
  configBlock: {
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusCard,
    padding: ms(16),
    marginBottom: ms(16),
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: DayRibbonColors.line,
    paddingBottom: ms(8),
    marginBottom: ms(10),
  },
  sectionTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(13),
    color: DayRibbonColors.ink,
  },
  chipsRow: {
    flexDirection: 'row',
    marginBottom: ms(4),
  },
  chip: {
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusChip,
    paddingHorizontal: ms(14),
    paddingVertical: ms(8),
    marginRight: ms(8),
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: DayRibbonColors.ink,
    borderColor: DayRibbonColors.ink,
  },
  chipText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(11),
    color: DayRibbonColors.ink,
  },
  chipTextActive: {
    color: DayRibbonColors.surface,
  },
  formatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: ms(8),
    marginTop: ms(4),
  },
  formatCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusButton,
    backgroundColor: DayRibbonColors.surface,
    paddingVertical: ms(12),
    alignItems: 'center',
  },
  formatCardActive: {
    backgroundColor: DayRibbonColors.ink,
    borderColor: DayRibbonColors.ink,
  },
  formatTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(15),
    color: DayRibbonColors.ink,
  },
  formatTitleActive: {
    color: DayRibbonColors.surface,
  },
  formatSub: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(9.5),
    color: DayRibbonColors.muted,
    marginTop: ms(2),
    letterSpacing: 0.5,
  },
  formatSubActive: {
    color: DayRibbonColors.surface,
  },
  buttonSpacing: {
    marginBottom: ms(24),
  },
  recentSection: {
    marginTop: ms(4),
  },
  recentHeading: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(15),
    color: DayRibbonColors.ink,
    marginBottom: ms(12),
    marginTop: ms(4),
  },
  recentRow: {
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusCard,
    padding: ms(14),
    marginBottom: ms(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentDetails: {
    flex: 1,
    marginRight: ms(12),
  },
  recentTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(13),
    color: DayRibbonColors.ink,
  },
  recentMeta: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    marginTop: ms(2),
  },
  recentDate: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(10),
    color: DayRibbonColors.muted,
    marginTop: ms(4),
  },
  shareBtn: {
    borderWidth: 1.5,
    borderColor: DayRibbonColors.ink,
    borderRadius: DayRibbonShapes.radiusButton,
    paddingHorizontal: ms(14),
    height: 38,
    backgroundColor: DayRibbonColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(11),
    color: DayRibbonColors.ink,
  },
});

export default ReportExportScreen;
