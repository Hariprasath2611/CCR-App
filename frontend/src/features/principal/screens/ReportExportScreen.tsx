import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip, Divider, Avatar } from 'react-native-paper';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateReportHTML } from '@services/api/reportPdfTemplate';
import { generateReportWord } from '@services/api/reportWordTemplate';
import { ms } from '@theme/responsive';

const DEPARTMENTS = [
  { id: 'ALL', name: 'All Departments (Institutional)' },
  { id: 'CSE', name: 'Computer Science and Engineering' },
  { id: 'AI&DS', name: 'Artificial Intelligence & Data Science' },
  { id: 'IT', name: 'Information Technology' },
  { id: 'ECE', name: 'Electronics and Communication' },
  { id: 'EEE', name: 'Electrical and Electronics' },
  { id: 'MECH', name: 'Mechanical Engineering' },
];

const WEEKS = [
  { id: 12, label: 'Academic Week 12 (Current)' },
  { id: 11, label: 'Academic Week 11' },
  { id: 10, label: 'Academic Week 10' },
  { id: 9, label: 'Academic Week 9' },
  { id: 8, label: 'Academic Week 8' },
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
        // Excel simulation
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
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* ── HEADER BANNER ── */}
        <View style={styles.headerCard}>
          <View style={styles.headerIconBox}>
            <MaterialCommunityIcons name="file-export-outline" size={32} color={Palette.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Central Export Center</Text>
            <Text style={styles.headerSubtitle}>
              Export Anna University regulation compliant course coverage dossiers for executive inspection.
            </Text>
          </View>
        </View>

        {/* ── DEPARTMENT SCOPE SELECTOR ── */}
        <View style={styles.configCard}>
          <Text style={styles.configLabel}>1. Select Target Department Scope</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {DEPARTMENTS.map((dept) => (
              <Chip
                key={dept.id}
                selected={selectedDept === dept.id}
                onPress={() => setSelectedDept(dept.id)}
                style={[styles.chip, selectedDept === dept.id && styles.chipActive]}
                textStyle={[styles.chipText, selectedDept === dept.id && styles.chipTextActive]}
              >
                {dept.id === 'ALL' ? 'All Departments' : dept.id}
              </Chip>
            ))}
          </ScrollView>

          {/* ── ACADEMIC WEEK SELECTOR ── */}
          <Text style={[styles.configLabel, { marginTop: ms(16) }]}>2. Select Academic Week</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {WEEKS.map((w) => (
              <Chip
                key={w.id}
                selected={selectedWeek === w.id}
                onPress={() => setSelectedWeek(w.id)}
                style={[styles.chip, selectedWeek === w.id && styles.chipActive]}
                textStyle={[styles.chipText, selectedWeek === w.id && styles.chipTextActive]}
              >
                {w.label}
              </Chip>
            ))}
          </ScrollView>

          {/* ── FORMAT SELECTOR ── */}
          <Text style={[styles.configLabel, { marginTop: ms(16) }]}>3. Choose Export Format</Text>
          <View style={styles.formatRow}>
            <TouchableOpacity
              style={[styles.formatCard, exportFormat === 'PDF' && styles.formatCardActive]}
              onPress={() => setExportFormat('PDF')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="file-pdf-box"
                size={32}
                color={exportFormat === 'PDF' ? '#DC2626' : '#64748B'}
              />
              <Text style={[styles.formatTitle, exportFormat === 'PDF' && styles.formatTitleActive]}>
                PDF Document
              </Text>
              <Text style={styles.formatSub}>Official signed report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.formatCard, exportFormat === 'DOCX' && styles.formatCardActive]}
              onPress={() => setExportFormat('DOCX')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="file-word-box"
                size={32}
                color={exportFormat === 'DOCX' ? '#2563EB' : '#64748B'}
              />
              <Text style={[styles.formatTitle, exportFormat === 'DOCX' && styles.formatTitleActive]}>
                MS Word (.docx)
              </Text>
              <Text style={styles.formatSub}>Editable syllabus tables</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.formatCard, exportFormat === 'EXCEL' && styles.formatCardActive]}
              onPress={() => setExportFormat('EXCEL')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="file-excel-box"
                size={32}
                color={exportFormat === 'EXCEL' ? '#16A34A' : '#64748B'}
              />
              <Text style={[styles.formatTitle, exportFormat === 'EXCEL' && styles.formatTitleActive]}>
                Excel (.xlsx)
              </Text>
              <Text style={styles.formatSub}>Data audit spreadsheet</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── EXPORT ACTION BUTTON ── */}
        <Button
          mode="contained"
          icon={isExporting ? undefined : 'download'}
          onPress={handleExport}
          disabled={isExporting}
          style={styles.exportBtn}
          labelStyle={styles.exportBtnLabel}
          contentStyle={{ height: ms(48) }}
          buttonColor={Palette.primary}
        >
          {isExporting ? <ActivityIndicator color="#FFFFFF" size="small" /> : `Generate ${exportFormat} Dossier`}
        </Button>

        {/* ── RECENT AUDIT EXPORTS ── */}
        <View style={styles.recentSection}>
          <Text style={styles.recentHeading}>Recent Generated Dossiers</Text>
          {RECENT_EXPORTS.map((item) => (
            <Card key={item.id} style={styles.recentCard}>
              <Card.Content style={styles.recentCardContent}>
                <View style={styles.recentIconBox}>
                  <MaterialCommunityIcons
                    name={item.format === 'PDF' ? 'file-pdf-box' : 'file-word-box'}
                    size={28}
                    color={item.format === 'PDF' ? '#DC2626' : '#2563EB'}
                  />
                </View>
                <View style={styles.recentDetails}>
                  <Text style={styles.recentTitle}>{item.title}</Text>
                  <Text style={styles.recentMeta}>
                    {item.scope} • {item.size}
                  </Text>
                  <Text style={styles.recentDate}>Generated: {item.date}</Text>
                </View>
                <TouchableOpacity
                  style={styles.shareIconBtn}
                  onPress={() => Alert.alert('Share File', `Dispatching ${item.title}...`)}
                >
                  <Feather name="share-2" size={18} color={Palette.primary} />
                </TouchableOpacity>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: ms(16),
    paddingBottom: ms(40),
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    padding: ms(16),
    marginBottom: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  headerIconBox: {
    width: ms(52),
    height: ms(52),
    borderRadius: ms(14),
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(14),
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: ms(18),
    fontWeight: '900',
    color: Palette.textDark,
  },
  headerSubtitle: {
    fontSize: ms(12),
    color: Palette.textLight,
    marginTop: ms(3),
    lineHeight: ms(16),
  },
  configCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    padding: ms(16),
    marginBottom: ms(16),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  configLabel: {
    fontSize: ms(13),
    fontWeight: '800',
    color: '#475569',
    marginBottom: ms(10),
  },
  chipsRow: {
    flexDirection: 'row',
    marginBottom: ms(4),
  },
  chip: {
    marginRight: ms(8),
    backgroundColor: '#F8FAFC',
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  chipText: {
    fontSize: ms(12),
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  formatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: ms(8),
  },
  formatCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: ms(12),
    padding: ms(12),
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  formatCardActive: {
    borderColor: Palette.primary,
    backgroundColor: '#EFF6FF',
  },
  formatTitle: {
    fontSize: ms(12),
    fontWeight: '700',
    color: Palette.textDark,
    marginTop: ms(6),
    textAlign: 'center',
  },
  formatTitleActive: {
    color: Palette.primary,
    fontWeight: '800',
  },
  formatSub: {
    fontSize: ms(10),
    color: '#64748B',
    textAlign: 'center',
    marginTop: ms(2),
  },
  exportBtn: {
    borderRadius: ms(12),
    marginBottom: ms(20),
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  exportBtnLabel: {
    fontSize: ms(14),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  recentSection: {
    marginTop: ms(4),
  },
  recentHeading: {
    fontSize: ms(14),
    fontWeight: '800',
    color: Palette.textDark,
    marginBottom: ms(10),
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(12),
    marginBottom: ms(10),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  recentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ms(12),
  },
  recentIconBox: {
    marginRight: ms(12),
  },
  recentDetails: {
    flex: 1,
  },
  recentTitle: {
    fontSize: ms(13),
    fontWeight: '700',
    color: Palette.textDark,
  },
  recentMeta: {
    fontSize: ms(11),
    color: '#64748B',
    marginTop: ms(1),
  },
  recentDate: {
    fontSize: ms(10),
    color: '#94A3B8',
    marginTop: ms(1),
  },
  shareIconBtn: {
    padding: ms(8),
    borderRadius: ms(8),
    backgroundColor: '#EFF6FF',
    marginLeft: ms(8),
  },
});

export default ReportExportScreen;
