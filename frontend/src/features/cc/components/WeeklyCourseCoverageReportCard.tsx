import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, Divider, Chip } from 'react-native-paper';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { ConsolidatedReport, SubjectProgress } from '../store/useReportStore';

const { width } = Dimensions.get('window');

interface WeeklyCourseCoverageReportCardProps {
  report: ConsolidatedReport;
  onDownloadPress?: () => void;
  showDownloadButton?: boolean;
}

export const WeeklyCourseCoverageReportCard: React.FC<WeeklyCourseCoverageReportCardProps> = ({
  report,
  onDownloadPress,
  showDownloadButton = true,
}) => {
  const { classId, weekNumber, overallCoverage, subjects, ccRemarks, status, hodRemarks, approvedAt } = report;

  // Derive layout variables
  const isApprovedHOD = status === 'APPROVED_BY_HOD' || status === 'SENT_TO_ADMIN';
  const isApprovedAdmin = status === 'SENT_TO_ADMIN';

  const sectionChar = classId.split('-')[1] || 'A';
  const displayClass = classId.startsWith('CSE') ? 'III Year / V Semester' : 'II Year / III Semester';
  const displayDept = classId.startsWith('CSE') ? 'Computer Science and Engineering' : 'Information Technology';

  // Compute dates based on weekNumber
  const getDates = (week: number) => {
    // Arbitrary anchor date matching 20.05.2024
    const startDay = 20 + (week - 5) * 7;
    const startMonth = 5;
    const endDay = startDay + 5;
    return {
      from: `${startDay.toString().padStart(2, '0')}.0${startMonth}.2024`,
      to: `${endDay.toString().padStart(2, '0')}.0${startMonth}.2024`,
    };
  };

  const dates = getDates(weekNumber);

  // Topics completed lookup
  const getBriefTopics = (code: string): string[] => {
    const lookup: Record<string, string[]> = {
      CS8501: ['Finite Automata (DFA, NFA)', 'Regular Expressions', 'Context-Free Grammars'],
      CS8502: ['Relational Model - Concepts', 'Keys - Super Key, Candidate Key', 'ER Model - Basics'],
      CS8503: ['OSI & TCP/IP Network Models', 'Physical Layer Transmission', 'Data Link Layer & Framing'],
      CS8504: ['Process Scheduling & Threads', 'CPU Scheduling Algorithms', 'Deadlocks & Thread Sync'],
      CS3352: ['Relational Model - Concepts', 'Keys - Super Key, Candidate Key', 'ER Model - Basics'],
      CS3351: ['OS - Introduction', 'Process Management', 'CPU Scheduling - FCFS'],
      CS3353: ['Network Models - OSI & TCP/IP', 'Physical Layer', 'Data Link Layer'],
      CS3354: ['Software Process Models', 'Waterfall Model', 'Agile Model'],
    };
    return lookup[code] || ['Topic Node 1', 'Topic Node 2', 'Topic Node 3'];
  };

  // Calculate sum completed hours
  const totalHours = subjects.reduce((sum, s) => sum + (s.completedTopicsCount * 1.5), 0);

  return (
    <Card style={styles.outerCard}>
      <Card.Content style={styles.cardContent}>
        {/* ── Section Title Header ── */}
        <View style={styles.docHeader}>
          <View style={styles.headerIconBox}>
            <MaterialCommunityIcons name="file-document-outline" size={24} color="#0F52BA" />
          </View>
          <Text style={styles.docTitle}>WEEKLY COURSE COVERAGE REPORT</Text>
        </View>

        {/* ── Metadata Info Block Grid (2 Columns) ── */}
        <View style={styles.infoGrid}>
          {/* Column 1 */}
          <View style={styles.infoColumn}>
            <InfoItem icon="office-building" label="Department" value={displayDept} />
            <InfoItem icon="school-outline" label="Academic Year" value="2024 - 2025 (Odd Semester)" />
            <InfoItem icon="account-group-outline" label="Class" value={displayClass} />
            <InfoItem icon="door" label="Section" value={sectionChar} />
            <InfoItem icon="book-open-variant" label="Subject" value={subjects[0]?.name || 'Database Management Systems'} />
            <InfoItem icon="code-tags" label="Subject Code" value={subjects[0]?.code || 'CS3352'} />
          </View>

          {/* Column 2 */}
          <View style={styles.infoColumn}>
            <InfoItem icon="calendar-outline" label="Report Week No." value={weekNumber.toString()} />
            <InfoItem icon="clock-outline" label="From Date" value={dates.from} />
            <InfoItem icon="clock-check-outline" label="To Date" value={dates.to} />
            <InfoItem icon="briefcase-outline" label="No. of Working Days" value="6" />
            <InfoItem icon="account-tie" label="Prepared By" value="Class Coordinator" />
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* ── Spreadsheet-style Grid Table (Horizontally Scrollable) ── */}
        <Text style={styles.tableLabel}>Course Coverage Spreadsheet Details</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={true} style={styles.tableScrollView}>
          <View style={styles.tableBlock}>
            {/* Table Header Row */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.cell, styles.colSn, styles.headerText]}>S.No.</Text>
              <Text style={[styles.cell, styles.colCode, styles.headerText]}>Course Code</Text>
              <Text style={[styles.cell, styles.colName, styles.headerText]}>Course Name</Text>
              <Text style={[styles.cell, styles.colFaculty, styles.headerText]}>Faculty Name</Text>
              <Text style={[styles.cell, styles.colHours, styles.headerText]}>No. of Hours Completed</Text>
              <Text style={[styles.cell, styles.colTopics, styles.headerText]}>Topics Covered (Brief)</Text>
              <Text style={[styles.cell, styles.colCompleted, styles.headerText]}>Completed as per Schedule (Yes/No)</Text>
              <Text style={[styles.cell, styles.colReason, styles.headerText]}>If No Reason</Text>
              <Text style={[styles.cell, styles.colExtra, styles.headerText]}>If No. of Extra Hours Required</Text>
            </View>

            {/* Table Data Rows */}
            {subjects.map((subj, index) => {
              const topics = getBriefTopics(subj.code);
              const completedHours = Math.round(subj.completedTopicsCount * 1.5);
              const isCompleted = subj.coverage >= 60;
              
              return (
                <View key={subj.code} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
                  <Text style={[styles.cell, styles.colSn]}>{index + 1}</Text>
                  <Text style={[styles.cell, styles.colCode, styles.boldCode]}>{subj.code}</Text>
                  <Text style={[styles.cell, styles.colName]}>{subj.name}</Text>
                  <Text style={[styles.cell, styles.colFaculty]}>{subj.faculty}</Text>
                  <Text style={[styles.cell, styles.colHours]}>{completedHours}</Text>
                  <View style={[styles.cell, styles.colTopics, styles.bulletCell]}>
                    {topics.map((t, idx) => (
                      <Text key={idx} style={styles.bulletText}>• {t}</Text>
                    ))}
                  </View>
                  <Text style={[
                    styles.cell, 
                    styles.colCompleted, 
                    { color: isCompleted ? '#10B981' : '#EF4444', fontWeight: 'bold' }
                  ]}>
                    {isCompleted ? 'Yes' : 'No'}
                  </Text>
                  <Text style={[styles.cell, styles.colReason]}>
                    {isCompleted ? '-' : (subj.reasonsForPending || 'Topics not completed')}
                  </Text>
                  <Text style={[styles.cell, styles.colExtra]}>
                    {subj.extraHoursRequested ? '2' : '-'}
                  </Text>
                </View>
              );
            })}

            {/* Table Footer Row */}
            <View style={[styles.tableRow, styles.tableFooter]}>
              <Text style={[styles.cell, styles.colSn, styles.footerText]}>TOTAL</Text>
              <Text style={[styles.cell, styles.colCode, styles.footerText]}>-</Text>
              <Text style={[styles.cell, styles.colName, styles.footerText]}>-</Text>
              <Text style={[styles.cell, styles.colFaculty, styles.footerText]}>-</Text>
              <Text style={[styles.cell, styles.colHours, styles.footerValue]}>{totalHours}</Text>
              <Text style={[styles.cell, styles.colTopics, styles.footerText]}>-</Text>
              <Text style={[styles.cell, styles.colCompleted, styles.footerText]}>-</Text>
              <Text style={[styles.cell, styles.colReason, styles.footerText]}>-</Text>
              <Text style={[styles.cell, styles.colExtra, styles.footerText]}>-</Text>
            </View>
          </View>
        </ScrollView>

        <Divider style={styles.divider} />

        {/* ── Topics for Next Week Card ── */}
        <View style={styles.remarkBox}>
          <View style={styles.remarkHeader}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={16} color="#0F52BA" />
            <Text style={styles.remarkLabel}>Topics for Next Week (All Subjects)</Text>
          </View>
          <Text style={styles.remarkContent}>Continue with remaining topics as per the lesson plan.</Text>
        </View>

        {/* ── Remarks Card ── */}
        <View style={[styles.remarkBox, { marginTop: 12 }]}>
          <View style={styles.remarkHeader}>
            <Feather name="message-square" size={14} color="#0F52BA" />
            <Text style={styles.remarkLabel}>Remarks (if any)</Text>
          </View>
          <Text style={styles.remarkContent}>{ccRemarks || 'Nil'}</Text>
        </View>

        {hodRemarks ? (
          <View style={[styles.remarkBox, { marginTop: 12, borderLeftColor: '#EF4444' }]}>
            <View style={styles.remarkHeader}>
              <Feather name="alert-triangle" size={14} color="#EF4444" />
              <Text style={[styles.remarkLabel, { color: '#EF4444' }]}>HOD Decision Remarks</Text>
            </View>
            <Text style={[styles.remarkContent, { color: '#B91C1C', fontStyle: 'italic' }]}>
              "{hodRemarks}"
            </Text>
          </View>
        ) : null}

        <Divider style={styles.divider} />

        {/* ── Approval Signatures Panel ── */}
        <Text style={styles.approvalHeader}>APPROVAL SIGNATURES</Text>
        <View style={styles.signaturesRow}>
          
          {/* Card 1: HOD Signature */}
          <View style={styles.signatureCard}>
            <Text style={styles.signatureRole}>HOD Signature</Text>
            {isApprovedHOD ? (
              <View style={styles.stampWrapper}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.stampText}>Digitally Signed</Text>
                <Text style={styles.stampDate}>{approvedAt || 'HOD Approved'}</Text>
              </View>
            ) : (
              <View style={styles.stampWrapperPending}>
                <Text style={styles.pendingStampText}>Awaiting HOD</Text>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureDate}>Date: ________</Text>
              </View>
            )}
          </View>

          {/* Card 2: AC Signature */}
          <View style={styles.signatureCard}>
            <Text style={styles.signatureRole}>AC Signature</Text>
            {isApprovedHOD ? (
              <View style={styles.stampWrapper}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.stampText}>AC Logged</Text>
                <Text style={styles.stampDate}>System Checked</Text>
              </View>
            ) : (
              <View style={styles.stampWrapperPending}>
                <Text style={styles.pendingStampText}>Awaiting AC</Text>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureDate}>Date: ________</Text>
              </View>
            )}
          </View>

          {/* Card 3: Principal Signature */}
          <View style={styles.signatureCard}>
            <Text style={styles.signatureRole}>Principal Signature</Text>
            {isApprovedAdmin ? (
              <View style={styles.stampWrapper}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={[styles.stampText, { color: '#0F52BA' }]}>APPROVED</Text>
                <Text style={styles.stampDate}>Dr. Ramesh</Text>
              </View>
            ) : (
              <View style={styles.stampWrapperPending}>
                <Text style={styles.pendingStampText}>Awaiting Principal</Text>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureDate}>Date: ________</Text>
              </View>
            )}
          </View>

        </View>

        {/* ── Legend Reference Grid ── */}
        <Text style={styles.legendHeader}>LEGEND / FORMAT REFERENCE</Text>
        <View style={styles.legendTable}>
          <View style={styles.legendCol}>
            <Text style={styles.legendLabelText}>If No Reason</Text>
            <Text style={styles.legendArrow}>↓</Text>
            <Text style={styles.legendValueText}>HOD</Text>
          </View>
          <View style={styles.legendCol}>
            <Text style={styles.legendLabelText}>If No. of Extra Hrs Required</Text>
            <Text style={styles.legendArrow}>↓</Text>
            <Text style={styles.legendValueText}>AC</Text>
          </View>
          <View style={styles.legendCol}>
            <Text style={styles.legendLabelText}>Signature</Text>
            <Text style={styles.legendArrow}>↓</Text>
            <Text style={styles.legendValueText}>VP</Text>
          </View>
        </View>

        {/* ── Action Buttons ── */}
        {showDownloadButton && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={onDownloadPress}
            activeOpacity={0.8}
          >
            <Feather name="download" size={18} color="#FFFFFF" />
            <Text style={styles.downloadText}>Download Report (PDF)</Text>
          </TouchableOpacity>
        )}

      </Card.Content>
    </Card>
  );
};

const InfoItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconBox}>
      <MaterialCommunityIcons name={icon as any} size={15} color="#475569" />
    </View>
    <View style={styles.infoTextWrapper}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  outerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F52BA',
    letterSpacing: 0.5,
  },

  // 2 Col Grid
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  infoColumn: {
    width: '49%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
    lineHeight: 15,
  },

  divider: {
    backgroundColor: '#E2E8F0',
    marginVertical: 18,
  },

  // Table
  tableLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  tableScrollView: {
    width: '100%',
  },
  tableBlock: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'stretch',
  },
  tableRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  tableHeader: {
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 2,
    borderBottomColor: '#93C5FD',
  },
  tableFooter: {
    backgroundColor: '#F1F5F9',
    borderTopWidth: 1.5,
    borderTopColor: '#94A3B8',
    borderBottomWidth: 0,
  },
  cell: {
    padding: 10,
    fontSize: 12,
    color: '#334155',
    textAlign: 'center',
    verticalAlign: 'middle',
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
    textAlign: 'center',
  },
  footerText: {
    fontWeight: '800',
    color: '#475569',
  },
  footerValue: {
    fontWeight: '800',
    color: '#0F52BA',
  },
  boldCode: {
    fontWeight: '700',
    color: '#0F52BA',
  },
  bulletCell: {
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  bulletText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
    textAlign: 'left',
  },

  // Column Widths
  colSn: { width: 50 },
  colCode: { width: 90 },
  colName: { width: 140 },
  colFaculty: { width: 130 },
  colHours: { width: 90 },
  colTopics: { width: 200 },
  colCompleted: { width: 100 },
  colReason: { width: 120 },
  colExtra: { width: 100 },

  // Remark Blocks
  remarkBox: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0F52BA',
  },
  remarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  remarkLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F52BA',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 6,
  },
  remarkContent: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },

  // Signatures
  approvalHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 12,
  },
  signaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    gap: 8,
  },
  signatureCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  signatureRole: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 10,
  },
  stampWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  stampText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  stampDate: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  stampWrapperPending: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pendingStampText: {
    fontSize: 9,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  signatureLine: {
    width: '80%',
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 10,
  },
  signatureDate: {
    fontSize: 9,
    color: '#94A3B8',
  },

  // Legend Reference Table
  legendHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 10,
  },
  legendTable: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    marginBottom: 24,
  },
  legendCol: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  legendLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  legendArrow: {
    fontSize: 12,
    color: '#0F52BA',
    marginVertical: 2,
  },
  legendValueText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E40AF',
  },

  // Download Action Button
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: '#0F52BA',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F52BA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 8,
    width: '100%',
  },
  downloadText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});
