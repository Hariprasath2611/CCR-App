import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Chip, ProgressBar, Button, Divider } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { CCStackParamList } from '@navigation/types';
import { useReportStore, SubjectProgress } from '../store/useReportStore';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ms } from '@theme/responsive';

type RouteParams = RouteProp<CCStackParamList, 'SubjectProgressDetail'>;

export const SubjectProgressDetailScreen = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<any>();
  const progressId = route.params?.progressId || '';

  // Extract classId & subjectCode from progressId: "${classId}_${code}"
  const parts = progressId.split('_');
  const classId = parts.length >= 2 ? parts[0] : '1st Year SEC-A';
  const subjectCode = parts.length >= 2 ? parts.slice(1).join('_') : 'CS3591';
  const selectedWeek = 12;

  const subjectProgressList = useReportStore((state) => state.subjectProgressList);
  const classProgress = subjectProgressList[`${classId}_${selectedWeek}`] || [];
  const subjectData = classProgress.find((s) => s.code === subjectCode) || {
    code: subjectCode,
    name: 'Computer Networks',
    faculty: 'Faculty Teacher',
    coverage: 80,
    status: 'Submitted' as const,
    completedTopicsCount: 4,
    totalTopicsCount: 5,
    topicsCoveredText: 'Transport Layer Protocols, TCP 3-Way Handshake, Flow & Congestion Control',
    cumulativePercent: 'Unit 4 - 80%',
    periodsPlanned: 4,
    periodsHandled: 4,
    fromDate: '15/07/2026',
    toDate: '20/07/2026',
    completedOnPlan: 'YES',
    reasonsForPending: '',
    extraHoursRequested: false,
  };

  const isLagging = subjectData.completedOnPlan === 'NO' || (subjectData.periodsHandled || 4) < (subjectData.periodsPlanned || 4);
  const paceRatio = subjectData.periodsPlanned ? Number(((subjectData.periodsHandled || 4) / subjectData.periodsPlanned).toFixed(2)) : 1.0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Subject Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.topRow}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeBadgeText}>{subjectData.code}</Text>
          </View>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: subjectData.status === 'Submitted' ? '#ECFDF5' : '#FEF2F2' },
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                { color: subjectData.status === 'Submitted' ? Palette.success : Palette.error },
              ]}
            >
              {subjectData.status === 'Submitted' ? 'LOGGED' : 'PENDING'}
            </Text>
          </View>
        </View>

        <Text style={styles.subTitle}>{subjectData.name}</Text>
        <Text style={styles.classInfo}>
          {classId} · Academic Week {selectedWeek}
        </Text>
        <Text style={styles.facultyText}>Teacher: {subjectData.faculty}</Text>

        <View style={styles.coverageRow}>
          <Text style={styles.coverageLabel}>Cumulative Syllabus Completion:</Text>
          <Text style={styles.coverageValue}>{subjectData.cumulativePercent || `${subjectData.coverage}%`}</Text>
        </View>

        <ProgressBar
          progress={subjectData.coverage / 100}
          color={Palette.primary}
          style={styles.progressBar}
        />
      </View>

      {/* Teaching Hours Metrics */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardSectionTitle}>Period Execution & Pace Metrics</Text>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCell}>
              <Text style={styles.metricVal}>{subjectData.periodsPlanned || 4}</Text>
              <Text style={styles.metricLabel}>Periods Planned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.metricCell}>
              <Text style={styles.metricVal}>{subjectData.periodsHandled || 4}</Text>
              <Text style={styles.metricLabel}>Periods Handled</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.metricCell}>
              <Text style={[styles.metricVal, { color: isLagging ? Palette.warning : Palette.success }]}>
                {paceRatio}x
              </Text>
              <Text style={styles.metricLabel}>Pace Ratio</Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <Feather name="calendar" size={14} color="#64748B" />
            <Text style={styles.dateText}>
              Duration: {subjectData.fromDate || '15/07/2026'} - {subjectData.toDate || '20/07/2026'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Syllabus Topics Covered */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardSectionTitle}>Topics Covered</Text>
          <View style={styles.topicsBox}>
            <Text style={styles.topicsText}>
              {subjectData.topicsCoveredText || 'Regular syllabus topics executed as scheduled.'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Lag & Extra Hours Request Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardSectionTitle}>Compliance & Deviations</Text>

          <View style={styles.complianceRow}>
            <Text style={styles.complianceLabel}>Completed on Plan:</Text>
            <Chip
              style={{
                backgroundColor: subjectData.completedOnPlan === 'YES' ? '#ECFDF5' : '#FEF2F2',
              }}
              textStyle={{
                color: subjectData.completedOnPlan === 'YES' ? Palette.success : Palette.error,
                fontWeight: '700',
              }}
            >
              {subjectData.completedOnPlan || 'YES'}
            </Chip>
          </View>

          {subjectData.reasonsForPending ? (
            <View style={styles.deviationBox}>
              <Text style={styles.deviationLabel}>Reason for Pending / Lag:</Text>
              <Text style={styles.deviationText}>"{subjectData.reasonsForPending}"</Text>
            </View>
          ) : null}

          <View style={[styles.complianceRow, { marginTop: ms(12) }]}>
            <Text style={styles.complianceLabel}>Extra Hours Requested:</Text>
            <Chip
              style={{
                backgroundColor: subjectData.extraHoursRequested ? '#EFF6FF' : '#F8FAFC',
              }}
              textStyle={{
                color: subjectData.extraHoursRequested ? Palette.primary : Palette.textLight,
                fontWeight: '700',
              }}
            >
              {subjectData.extraHoursRequested ? 'Yes (2 Hours Requested)' : 'None'}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Bottom Back Action */}
      <Button
        mode="outlined"
        icon="arrow-left"
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        Back to Class Progress
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: ms(16),
    paddingBottom: ms(40),
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    padding: ms(18),
    marginBottom: ms(14),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(8),
  },
  codeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: ms(10),
    paddingVertical: ms(4),
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  codeBadgeText: {
    fontSize: ms(13),
    fontWeight: '800',
    color: Palette.primary,
  },
  statusPill: {
    paddingHorizontal: ms(10),
    paddingVertical: ms(4),
    borderRadius: ms(8),
  },
  statusPillText: {
    fontSize: ms(10.5),
    fontWeight: '800',
  },
  subTitle: {
    fontSize: ms(18),
    fontWeight: '900',
    color: Palette.textDark,
  },
  classInfo: {
    fontSize: ms(12.5),
    color: Palette.primary,
    fontWeight: '700',
    marginTop: ms(2),
  },
  facultyText: {
    fontSize: ms(13),
    color: Palette.textLight,
    marginTop: ms(2),
  },
  coverageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: ms(14),
    marginBottom: ms(6),
  },
  coverageLabel: {
    fontSize: ms(12),
    color: Palette.textLight,
    fontWeight: '600',
  },
  coverageValue: {
    fontSize: ms(14),
    fontWeight: '800',
    color: Palette.primary,
  },
  progressBar: {
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: '#E2E8F0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    marginBottom: ms(14),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
  },
  cardSectionTitle: {
    fontSize: ms(14),
    fontWeight: '800',
    color: Palette.textDark,
    marginBottom: ms(12),
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: ms(12),
    paddingVertical: ms(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricCell: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: ms(18),
    fontWeight: '900',
    color: Palette.textDark,
  },
  metricLabel: {
    fontSize: ms(11),
    color: Palette.textLight,
    marginTop: ms(2),
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: ms(24),
    backgroundColor: '#CBD5E1',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ms(12),
    justifyContent: 'center',
  },
  dateText: {
    fontSize: ms(12),
    color: '#64748B',
    marginLeft: ms(6),
    fontWeight: '500',
  },
  topicsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: ms(10),
    padding: ms(12),
    borderLeftWidth: 3,
    borderLeftColor: Palette.primary,
  },
  topicsText: {
    fontSize: ms(13),
    color: '#334155',
    lineHeight: ms(19),
  },
  complianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  complianceLabel: {
    fontSize: ms(13),
    color: Palette.textDark,
    fontWeight: '600',
  },
  deviationBox: {
    backgroundColor: '#FEF2F2',
    padding: ms(10),
    borderRadius: ms(8),
    marginTop: ms(10),
    borderLeftWidth: 3,
    borderLeftColor: Palette.error,
  },
  deviationLabel: {
    fontSize: ms(11),
    color: Palette.error,
    fontWeight: '800',
  },
  deviationText: {
    fontSize: ms(12.5),
    color: '#991B1B',
    fontStyle: 'italic',
    marginTop: ms(2),
  },
  backBtn: {
    borderRadius: ms(12),
    marginTop: ms(4),
  },
});

export default SubjectProgressDetailScreen;
