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

import { ms } from '@theme/responsive';

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

  // Helper to fetch subjects from class store progress list
  const getSubjectsProgressForClass = (clsId: string, week: string) => {
    const storeKey = `${clsId}_${week}`;
    return subjectProgressList[storeKey] || [];
  };

  const progressList = getSubjectsProgressForClass(classId, selectedWeek);

  const [viewMode, setViewMode] = useState<'list' | 'spreadsheet'>('list');

  // Filter pending consolidated reports submitted for this specific class
  const classPendingReports = reports.filter(
    (r) => r.classId === classId && r.status === 'SUBMITTED_TO_HOD'
  );
  const PENDING_REPORTS = classPendingReports.length;
  
  // Real slot request for this class
  const PENDING_EXTRA_HOURS = 0;

  // Find ConsolidatedReport
  const existingReport = reports.find(
    (r) => r.classId === classId && r.weekNumber === parseInt(selectedWeek)
  );

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
        <View style={{ marginBottom: ms(20) }}>
          {existingReport ? (
            <WeeklyCourseCoverageReportCard report={existingReport} showDownloadButton={false} />
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No consolidated report has been compiled for this class this week.</Text>
              </Card.Content>
            </Card>
          )}
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
    padding: ms(16),
    paddingBottom: ms(32),
  },

  // Class Header styles
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    borderRadius: ms(20),
    padding: ms(16),
    marginBottom: ms(20),
    elevation: 3,
    shadowColor: Palette.primary,
    shadowOffset: { width: ms(0), height: ms(6) },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  headerIconBox: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(12),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(14),
  },
  headerInfo: {
    flex: 1,
  },
  classTitle: {
    fontSize: ms(16),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  classSubtitle: {
    fontSize: ms(11.5),
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginTop: ms(2),
  },

  // Section titles
  sectionTitle: {
    fontSize: ms(11),
    fontWeight: '800',
    color: Palette.textLight,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    marginBottom: ms(10),
    marginTop: ms(12),
    paddingLeft: ms(4),
  },

  // Subject Cards
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    marginBottom: ms(12),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(4) },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  subjRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ms(12),
  },
  subjLeft: {
    flex: 1,
    paddingRight: ms(8),
  },
  subjCode: {
    fontSize: ms(11),
    fontWeight: '800',
    color: Palette.primary,
    letterSpacing: 0.3,
  },
  subjName: {
    fontSize: ms(15),
    fontWeight: '800',
    color: Palette.textDark,
    marginTop: ms(2),
  },
  subjFaculty: {
    fontSize: ms(12),
    color: Palette.textLight,
    fontWeight: '500',
    marginTop: ms(2),
  },
  subjRight: {
    alignItems: 'flex-end',
  },
  badgeStyle: {
    paddingVertical: ms(4),
    paddingHorizontal: ms(8),
    borderRadius: ms(8),
  },
  badgeText: {
    fontSize: ms(9),
    fontWeight: '800',
  },
  progressBlock: {
    marginTop: ms(6),
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ms(6),
  },
  progressLabel: {
    fontSize: ms(11),
    color: Palette.textLight,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: ms(12.5),
    fontWeight: '800',
    color: Palette.primary,
  },
  progressBar: {
    height: ms(6),
    borderRadius: ms(3),
    marginBottom: ms(6),
  },
  topicsCount: {
    fontSize: ms(10.5),
    color: Palette.textLight,
    fontWeight: '500',
  },

  // Review card styles
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    marginBottom: ms(12),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: ms(0), height: ms(4) },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(6),
  },
  reviewTitle: {
    fontSize: ms(14.5),
    fontWeight: '800',
    color: Palette.textDark,
  },
  reviewSubtitle: {
    fontSize: ms(12),
    color: Palette.textLight,
    lineHeight: 18,
    marginBottom: ms(12),
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
    borderRadius: ms(10),
    paddingVertical: ms(2),
  },

  // Empty styles
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    paddingVertical: ms(20),
  },
  emptyText: {
    fontSize: ms(13),
    color: Palette.textLight,
    fontStyle: 'italic',
  },
  // Tab switcher styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: ms(12),
    padding: ms(4),
    marginBottom: ms(16),
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ms(10),
    borderRadius: ms(8),
    gap: ms(6),
  },
  activeTabButton: {
    backgroundColor: Palette.primary,
    elevation: 2,
    shadowColor: Palette.primary,
    shadowOffset: { width: ms(0), height: ms(2) },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: Palette.textLight,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});

export default FacultyProgressScreen;
