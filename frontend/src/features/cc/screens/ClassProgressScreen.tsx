import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CCStackParamList } from '@navigation/types';
import { useReportStore, SubjectProgress } from '../store/useReportStore';
import { getSectionTemplate } from '@config/sectionTemplates';
import { getCCForSection } from '@config/facultyBoard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { SegBar } from '@components/editorial/SegBar';
import { Feather } from '@expo/vector-icons';

type RouteParams = RouteProp<CCStackParamList, 'ClassProgress'>;
type NavProp = NativeStackNavigationProp<CCStackParamList>;

export const ClassProgressScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavProp>();
  const classId = route.params?.classId || '1st Year SEC-A';
  const selectedWeek = 12;

  const subjectProgressList = useReportStore((state) => state.subjectProgressList);
  const fetchWeeklyProgress = useReportStore((state) => state.fetchWeeklyProgress);

  useEffect(() => {
    fetchWeeklyProgress(classId, selectedWeek);
  }, [classId, selectedWeek]);

  const tmpl = getSectionTemplate(classId);
  const ccInfo = getCCForSection(classId);
  const subjects: SubjectProgress[] = subjectProgressList[`${classId}_${selectedWeek}`] || [];

  const completedCount = subjects.filter((s) => s.status === 'Submitted').length;
  const avgCoverage =
    subjects.length > 0
      ? Math.round(subjects.reduce((sum, s) => sum + s.coverage, 0) / subjects.length)
      : 80;

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
          <Label text={`SECTION CURRICULUM • WEEK ${selectedWeek}`} />
          <Text style={styles.headerTitle}>
            {classId.toUpperCase()}
            <Text style={styles.accentDot}>.</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            COORDINATOR: {ccInfo?.facultyName?.toUpperCase() || 'DESIGNATED CC'} • {avgCoverage}% AVERAGE COVERAGE
          </Text>
        </View>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* 3-Column Stat Row */}
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{subjects.length}</Text>
            <Label text="SUBJECTS" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{completedCount}</Text>
            <Label text="LOGGED" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text
              style={[
                styles.statNum,
                subjects.length - completedCount > 0 ? styles.accentStatNum : null,
              ]}
            >
              {subjects.length - completedCount}
            </Text>
            <Label text="PENDING" />
          </View>
        </View>

        {/* 1px Hairline Rule */}
        <Rule thickness="hairline" style={styles.hairlineSpacer} />

        {/* Quick Action Buttons */}
        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={styles.quickOutlineBtn}
            onPress={() => navigation.navigate('FacultyAllocation')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickOutlineBtnText}>ALLOCATE TEACHERS</Text>
            <Feather name="users" size={14} color={EditorialColors.ink} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickOutlineBtn}
            onPress={() => navigation.navigate('PendingSubmissions', { classId })}
            activeOpacity={0.7}
          >
            <Text style={styles.quickOutlineBtnText}>PENDING LIST</Text>
            <Feather name="clock" size={14} color={EditorialColors.ink} />
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>CURRICULUM ROSTER</Text>
          <Label text="WEEK 12 LOGS" />
        </View>

        {/* Subjects Roster */}
        <View style={styles.subjectList}>
          {subjects.map((sub) => {
            const isLogged = sub.status === 'Submitted';
            const isLagging = sub.coverage < 70;
            return (
              <TouchableOpacity
                key={sub.code}
                onPress={() =>
                  navigation.navigate('SubjectProgressDetail', { progressId: `${classId}_${sub.code}` })
                }
                style={styles.subjectRow}
                activeOpacity={0.7}
              >
                <View style={styles.rowTop}>
                  <View style={styles.subjectInfo}>
                    <View style={styles.codeRow}>
                      <Text style={styles.subjectCode}>{sub.code}</Text>
                      <View style={styles.statusBadge}>
                        <Text
                          style={[
                            styles.statusText,
                            !isLogged ? styles.accentStatusText : null,
                          ]}
                        >
                          {isLogged ? 'LOGGED' : 'PENDING'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.subjectName}>{sub.name}</Text>
                    <Label
                      text={`FACULTY: ${sub.teacher.toUpperCase()} • ${sub.periodsCompleted}/${sub.periodsPlanned} PERIODS`}
                      style={styles.facultyMeta}
                    />
                  </View>

                  <View style={styles.rightValueBox}>
                    <Text
                      style={[
                        styles.percentText,
                        isLagging ? styles.accentPercentText : null,
                      ]}
                    >
                      {sub.coverage}%
                    </Text>
                  </View>
                </View>

                {/* 25-Segment Bar */}
                <View style={styles.segBarWrapper}>
                  <SegBar
                    totalSegments={25}
                    filledSegments={Math.round((sub.coverage / 100) * 25)}
                    isLagging={isLagging}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
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
    fontSize: 36,
    lineHeight: 40,
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
  quickActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickOutlineBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickOutlineBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
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
  subjectList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
  },
  subjectRow: {
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
  subjectInfo: {
    flex: 1,
    marginRight: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  subjectCode: {
    fontFamily: EditorialFonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    color: EditorialColors.muted,
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  statusText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 9,
    letterSpacing: 1,
    color: EditorialColors.ink,
  },
  accentStatusText: {
    color: EditorialColors.accent,
  },
  subjectName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 16,
    lineHeight: 20,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  facultyMeta: {
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
  },
});
