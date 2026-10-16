import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, Divider } from 'react-native-paper';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ConsolidatedReport, SubjectProgress } from '../store/useReportStore';
import { getSectionTemplate, filterNonAcademicSubjects } from '@config/sectionTemplates';
import { ms } from '@theme/responsive';

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

  // Retrieve section template configuration
  const template = getSectionTemplate(classId);
  const displaySubjects = filterNonAcademicSubjects(subjects || []);

  const sectionChar = template.section;
  const displayClass = `Year: ${template.semester === 'I' ? 'I' : 'I'} / Sem: ${template.semester}`;
  const displayDept = template.department;

  const loggedSubjects = displaySubjects.filter(s => s.status === 'Submitted' && s.fromDate && s.toDate);
  const firstLogged = loggedSubjects[0];

  const getDates = (week: number) => {
    const baseDate = new Date(2024, 4, 20); // 20 May 2024
    const weeksDiff = week - 5;
    const startDate = new Date(baseDate.getTime() + weeksDiff * 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);

    const formatDate = (d: Date) => {
      const dd = d.getDate().toString().padStart(2, '0');
      const mm = (d.getMonth() + 1).toString().padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    };

    return {
      from: formatDate(startDate),
      to: formatDate(endDate),
    };
  };

  const dates = getDates(weekNumber);
  const fromDateVal = firstLogged?.fromDate ? firstLogged.fromDate.replace(/\//g, '.') : dates.from;
  const toDateVal = firstLogged?.toDate ? firstLogged.toDate.replace(/\//g, '.') : dates.to;

  const getBriefTopics = (code: string): string[] => {
    const lookup: Record<string, string[]> = {
      CS3591: ['OSI & TCP/IP Network Models', 'Data Link Layer & Framing', 'Routing Algorithms'],
      CS3501: ['Lexical Analysis & DFA', 'Syntax Analysis & Parsers', 'Syntax Directed Translation'],
      CB3491: ['Symmetric Key Encryption', 'Public Key Cryptography', 'Firewalls & Cyber Security'],
      CS3551: ['Message Passing IPC', 'Distributed File Systems', 'Mutual Exclusion Algorithms'],
      CCS375: ['HTML5 structure & CSS3 styling', 'JavaScript DOM manipulation', 'React Component Architecture'],
      CCS370: ['User Research & Personas', 'Wireframing & Prototyping', 'Usability Testing Methods'],
      MX3084: ['Natural Hazards & Cyclones', 'Mitigation Systems & Plans', 'Risk Assessment Strategies'],
    };
    return lookup[code] || ['Unit syllabus topics covered', 'Weekly planned sub-topics', 'Class presentation session'];
  };

  const totalHours = displaySubjects.reduce((sum, s) => sum + (s.completedTopicsCount * 1.5), 0);

  return (
    <Card style={styles.outerCard}>
      <Card.Content style={styles.cardContent}>
        {/* ── Section Title Header ── */}
        <View style={styles.docHeader}>
          <View style={styles.headerIconBox}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color={DayRibbonColors.cobalt} />
          </View>
          <View style={styles.titleWrapper}>
            <Text style={styles.captionText}>OFFICIAL ACADEMIC AUDIT</Text>
            <Text style={styles.docTitle}>Weekly Course Coverage Report</Text>
          </View>
        </View>

        {/* ── Metadata Info Block Grid (2 Columns) ── */}
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <InfoItem icon="office-building" label="Department" value={displayDept} />
            <InfoItem icon="account-group-outline" label="Class" value={displayClass} />
            <InfoItem icon="door" label="Section" value={sectionChar} />
          </View>

          <View style={styles.infoColumn}>
            <InfoItem icon="clock-outline" label="From Date" value={fromDateVal} />
            <InfoItem icon="clock-check-outline" label="To Date" value={toDateVal} />
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
              <Text style={[styles.cell, styles.colHours, styles.headerText]}>Hours Done</Text>
              <Text style={[styles.cell, styles.colPercent, styles.headerText]}>Cumulative %</Text>
              <Text style={[styles.cell, styles.colTopics, styles.headerText]}>Topics Covered (Brief)</Text>
              <Text style={[styles.cell, styles.colCompleted, styles.headerText]}>On Schedule</Text>
              <Text style={[styles.cell, styles.colReason, styles.headerText]}>If No Reason</Text>
              <Text style={[styles.cell, styles.colExtra, styles.headerText]}>Extra Hours Req.</Text>
            </View>

            {/* Table Data Rows */}
            {displaySubjects.map((subj, index) => {
              const actualTopicsText = subj.topicsCoveredText || '';
              const topics = actualTopicsText
                ? actualTopicsText.split(/[,\n]/).map(t => t.trim()).filter(Boolean)
                : getBriefTopics(subj.code);
              const completedHours = Math.round(subj.completedTopicsCount * 1.5);
              const isCompleted = subj.completedOnPlan ? subj.completedOnPlan === 'YES' : subj.coverage >= 60;
              
              return (
                <View key={subj.code} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
                  <Text style={[styles.cell, styles.colSn]}>{index + 1}</Text>
                  <Text style={[styles.cell, styles.colCode, styles.boldCode]}>{subj.code}</Text>
                  <Text style={[styles.cell, styles.colName]}>{subj.name}</Text>
                  <Text style={[styles.cell, styles.colFaculty]}>{subj.faculty}</Text>
                  <Text style={[styles.cell, styles.colHours]}>{completedHours}</Text>
                  <Text style={[styles.cell, styles.colPercent]}>{subj.cumulativePercent || `${subj.coverage}%`}</Text>
                  <View style={[styles.cell, styles.colTopics, styles.bulletCell]}>
                    {topics.map((t, idx) => (
                      <Text key={idx} style={styles.bulletText}>• {t}</Text>
                    ))}
                  </View>
                  <Text style={[
                    styles.cell, 
                    styles.colCompleted, 
                    { color: isCompleted ? DayRibbonColors.cobalt : DayRibbonColors.warn, fontFamily: DayRibbonFonts.body700 }
                  ]}>
                    {isCompleted ? 'Yes' : 'No'}
                  </Text>
                  <Text style={[styles.cell, styles.colReason]}>
                    {isCompleted ? '-' : (subj.reasonsForPending || '-')}
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
              <Text style={[styles.cell, styles.colPercent, styles.footerText]}>-</Text>
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
            <MaterialCommunityIcons name="clipboard-check-outline" size={16} color={DayRibbonColors.cobalt} />
            <Text style={styles.remarkLabel}>Topics for Next Week (All Subjects)</Text>
          </View>
          <Text style={styles.remarkContent}>Continue with remaining topics as per the lesson plan.</Text>
        </View>

        {/* ── Remarks Card ── */}
        <View style={[styles.remarkBox, { marginTop: ms(12) }]}>
          <View style={styles.remarkHeader}>
            <Feather name="message-square" size={14} color={DayRibbonColors.cobalt} />
            <Text style={styles.remarkLabel}>Remarks (if any)</Text>
          </View>
          <Text style={styles.remarkContent}>{ccRemarks || 'Nil'}</Text>
        </View>

        {hodRemarks ? (
          <View style={[styles.remarkBox, { marginTop: ms(12), borderLeftColor: DayRibbonColors.warn, backgroundColor: DayRibbonColors.warnBg }]}>
            <View style={styles.remarkHeader}>
              <Feather name="alert-triangle" size={14} color={DayRibbonColors.warn} />
              <Text style={[styles.remarkLabel, { color: DayRibbonColors.warn }]}>HOD Decision Remarks</Text>
            </View>
            <Text style={[styles.remarkContent, { color: DayRibbonColors.warn, fontStyle: 'italic' }]}>
              "{hodRemarks}"
            </Text>
          </View>
        ) : null}

        {/* ── Action Buttons ── */}
        {showDownloadButton && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={onDownloadPress}
            activeOpacity={0.8}
            accessibilityLabel="Download Report PDF"
          >
            <Feather name="download" size={18} color={DayRibbonColors.surface} />
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
      <MaterialCommunityIcons name={icon as any} size={15} color={DayRibbonColors.cobalt} />
    </View>
    <View style={styles.infoTextWrapper}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  outerCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.radiusCard,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    elevation: 0,
    width: '100%',
  },
  cardContent: {
    padding: ms(16),
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ms(16),
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(12),
  },
  titleWrapper: {
    flex: 1,
  },
  captionText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(10),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  docTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(16),
    color: DayRibbonColors.ink,
    marginTop: ms(2),
  },
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
    alignItems: 'center',
    marginBottom: ms(10),
  },
  infoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DayRibbonColors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(8),
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(9.5),
    color: DayRibbonColors.muted,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(12),
    color: DayRibbonColors.ink,
    marginTop: ms(1),
  },
  divider: {
    backgroundColor: DayRibbonColors.line,
    marginVertical: ms(16),
  },
  tableLabel: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(12),
    color: DayRibbonColors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: ms(10),
  },
  tableScrollView: {
    width: '100%',
  },
  tableBlock: {
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusButton,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.surface,
    alignItems: 'stretch',
  },
  tableRowAlt: {
    backgroundColor: DayRibbonColors.bg,
  },
  tableHeader: {
    backgroundColor: DayRibbonColors.bg,
    borderBottomWidth: 1.5,
    borderBottomColor: DayRibbonColors.line,
  },
  tableFooter: {
    backgroundColor: DayRibbonColors.bg,
    borderTopWidth: 1.5,
    borderTopColor: DayRibbonColors.line,
    borderBottomWidth: 0,
  },
  cell: {
    padding: ms(10),
    fontSize: ms(12),
    fontFamily: DayRibbonFonts.body500,
    color: DayRibbonColors.ink,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: DayRibbonColors.line,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: ms(11),
    fontFamily: DayRibbonFonts.body700,
    color: DayRibbonColors.ink,
    textAlign: 'center',
  },
  footerText: {
    fontFamily: DayRibbonFonts.body700,
    color: DayRibbonColors.muted,
  },
  footerValue: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(14),
    color: DayRibbonColors.cobalt,
  },
  boldCode: {
    fontFamily: DayRibbonFonts.body700,
    color: DayRibbonColors.cobalt,
  },
  bulletCell: {
    alignItems: 'flex-start',
    paddingVertical: ms(8),
  },
  bulletText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(11),
    color: DayRibbonColors.ink,
    lineHeight: ms(16),
    textAlign: 'left',
  },
  colSn: { width: ms(50) },
  colCode: { width: ms(90) },
  colName: { width: ms(140) },
  colFaculty: { width: ms(130) },
  colPercent: { width: ms(140) },
  colHours: { width: ms(90) },
  colTopics: { width: ms(200) },
  colCompleted: { width: ms(100) },
  colReason: { width: ms(120) },
  colExtra: { width: ms(100) },
  remarkBox: {
    backgroundColor: DayRibbonColors.bg,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusButton,
    padding: ms(12),
    borderLeftWidth: 3,
    borderLeftColor: DayRibbonColors.cobalt,
  },
  remarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ms(4),
  },
  remarkLabel: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(11),
    color: DayRibbonColors.cobalt,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: ms(6),
  },
  remarkContent: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    color: DayRibbonColors.ink,
    lineHeight: ms(18),
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: DayRibbonColors.cobalt,
    borderRadius: DayRibbonShapes.radiusButton,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: ms(16),
    width: '100%',
  },
  downloadText: {
    color: DayRibbonColors.surface,
    fontSize: ms(14),
    fontFamily: DayRibbonFonts.body700,
    marginLeft: ms(8),
  },
});

export default WeeklyCourseCoverageReportCard;
