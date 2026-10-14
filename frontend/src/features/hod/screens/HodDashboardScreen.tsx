import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { StaffStackParamList } from '@navigation/types';
import { useReportStore } from '@features/cc/store/useReportStore';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getHODForYear } from '@config/facultyBoard';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { BigNumber } from '@components/editorial/BigNumber';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { SegBar } from '@components/editorial/SegBar';
import { EditorialChip } from '@components/editorial/EditorialChip';

interface ClassData {
  classId: string;
  name: string;
  year: string;
  coverage: number;
  pendingCount: number;
  ccName?: string;
}

const CLASSES_DATA: ClassData[] = [
  { classId: '1st Year SEC-A', name: '1st Year SEC-A', year: '1st Year', coverage: 78, pendingCount: 0, ccName: 'Dr. Karuppaiya' },
  { classId: '1st Year SEC-B', name: '1st Year SEC-B', year: '1st Year', coverage: 82, pendingCount: 0, ccName: 'Mrs. G.Revathi' },
  { classId: '1st Year SEC-C', name: '1st Year SEC-C', year: '1st Year', coverage: 75, pendingCount: 1, ccName: 'Mrs. Gopikha' },
  { classId: '1st Year SEC-D', name: '1st Year SEC-D', year: '1st Year', coverage: 80, pendingCount: 0, ccName: 'Dr. Bhuvaneshwari' },
  { classId: '1st Year SEC-E', name: '1st Year SEC-E', year: '1st Year', coverage: 70, pendingCount: 0, ccName: 'Dr. Josphin' },
  { classId: '1st Year SEC-F', name: '1st Year SEC-F', year: '1st Year', coverage: 85, pendingCount: 0, ccName: 'Mrs. Jasline' },
  { classId: '1st Year SEC-G', name: '1st Year SEC-G', year: '1st Year', coverage: 72, pendingCount: 1, ccName: 'Mrs. R.Sumathi' },

  { classId: '2nd Year CSE-A', name: '2nd Year CSE-A', year: '2nd Year', coverage: 84, pendingCount: 0, ccName: 'Mrs. Agnus' },
  { classId: '2nd Year CSE-B', name: '2nd Year CSE-B', year: '2nd Year', coverage: 79, pendingCount: 0, ccName: 'Mrs. Archana' },

  { classId: '3rd Year CSE-A', name: '3rd Year CSE-A', year: '3rd Year', coverage: 88, pendingCount: 0, ccName: 'Ms. Punitha EM' },
  { classId: '3rd Year CSE-B', name: '3rd Year CSE-B', year: '3rd Year', coverage: 85, pendingCount: 0, ccName: 'Ms. E Uva Shakthi' },

  { classId: '4th Year CSE-A', name: '4th Year CSE-A', year: '4th Year', coverage: 92, pendingCount: 0, ccName: 'Mr. S Faizal Mukthar Hussain' },
  { classId: '4th Year CSE-B', name: '4th Year CSE-B', year: '4th Year', coverage: 90, pendingCount: 0, ccName: 'Ms. R Rajalakshmi' },
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const HodDashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const reports = useReportStore((state) => state.reports);
  const fetchReports = useReportStore((state) => state.fetchReports);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const [selectedYear, setSelectedYear] = useState('1st Year');

  const pendingReportsList = reports.filter((r) => r.status === 'SUBMITTED_TO_HOD');
  const PENDING_REPORTS = pendingReportsList.length;

  const filteredClasses = CLASSES_DATA.filter((c) => c.year === selectedYear);
  const hodBoardInfo = getHODForYear(selectedYear);

  const avgDeptCoverage = Math.round(
    filteredClasses.reduce((acc, curr) => acc + curr.coverage, 0) / (filteredClasses.length || 1)
  );

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
        {/* Top Meta Bar */}
        <View style={styles.topMetaRow}>
          <View>
            <Label text="HEAD OF DEPARTMENT DASHBOARD" />
            <Text style={styles.facultyName} numberOfLines={1}>
              {user?.name || hodBoardInfo.hodName}
            </Text>
          </View>
          <View style={styles.deptBadge}>
            <Text style={styles.deptText}>
              {user?.department ? user.department.toUpperCase() : 'CSE'}
            </Text>
          </View>
        </View>

        {/* 1px Hairline Rule */}
        <Rule thickness="hairline" style={styles.hairlineSpacer} />

        {/* Hero Section: Big Number 104 with Vermilion % */}
        <View style={styles.heroSection}>
          <Label text={`${selectedYear.toUpperCase()} AVERAGE COVERAGE`} />
          <View style={styles.heroRow}>
            <BigNumber value={avgDeptCoverage} size="hero" showPercent />
          </View>
        </View>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* 3-Column Stat Row */}
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{CLASSES_DATA.length}</Text>
            <Label text="CLASSES" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>81%</Text>
            <Label text="ALL DEPT" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text
              style={[
                styles.statNum,
                PENDING_REPORTS > 0 ? styles.accentStatNum : null,
              ]}
            >
              {PENDING_REPORTS}
            </Text>
            <Label text="PENDING" />
          </View>
        </View>

        {/* 1px Hairline Rule */}
        <Rule thickness="hairline" style={styles.hairlineSpacer} />

        {/* Quick Action: Manage Coordinators & Credentials */}
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => navigation.navigate('ManageCoordinators')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryActionText}>MANAGE COORDINATORS & CREDENTIALS</Text>
          <Feather name="arrow-right" size={18} color={EditorialColors.white} />
        </TouchableOpacity>

        {/* Year Filter Chips */}
        <View style={styles.filterChipRow}>
          {YEARS.map((yr) => (
            <EditorialChip
              key={yr}
              label={yr.toUpperCase()}
              selected={selectedYear === yr}
              onPress={() => setSelectedYear(yr)}
            />
          ))}
        </View>

        {/* Section Header: Classes */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>
            {selectedYear.toUpperCase()} SECTIONS
          </Text>
          <Label text={`${filteredClasses.length} SECTIONS`} />
        </View>

        {/* Class Rows with SegBars */}
        <View style={styles.classList}>
          {filteredClasses.map((item) => {
            const isLagging = item.coverage < 75;
            return (
              <TouchableOpacity
                key={item.classId}
                style={styles.classRow}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('SubjectReports', { classId: item.classId })
                }
              >
                <View style={styles.rowTop}>
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{item.name}</Text>
                    <Label
                      text={`CC: ${item.ccName?.toUpperCase() || 'UNASSIGNED'}${
                        item.pendingCount > 0 ? ' • 1 PENDING' : ''
                      }`}
                      style={styles.ccMetaLabel}
                    />
                  </View>

                  <View style={styles.rightValueBox}>
                    <Text
                      style={[
                        styles.percentText,
                        isLagging ? styles.accentPercentText : null,
                      ]}
                    >
                      {item.coverage}%
                    </Text>
                  </View>
                </View>

                {/* 25-Segment Bar */}
                <View style={styles.segBarWrapper}>
                  <SegBar
                    totalSegments={25}
                    filledSegments={Math.round((item.coverage / 100) * 25)}
                    isLagging={isLagging}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Pending Approval Shortcut if pending */}
        {PENDING_REPORTS > 0 && (
          <TouchableOpacity
            style={styles.pendingBanner}
            onPress={() => navigation.navigate('Approval', { reportId: pendingReportsList[0]?.id })}
            activeOpacity={0.85}
          >
            <View>
              <Text style={styles.pendingBannerTitle}>
                {PENDING_REPORTS} REPORT{PENDING_REPORTS > 1 ? 'S' : ''} AWAITING HOD APPROVAL
              </Text>
              <Label text="ACTION REQUIRED" style={{ color: EditorialColors.white }} />
            </View>
            <Feather name="arrow-right" size={20} color={EditorialColors.white} />
          </TouchableOpacity>
        )}
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
  topMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  facultyName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 22,
    lineHeight: 26,
    color: EditorialColors.ink,
    marginTop: 2,
  },
  deptBadge: {
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deptText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 10,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
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
  primaryActionButton: {
    height: 54,
    width: '100%',
    backgroundColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  primaryActionText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 1.5,
    color: EditorialColors.white,
  },
  filterChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
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
  classList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
  },
  classRow: {
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
  classInfo: {
    flex: 1,
    marginRight: 12,
  },
  className: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 17,
    lineHeight: 22,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  ccMetaLabel: {
    letterSpacing: 1.5,
  },
  rightValueBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  percentText: {
    fontFamily: EditorialFonts.display,
    fontSize: 30,
    lineHeight: 34,
    color: EditorialColors.ink,
  },
  accentPercentText: {
    color: EditorialColors.accent,
  },
  segBarWrapper: {
    marginTop: 2,
  },
  pendingBanner: {
    backgroundColor: EditorialColors.accent,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  pendingBannerTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 1.5,
    color: EditorialColors.white,
    marginBottom: 4,
  },
});
