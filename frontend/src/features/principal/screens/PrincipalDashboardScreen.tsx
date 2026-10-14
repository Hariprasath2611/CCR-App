import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useReportStore } from '@features/cc/store/useReportStore';
import { Feather } from '@expo/vector-icons';
import { DEPARTMENTS } from './DeptSummaryScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { BigNumber } from '@components/editorial/BigNumber';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';

export const PrincipalDashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const reports = useReportStore((state) => state.reports);
  const fetchReports = useReportStore((state) => state.fetchReports);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const totalDepartments = DEPARTMENTS.length;
  const totalClasses = reports.length > 0 ? new Set(reports.map(r => r.classId)).size : 13;
  const reportsSubmitted = reports.length;
  const pendingApproval = reports.filter((r) => r.status === 'SUBMITTED_TO_HOD').length;
  const approvedReports = reports.filter((r) => r.status === 'SENT_TO_ADMIN').length;
  const rejectedReports = reports.filter(
    (r) => r.status === 'REJECTED_BY_HOD' || r.status === 'RETURNED_BY_HOD'
  ).length;

  const quickActions = [
    {
      title: 'DEPARTMENT ACADEMIC DIRECTORY',
      subtitle: `${totalDepartments} departments • Status & performance`,
      target: 'DeptSummary',
    },
    {
      title: 'FACULTY METRICS & AUDIT',
      subtitle: 'Faculty progress, coverage rates & extra hours',
      target: 'FacultyAnalytics',
    },
    {
      title: 'CENTRAL INSTITUTION REPORTS',
      subtitle: 'Weekly consolidated syllabus submissions',
      target: 'WeeklyReports',
    },
    {
      title: 'INSTITUTIONAL SYLLABUS ANALYTICS',
      subtitle: 'Campus-wide coverage curves & trends',
      target: 'InstitutionAnalytics',
    },
    {
      title: 'DATA EXPORT SUITE',
      subtitle: 'PDF & Excel academic compliance archives',
      target: 'ReportExport',
    },
  ];

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
        {/* Top Header Row with Notifications Bell */}
        <View style={styles.topHeaderRow}>
          <View>
            <Label text="CCR CENTRAL ADMINISTRATION" />
            <Text style={styles.principalName} numberOfLines={1}>
              {user?.name || 'Dr. Ramesh'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => navigation.navigate('StaffHome', { screen: 'Notifications' })}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
          >
            <Feather name="bell" size={20} color={EditorialColors.ink} />
            {pendingApproval > 0 && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        </View>

        {/* 1px Hairline Rule */}
        <Rule thickness="hairline" style={styles.hairlineSpacer} />

        {/* Hero Section: Central Metric */}
        <View style={styles.heroSection}>
          <Label text="TOTAL SUBMITTED REPORTS" />
          <View style={styles.heroRow}>
            <BigNumber value={reportsSubmitted || 14} size="hero" />
          </View>
        </View>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* 3-Column Primary Stat Row */}
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{totalDepartments}</Text>
            <Label text="DEPTS" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{totalClasses}</Text>
            <Label text="CLASSES" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text
              style={[
                styles.statNum,
                pendingApproval > 0 ? styles.accentStatNum : null,
              ]}
            >
              {pendingApproval}
            </Text>
            <Label text="PENDING" />
          </View>
        </View>

        {/* 1px Hairline Rule */}
        <Rule thickness="hairline" style={styles.hairlineSpacer} />

        {/* 3-Column Secondary Stat Row */}
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{approvedReports}</Text>
            <Label text="APPROVED" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text
              style={[
                styles.statNum,
                rejectedReports > 0 ? styles.accentStatNum : null,
              ]}
            >
              {rejectedReports}
            </Text>
            <Label text="RETURNED" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>86%</Text>
            <Label text="AVG COVERAGE" />
          </View>
        </View>

        {/* 4px Heavy Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* Quick Actions Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>EXECUTIVE CONTROLS</Text>
          <Label text="QUICK ACTIONS" />
        </View>

        {/* Action Rows */}
        <View style={styles.actionList}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={action.target}
              style={styles.actionRow}
              onPress={() => navigation.navigate(action.target)}
              activeOpacity={0.7}
            >
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={EditorialColors.ink} />
            </TouchableOpacity>
          ))}
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
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  principalName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 24,
    lineHeight: 28,
    color: EditorialColors.ink,
    marginTop: 2,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: EditorialColors.accent,
  },
  hairlineSpacer: {
    marginVertical: 16,
  },
  heroSection: {
    marginTop: 4,
  },
  heroRow: {
    marginTop: 4,
  },
  heavySpacer: {
    marginVertical: 18,
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
  actionList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
  },
  actionRow: {
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.ink,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionInfo: {
    flex: 1,
    marginRight: 16,
  },
  actionTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 14,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
  },
});
