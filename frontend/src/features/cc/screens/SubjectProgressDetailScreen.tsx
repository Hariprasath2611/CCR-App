import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { CCStackParamList } from '@navigation/types';
import { useReportStore } from '../store/useReportStore';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { BigNumber } from '@components/editorial/BigNumber';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { SegBar } from '@components/editorial/SegBar';

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
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={20} color={EditorialColors.ink} />
          </TouchableOpacity>
          <Label text={`WEEK ${selectedWeek} • ${classId.toUpperCase()}`} />
        </View>

        {/* Title heavy 24 */}
        <Text style={styles.subjectTitle}>{subjectData.name}</Text>
        <Text style={styles.subjectSubtitle}>
          CODE: {subjectData.code} • TEACHER: {subjectData.faculty.toUpperCase()}
        </Text>

        {/* Big Number Section */}
        <View style={styles.heroSection}>
          <Label text="SYLLABUS COVERAGE" />
          <View style={styles.heroRow}>
            <BigNumber value={subjectData.coverage} size="big" showPercent />
          </View>
        </View>

        {/* 25-Segment Bar */}
        <View style={styles.segBarWrapper}>
          <SegBar
            totalSegments={25}
            filledSegments={Math.round((subjectData.coverage / 100) * 25)}
            isLagging={isLagging}
          />
        </View>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* 3-Column Period Stat Row */}
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{subjectData.periodsPlanned || 4}</Text>
            <Label text="PLANNED" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{subjectData.periodsHandled || 4}</Text>
            <Label text="HANDLED" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text
              style={[
                styles.statNum,
                isLagging ? styles.accentStatNum : null,
              ]}
            >
              {paceRatio}x
            </Text>
            <Label text="PACE RATIO" />
          </View>
        </View>

        {/* 1px Hairline Rule */}
        <Rule thickness="hairline" style={styles.hairlineSpacer} />

        {/* Duration Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>LOGGED DURATION</Text>
          <Text style={styles.metaValue}>
            {subjectData.fromDate || '15/07/2026'} — {subjectData.toDate || '20/07/2026'}
          </Text>
        </View>

        {/* Topics Covered Box */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>COVERED TOPICS</Text>
          <Label text={subjectData.cumulativePercent || `${subjectData.coverage}%`} />
        </View>

        <View style={styles.topicsBlock}>
          <Text style={styles.topicsText}>
            {subjectData.topicsCoveredText || 'Regular syllabus topics executed as scheduled.'}
          </Text>
        </View>

        {/* Extra Hours or Lag Banner */}
        {isLagging ? (
          <View style={styles.lagBanner}>
            <Text style={styles.lagBannerTitle}>BEHIND SYLLABUS PACE</Text>
            <Text style={styles.lagBannerSub}>
              Teaching pace is behind scheduled academic delivery. Extra revision period requested.
            </Text>
          </View>
        ) : (
          <View style={styles.okBanner}>
            <Text style={styles.okBannerTitle}>ON TRACK WITH ACADEMIC SCHEDULE</Text>
            <Text style={styles.okBannerSub}>
              All planned lectures successfully delivered within allotted weekly hours.
            </Text>
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryActionText}>RETURN TO CLASS PROGRESS</Text>
        </TouchableOpacity>
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    backgroundColor: EditorialColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 24,
    lineHeight: 28,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  subjectSubtitle: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    color: EditorialColors.muted,
    lineHeight: 18,
    marginBottom: 12,
  },
  heroSection: {
    marginTop: 8,
  },
  heroRow: {
    marginTop: 4,
    marginBottom: 8,
  },
  segBarWrapper: {
    marginBottom: 12,
  },
  heavySpacer: {
    marginVertical: 18,
  },
  hairlineSpacer: {
    marginVertical: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: EditorialFonts.display,
    fontSize: 30,
    lineHeight: 34,
    color: EditorialColors.ink,
    marginBottom: 2,
  },
  accentStatNum: {
    color: EditorialColors.accent,
  },
  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: EditorialColors.ink,
  },
  metaRow: {
    paddingVertical: 10,
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.ink,
    marginBottom: 18,
  },
  metaLabel: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 14,
    color: EditorialColors.ink,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.ink,
  },
  topicsBlock: {
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    padding: 14,
    marginBottom: 20,
    backgroundColor: EditorialColors.bg,
  },
  topicsText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: EditorialColors.ink,
  },
  lagBanner: {
    borderWidth: 1.5,
    borderColor: EditorialColors.accent,
    padding: 16,
    marginBottom: 24,
    backgroundColor: EditorialColors.bg,
  },
  lagBannerTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 1.5,
    color: EditorialColors.accent,
    marginBottom: 4,
  },
  lagBannerSub: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: EditorialColors.ink,
  },
  okBanner: {
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    padding: 16,
    marginBottom: 24,
    backgroundColor: EditorialColors.bg,
  },
  okBannerTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  okBannerSub: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: EditorialColors.muted,
  },
  primaryActionButton: {
    height: 54,
    width: '100%',
    backgroundColor: EditorialColors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.white,
  },
});
