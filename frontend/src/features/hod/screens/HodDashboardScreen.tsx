import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { useReportStore } from '@features/cc/store/useReportStore';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getHODForYear } from '@config/facultyBoard';
import {
  DayRibbonColors,
  DayRibbonFonts,
  DayRibbonShapes,
  DayRibbonSpacing,
} from '@theme/dayRibbon';
import { BigNumber } from '@components/editorial/BigNumber';
import { ProgressBar } from '@components/editorial/ProgressBar';
import { StatTile } from '@components/editorial/StatTile';
import { EditorialChip } from '@components/editorial/EditorialChip';
import { ListRow } from '@components/editorial/ListRow';

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
            <View style={styles.roleTagRow}>
              <View style={styles.roleBadgePillHOD}>
                <Feather name="award" size={10} color="#059669" />
                <Text style={styles.roleBadgeTextHOD}>HEAD OF DEPARTMENT (HOD)</Text>
              </View>
            </View>
            <Text style={styles.facultyName} numberOfLines={1}>
              {user?.name || hodBoardInfo.hodName}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
          >
            <Feather name="bell" size={18} color={DayRibbonColors.ink} />
          </TouchableOpacity>
        </View>

        {/* Role Designation Card denoting HOD */}
        <View style={styles.roleDesignationCardHOD}>
          <View style={styles.roleDesignationIconCircleHOD}>
            <Feather name="award" size={20} color="#059669" />
          </View>
          <View style={styles.roleDesignationTextWrap}>
            <View style={styles.roleDesignationHeaderRow}>
              <Text style={styles.roleDesignationRoleTitle}>Head of Department (HOD)</Text>
              <View style={styles.roleDesignationPillHOD}>
                <Text style={styles.roleDesignationPillTextHOD}>HOD ACCESS</Text>
              </View>
            </View>
            <Text style={styles.roleDesignationSubtitle}>
              Department Head • {user?.department || 'Computer Science Engineering'}
            </Text>
          </View>
        </View>

        {/* Hero Section: Average Coverage Card */}
        <View style={styles.coverageHeroCard}>
          <Text style={styles.cardHeaderLabel}>
            {selectedYear.toUpperCase()} AVERAGE COVERAGE
          </Text>
          <View style={styles.heroRow}>
            <BigNumber value={avgDeptCoverage} size="hero" showPercent color={DayRibbonColors.cobalt} />
          </View>
          <ProgressBar progress={avgDeptCoverage} height={10} style={{ marginTop: 12 }} />
        </View>

        {/* 3-Column Stat Grid */}
        <View style={styles.statGrid}>
          <StatTile
            value={CLASSES_DATA.length}
            label="Classes"
            style={styles.statGridItem}
          />
          <StatTile
            value="81%"
            label="All Dept"
            style={styles.statGridItem}
          />
          <StatTile
            value={PENDING_REPORTS}
            label="Pending"
            isBehindPlan={PENDING_REPORTS > 0}
            style={styles.statGridItem}
          />
        </View>

        {/* Pending Approval Banner if pending */}
        {PENDING_REPORTS > 0 && (
          <TouchableOpacity
            style={styles.pendingBanner}
            onPress={() => navigation.navigate('Approval', { reportId: pendingReportsList[0]?.id })}
            activeOpacity={0.85}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.pendingBannerTitle}>
                {PENDING_REPORTS} Report{PENDING_REPORTS > 1 ? 's' : ''} Awaiting Approval
              </Text>
              <Text style={styles.pendingBannerSub}>Tap to review & sign off</Text>
            </View>
            <Feather name="arrow-right" size={18} color={DayRibbonColors.ink} />
          </TouchableOpacity>
        )}

        {/* Primary Action Button: Manage Coordinators & Credentials */}
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => navigation.navigate('ManageCoordinators')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryActionText}>Manage Coordinators</Text>
          <Feather name="users" size={18} color={DayRibbonColors.white} />
        </TouchableOpacity>

        {/* Year Filter Chips */}
        <View style={styles.filterChipRow}>
          {YEARS.map((yr) => (
            <EditorialChip
              key={yr}
              label={yr}
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
          <Text style={styles.sectionHeaderMeta}>{filteredClasses.length} SECTIONS</Text>
        </View>

        {/* Class Rows with ListRow and ProgressBar */}
        <View style={styles.classList}>
          {filteredClasses.map((item) => {
            const isBehind = item.coverage < 75;
            return (
              <ListRow
                key={item.classId}
                indexOrCode={item.classId}
                name={item.name}
                caption={`CC: ${item.ccName || 'Unassigned'}${item.pendingCount > 0 ? ' • 1 Pending' : ''}`}
                value={`${item.coverage}%`}
                progress={item.coverage}
                isBehindPlan={isBehind}
                onPress={() =>
                  navigation.navigate('SubjectReports', { classId: item.classId })
                }
              />
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
  roleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  roleBadgePillHOD: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  roleBadgeTextHOD: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 9.5,
    letterSpacing: 0.4,
    color: '#059669',
  },
  roleDesignationCardHOD: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    ...DayRibbonShapes.shadow,
  },
  roleDesignationIconCircleHOD: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleDesignationTextWrap: {
    flex: 1,
  },
  roleDesignationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  roleDesignationRoleTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 15,
    color: DayRibbonColors.ink,
  },
  roleDesignationPillHOD: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  roleDesignationPillTextHOD: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 10,
    color: '#047857',
    letterSpacing: 0.3,
  },
  roleDesignationSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
    lineHeight: 16,
  },
  facultyName: {
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
  coverageHeroCard: {
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
    marginBottom: 16,
  },
  statGridItem: {
    flex: 1,
  },
  pendingBanner: {
    backgroundColor: DayRibbonColors.lemon,
    borderRadius: DayRibbonShapes.buttonRadius,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    ...DayRibbonShapes.shadow,
  },
  pendingBannerTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.ink,
  },
  pendingBannerSub: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.ink,
    marginTop: 2,
  },
  primaryActionButton: {
    height: 52,
    width: '100%',
    backgroundColor: DayRibbonColors.cobalt,
    borderRadius: DayRibbonShapes.buttonRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    ...DayRibbonShapes.shadow,
  },
  primaryActionText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    letterSpacing: 0.5,
    color: DayRibbonColors.white,
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
    marginBottom: 12,
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
  classList: {
    width: '100%',
  },
});

export default HodDashboardScreen;
