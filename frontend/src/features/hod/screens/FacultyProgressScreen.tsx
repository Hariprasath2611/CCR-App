import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, ProgressBar, Button, Badge, Divider } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReportStore, ConsolidatedReport } from '@features/cc/store/useReportStore';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { Palette } from '@theme/colors';
import { StaffStackParamList } from '@navigation/types';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { WeeklyCourseCoverageReportCard } from '../../cc/components/WeeklyCourseCoverageReportCard';

type RouteParams = RouteProp<StaffStackParamList, 'FacultyProgress'>;
type HodNav = NativeStackNavigationProp<StaffStackParamList>;

export const FacultyProgressScreen = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<HodNav>();
  const { user } = useAuthStore();
  const reports = useReportStore((state) => state.reports);
  const subjectProgressList = useReportStore((state) => state.subjectProgressList);

  const classId = route.params?.classId || 'CSE-B';
  const selectedWeek = '12'; // Default week

  // Helper to generate dynamic mock subjects for any class
  const getSubjectsProgressForClass = (clsId: string, week: string) => {
    const storeKey = `${clsId}_${week}`;
    if (subjectProgressList[storeKey] && subjectProgressList[storeKey].length > 0) {
      return subjectProgressList[storeKey];
    }

    // Determine dept code (e.g. CSE, CSBS, etc.)
    let deptCode = 'CSE';
    if (clsId.includes('CSBS')) deptCode = 'CSBS';
    else if (clsId.includes('AERO')) deptCode = 'AERO';
    else if (clsId.includes('CIVIL')) deptCode = 'CIVIL';
    else if (clsId.includes('ECE')) deptCode = 'ECE';
    else if (clsId.includes('EEE')) deptCode = 'EEE';
    else if (clsId.includes('IT')) deptCode = 'IT';
    else if (clsId.includes('MECH')) deptCode = 'MECH';

    // Determine year
    let yearNum = 3;
    if (clsId.includes('1st Year') || clsId.includes('1st')) yearNum = 1;
    else if (clsId.includes('2nd Year') || clsId.includes('2nd')) yearNum = 2;
    else if (clsId.includes('3rd Year') || clsId.includes('3rd')) yearNum = 3;
    else if (clsId.includes('4th Year') || clsId.includes('4th')) yearNum = 4;

    const templates = [
      'Theory of Computation', 'Database Systems', 'Computer Networks', 'OS Principles',
      'Compiler Design', 'Software Engineering', 'Aerodynamics', 'Aircraft Structures',
      'Propulsion', 'Control Engineering', 'Design of Machine Elements', 'Dynamics of Machines'
    ];
    const faculties = [
      'Dr. Meena Kumari', 'Prof. Karthick D', 'Prof. Rajesh K', 'Dr. Anita S',
      'Dr. Sundaram A', 'Prof. Priyadharshini M', 'Dr. Suresh Babu', 'Prof. Divya R'
    ];

    const yearRoman = ['I', 'II', 'III', 'IV'][yearNum - 1] || 'III';

    return [0, 1, 2, 3].map((idx) => {
      const templateName = templates[idx % templates.length];
      const name = yearNum === 1 ? `Fundamentals of ${templateName}` : `${templateName} ${yearRoman}`;
      const codeNum = 8000 + (yearNum * 100) + (idx + 1) * 10;
      const code = `${deptCode}${codeNum}`;
      const faculty = faculties[(deptCode.charCodeAt(0) + yearNum + idx) % faculties.length];
      
      let coverage = Math.min(60 + (idx * 8) + (yearNum * 2), 95);
      if (clsId.includes('-A')) {
        coverage = Math.min(78 + (idx * 4), 98);
      } else if (clsId.includes('-B') || clsId === 'CSE-B') {
        coverage = Math.min(68 + (idx * 5), 92);
      }

      const totalTopics = 8 + idx;
      const completedTopics = Math.round((coverage / 100) * totalTopics);

      return {
        code,
        name,
        faculty,
        coverage,
        status: 'Submitted' as const,
        completedTopicsCount: completedTopics,
        totalTopicsCount: totalTopics,
        reasonsForPending: coverage < 70 ? 'Practical labs delayed due to revision sessions.' : undefined,
        extraHoursRequested: coverage < 70 ? true : undefined,
      };
    });
  };

  const progressList = getSubjectsProgressForClass(classId, selectedWeek);

  const [viewMode, setViewMode] = useState<'list' | 'spreadsheet'>('list');

  // Filter pending consolidated reports submitted for this specific class
  const classPendingReports = reports.filter(
    (r) => r.classId === classId && r.status === 'SUBMITTED_TO_HOD'
  );
  const PENDING_REPORTS = classPendingReports.length;
  
  // Mock slot request for this class
  const PENDING_EXTRA_HOURS = classId === 'CSE-B' ? 1 : 0;

  // Find or construct ConsolidatedReport
  const existingReport = reports.find(
    (r) => r.classId === classId && r.weekNumber === parseInt(selectedWeek)
  );

  const averageCoverage = progressList.length > 0
    ? Math.round(progressList.reduce((sum, s) => sum + s.coverage, 0) / progressList.length)
    : 0;

  const reportToShow: ConsolidatedReport = existingReport || {
    id: `provisional-${classId}-W${selectedWeek}`,
    classId,
    weekNumber: parseInt(selectedWeek),
    overallCoverage: averageCoverage,
    submittedBy: 'Class Coordinator',
    submittedAt: new Date().toISOString().split('T')[0],
    ccRemarks: 'Provisional course coverage data based on latest faculty logs.',
    status: 'SUBMITTED_TO_HOD',
    subjects: progressList.map((s) => ({
      code: s.code,
      name: s.name,
      faculty: s.faculty,
      coverage: s.coverage,
      status: s.status,
      completedTopicsCount: s.completedTopicsCount,
      totalTopicsCount: s.totalTopicsCount,
      reasonsForPending: s.reasonsForPending || (s.coverage < 60 ? 'Topics not completed' : undefined),
      extraHoursRequested: s.extraHoursRequested,
    })),
  };

  const getStatusLabel = (status: string) => {
    if (status === 'Submitted') {
      return { label: 'LOGGED', bgColor: '#ECFDF5', textColor: Palette.success };
    }
    return { label: 'PENDING', bgColor: '#FEF2F2', textColor: Palette.error };
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── CLASS HEADER BANNER ── */}
      <View style={styles.classHeader}>
        <View style={styles.headerIconBox}>
          <MaterialCommunityIcons name="google-classroom" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.classTitle}>{classId} Class Syllabus Status</Text>
          <Text style={styles.classSubtitle}>
            Department: {user?.department || 'Computer Science Engineering'} · Week {selectedWeek}
          </Text>
        </View>
      </View>

      {/* ── VIEW SWITCHER TABS ── */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, viewMode === 'list' && styles.activeTabButton]}
          onPress={() => setViewMode('list')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={18}
            color={viewMode === 'list' ? '#FFFFFF' : Palette.textLight}
          />
          <Text style={[styles.tabText, viewMode === 'list' && styles.activeTabText]}>List View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, viewMode === 'spreadsheet' && styles.activeTabButton]}
          onPress={() => setViewMode('spreadsheet')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="table"
            size={18}
            color={viewMode === 'spreadsheet' ? '#FFFFFF' : Palette.textLight}
          />
          <Text style={[styles.tabText, viewMode === 'spreadsheet' && styles.activeTabText]}>Spreadsheet Details</Text>
        </TouchableOpacity>
      </View>

      {/* ── RENDERING BY VIEW MODE ── */}
      {viewMode === 'list' ? (
        <>
          <Text style={styles.sectionTitle}>Subject-wise Syllabus Coverage</Text>
          {progressList.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No faculty logs recorded for this class.</Text>
              </Card.Content>
            </Card>
          ) : (
            progressList.map((subj) => {
              const statusCfg = getStatusLabel(subj.status);
              return (
                <Card key={subj.code} style={styles.subjectCard}>
                  <Card.Content>
                    <View style={styles.subjRow}>
                      <View style={styles.subjLeft}>
                        <Text style={styles.subjCode}>{subj.code}</Text>
                        <Text style={styles.subjName}>{subj.name}</Text>
                        <Text style={styles.subjFaculty}>Faculty: {subj.faculty}</Text>
                      </View>
                      <View style={styles.subjRight}>
                        <View style={[styles.badgeStyle, { backgroundColor: statusCfg.bgColor }]}>
                          <Text style={[styles.badgeText, { color: statusCfg.textColor }]}>
                            {statusCfg.label}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.progressBlock}>
                      <View style={styles.progressLabelRow}>
                        <Text style={styles.progressLabel}>Coverage Progress</Text>
                        <Text style={styles.progressValue}>{subj.coverage}%</Text>
                      </View>
                      <ProgressBar
                        progress={subj.coverage / 100}
                        color={subj.status === 'Submitted' ? Palette.primary : Palette.error}
                        style={styles.progressBar}
                      />
                      <Text style={styles.topicsCount}>
                        {subj.completedTopicsCount} of {subj.totalTopicsCount} syllabus units completed
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              );
            })
          )}
        </>
      ) : (
        <View style={{ marginBottom: 20 }}>
          <WeeklyCourseCoverageReportCard report={reportToShow} showDownloadButton={false} />
        </View>
      )}

      {/* ── PENDING REVIEWS SPECIFIC TO THIS CLASS ── */}
      <Text style={styles.sectionTitle}>Pending Reviews for {classId}</Text>
      
      {/* Review Consolidated Reports */}
      <Card style={styles.reviewCard}>
        <Card.Content>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>CC Consolidated Reports</Text>
            {PENDING_REPORTS > 0 && (
              <Badge style={styles.errorBadge}>{PENDING_REPORTS}</Badge>
            )}
          </View>
          <Text style={styles.reviewSubtitle}>
            {PENDING_REPORTS > 0 
              ? `${PENDING_REPORTS} class report is awaiting HOD feedback and approval remarks.`
              : `No reports submitted for HOD review for ${classId} this week.`}
          </Text>
          <Button
            mode="contained"
            disabled={PENDING_REPORTS === 0}
            style={styles.reviewBtn}
            buttonColor={Palette.primary}
            onPress={() => {
              if (PENDING_REPORTS > 0) {
                navigation.navigate('RequestDetails', {
                  requestId: classPendingReports[0].id,
                  requestType: 'CC_REPORT',
                });
              }
            }}
          >
            Review Reports
          </Button>
        </Card.Content>
      </Card>

      {/* Review Extra Hour Requests */}
      <Card style={styles.reviewCard}>
        <Card.Content>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>Extra Hour Slot Requests</Text>
            {PENDING_EXTRA_HOURS > 0 && (
              <Badge style={styles.warningBadge}>{PENDING_EXTRA_HOURS}</Badge>
            )}
          </View>
          <Text style={styles.reviewSubtitle}>
            {PENDING_EXTRA_HOURS > 0
              ? `${PENDING_EXTRA_HOURS} faculty requested an extra Slot for ${classId} subjects.`
              : `No pending compensatory slot requests for ${classId}.`}
          </Text>
          <Button
            mode="outlined"
            disabled={PENDING_EXTRA_HOURS === 0}
            style={styles.reviewBtn}
            textColor={Palette.warning}
            onPress={() =>
              navigation.navigate('RequestDetails', {
                requestId: 'sample-extra-001',
                requestType: 'EXTRA_HOURS',
              })
            }
          >
            Review Requests
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },

  // Class Header styles
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerInfo: {
    flex: 1,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  classSubtitle: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginTop: 2,
  },

  // Section titles
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.textLight,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 12,
    paddingLeft: 4,
  },

  // Subject Cards
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  subjRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subjLeft: {
    flex: 1,
    paddingRight: 8,
  },
  subjCode: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.primary,
    letterSpacing: 0.3,
  },
  subjName: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.textDark,
    marginTop: 2,
  },
  subjFaculty: {
    fontSize: 12,
    color: Palette.textLight,
    fontWeight: '500',
    marginTop: 2,
  },
  subjRight: {
    alignItems: 'flex-end',
  },
  badgeStyle: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  progressBlock: {
    marginTop: 6,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
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
    marginBottom: 6,
  },
  topicsCount: {
    fontSize: 10.5,
    color: Palette.textLight,
    fontWeight: '500',
  },

  // Review card styles
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Palette.textDark,
  },
  reviewSubtitle: {
    fontSize: 12,
    color: Palette.textLight,
    lineHeight: 18,
    marginBottom: 12,
  },
  errorBadge: {
    backgroundColor: Palette.error,
    color: '#FFFFFF',
  },
  warningBadge: {
    backgroundColor: Palette.warning,
    color: '#FFFFFF',
  },
  reviewBtn: {
    borderRadius: 10,
    paddingVertical: 2,
  },

  // Empty styles
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 13,
    color: Palette.textLight,
    fontStyle: 'italic',
  },
  // Tab switcher styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: Palette.primary,
    elevation: 2,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textLight,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});

export default FacultyProgressScreen;
