import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { CCStackParamList } from '@navigation/types';
import { useReportStore } from '../store/useReportStore';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { BigNumber } from '@components/editorial/BigNumber';
import { Label } from '@components/editorial/Label';
import { StatTile } from '@components/editorial/StatTile';
import { ProgressBar } from '@components/editorial/ProgressBar';
import { StatusBanner } from '@components/editorial/StatusBanner';

type RouteParams = RouteProp<CCStackParamList, 'SubjectProgressDetail'>;

export const SubjectProgressDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<any>();
  const progressId = route.params?.progressId || '';

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
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={20} color={DayRibbonColors.ink} />
          </TouchableOpacity>
          <View style={styles.headerTagChip}>
            <Text style={styles.headerTagText}>Week {selectedWeek} • {classId}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.subjectTitle}>{subjectData.name}</Text>
        <Text style={styles.subjectSubtitle}>
          {subjectData.code} • Teacher: {subjectData.faculty}
        </Text>

        {/* Big Number Section Card */}
        <View style={styles.heroCard}>
          <Label text="SYLLABUS COVERAGE" />
          <View style={styles.heroRow}>
            <BigNumber value={subjectData.coverage} size="big" showPercent color={DayRibbonColors.cobalt} />
          </View>
          <ProgressBar
            progress={subjectData.coverage / 100}
            isLagging={isLagging}
            style={styles.heroProgress}
          />
        </View>

        {/* 3-Column Period Stat Tiles */}
        <View style={styles.statGrid}>
          <StatTile
            label="Planned"
            value={subjectData.periodsPlanned || 4}
            style={styles.statTileItem}
          />
          <StatTile
            label="Handled"
            value={subjectData.periodsHandled || 4}
            style={styles.statTileItem}
          />
          <StatTile
            label="Pace Ratio"
            value={`${paceRatio}x`}
            isLagging={isLagging}
            style={styles.statTileItem}
          />
        </View>

        {/* Duration Meta Card */}
        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>LOGGED DURATION</Text>
          <Text style={styles.metaValue}>
            {subjectData.fromDate || '15/07/2026'} — {subjectData.toDate || '20/07/2026'}
          </Text>
        </View>

        {/* Topics Covered Box */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>COVERED TOPICS</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{subjectData.cumulativePercent || `${subjectData.coverage}%`}</Text>
          </View>
        </View>

        <View style={styles.topicsCard}>
          <Text style={styles.topicsText}>
            {subjectData.topicsCoveredText || 'Regular syllabus topics executed as scheduled.'}
          </Text>
        </View>

        {/* Extra Hours or Lag Banner */}
        {isLagging ? (
          <StatusBanner
            type="warn"
            title="Behind Syllabus Pace"
            subtitle="Teaching pace is behind scheduled academic delivery. Extra revision period requested."
            style={styles.bannerSpacing}
          />
        ) : (
          <StatusBanner
            type="cobalt"
            title="On Track with Schedule"
            subtitle="All planned lectures successfully delivered within allotted weekly hours."
            style={styles.bannerSpacing}
          />
        )}

        {/* Back Button */}
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryActionText}>Return to Class Progress</Text>
          <Feather name="arrow-right" size={16} color={DayRibbonColors.surface} />
        </TouchableOpacity>
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DayRibbonShapes.chipRadius,
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  headerTagText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  subjectTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: DayRibbonColors.ink,
    marginBottom: 4,
  },
  subjectSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
    lineHeight: 18,
    marginBottom: 16,
  },
  heroCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 20,
    marginBottom: 16,
  },
  heroRow: {
    marginTop: 6,
    marginBottom: 12,
  },
  heroProgress: {
    marginTop: 4,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statTileItem: {
    flex: 1,
  },
  metaCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 14,
    marginBottom: 16,
  },
  metaLabel: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    letterSpacing: 1,
    color: DayRibbonColors.muted,
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 14,
    color: DayRibbonColors.ink,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    letterSpacing: 1.2,
    color: DayRibbonColors.ink,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: DayRibbonShapes.chipRadius,
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  countBadgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.cobalt,
  },
  topicsCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 16,
    marginBottom: 16,
  },
  topicsText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 14,
    lineHeight: 20,
    color: DayRibbonColors.ink,
  },
  bannerSpacing: {
    marginBottom: 20,
  },
  primaryActionButton: {
    height: 52,
    width: '100%',
    borderRadius: DayRibbonShapes.buttonRadius,
    backgroundColor: DayRibbonColors.cobalt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.surface,
  },
});
