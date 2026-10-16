import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, StatusBar, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useReportStore } from '@features/cc/store/useReportStore';
import { Feather } from '@expo/vector-icons';
import { DEPARTMENTS } from './DeptSummaryScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DayRibbonColors,
  DayRibbonFonts,
  DayRibbonShapes,
  DayRibbonSpacing,
} from '@theme/dayRibbon';
import { BigNumber } from '@components/editorial/BigNumber';
import { StatTile } from '@components/editorial/StatTile';
import { ProgressBar } from '@components/editorial/ProgressBar';

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
  const totalClasses = reports.length > 0 ? new Set(reports.map((r) => r.classId)).size : 13;
  const reportsSubmitted = reports.length;
  const pendingApproval = reports.filter((r) => r.status === 'SUBMITTED_TO_HOD').length;
  const approvedReports = reports.filter((r) => r.status === 'SENT_TO_ADMIN').length;
  const rejectedReports = reports.filter(
    (r) => r.status === 'REJECTED_BY_HOD' || r.status === 'RETURNED_BY_HOD'
  ).length;

  const quickActions = [
    {
      title: 'Department Academic Directory',
      subtitle: `${totalDepartments} departments • Status & performance`,
      target: 'DeptSummary',
      icon: 'folder',
    },
    {
      title: 'Faculty Metrics & Audit',
      subtitle: 'Faculty progress, coverage rates & extra hours',
      target: 'FacultyAnalytics',
      icon: 'users',
    },
    {
      title: 'Central Institution Reports',
      subtitle: 'Weekly consolidated syllabus submissions',
      target: 'WeeklyReports',
      icon: 'file-text',
    },
    {
      title: 'Institutional Syllabus Analytics',
      subtitle: 'Campus-wide coverage curves & trends',
      target: 'InstitutionAnalytics',
      icon: 'bar-chart-2',
    },
    {
      title: 'Data Export Suite',
      subtitle: 'PDF & Excel academic compliance archives',
      target: 'ReportExport',
      icon: 'download',
    },
  ];

  return (
    <View style={styles.screenWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor={DayRibbonColors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, DayRibbonSpacing.screenTop),
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo slot, role info, and bell button */}
        <View style={styles.header}>
          <View style={styles.logoSlot}>
            <Image
              source={require('../../../assets/logo-removebg-preview.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerMiddle}>
            <Text style={styles.roleLabel}>EXECUTIVE ADMINISTRATION</Text>
            <Text style={styles.principalName} numberOfLines={1}>
              {user?.name || 'Dr. Ramesh (Principal)'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => navigation.navigate('StaffHome', { screen: 'Notifications' })}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
          >
            <Feather name="bell" size={18} color={DayRibbonColors.ink} />
            {pendingApproval > 0 && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        </View>

        {/* Hero Section: Central Metric */}
        <View style={styles.heroCard}>
          <Text style={styles.cardHeaderLabel}>TOTAL SUBMITTED REPORTS</Text>
          <View style={styles.heroRow}>
            <BigNumber value={reportsSubmitted || 14} size="hero" color={DayRibbonColors.cobalt} />
          </View>
          <ProgressBar progress={86} height={10} style={{ marginTop: 12 }} />
        </View>

        {/* Primary Stat Grid */}
        <View style={styles.statGrid}>
          <StatTile
            value={totalDepartments}
            label="Depts"
            style={styles.statGridItem}
          />
          <StatTile
            value={totalClasses}
            label="Classes"
            style={styles.statGridItem}
          />
          <StatTile
            value={pendingApproval}
            label="Pending"
            isBehindPlan={pendingApproval > 0}
            style={styles.statGridItem}
          />
        </View>

        {/* Secondary Stat Grid */}
        <View style={styles.statGrid}>
          <StatTile
            value={approvedReports}
            label="Approved"
            bgVariant="tint"
            style={styles.statGridItem}
          />
          <StatTile
            value={rejectedReports}
            label="Returned"
            isBehindPlan={rejectedReports > 0}
            bgVariant="tint"
            style={styles.statGridItem}
          />
          <StatTile
            value="86%"
            label="Avg Coverage"
            bgVariant="tint"
            style={styles.statGridItem}
          />
        </View>

        {/* Section Header: Portals */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>INSTITUTIONAL DIRECTORY</Text>
          <Text style={styles.sectionHeaderMeta}>CORE MODULES</Text>
        </View>

        {/* Quick Action Cards */}
        <View style={styles.actionsList}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.target)}
              activeOpacity={0.75}
            >
              <View style={styles.actionIconBox}>
                <Feather name={action.icon as any} size={20} color={DayRibbonColors.cobalt} />
              </View>

              <View style={styles.actionTextBox}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>

              <Feather name="chevron-right" size={18} color={DayRibbonColors.muted} />
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
    backgroundColor: DayRibbonColors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  content: {
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoSlot: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    ...DayRibbonShapes.shadow,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  headerMiddle: {
    flex: 1,
    marginHorizontal: 12,
  },
  roleLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 10,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
  },
  principalName: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 18,
    lineHeight: 22,
    color: DayRibbonColors.ink,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...DayRibbonShapes.shadow,
  },
  unreadDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DayRibbonColors.warn,
  },
  heroCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 20,
    marginBottom: 14,
    ...DayRibbonShapes.shadow,
  },
  cardHeaderLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
  },
  heroRow: {
    marginTop: 4,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statGridItem: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    letterSpacing: 0.5,
    color: DayRibbonColors.ink,
  },
  sectionHeaderMeta: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    color: DayRibbonColors.muted,
  },
  actionsList: {
    width: '100%',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 16,
    marginBottom: 12,
    ...DayRibbonShapes.shadow,
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: DayRibbonColors.cobaltTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionTextBox: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 15,
    color: DayRibbonColors.ink,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
});

export default PrincipalDashboardScreen;
