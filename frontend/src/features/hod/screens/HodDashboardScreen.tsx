import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Avatar, Button, Badge, Divider, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { Palette } from '@theme/colors';
import { StaffStackParamList } from '@navigation/types';
import { useReportStore } from '@features/cc/store/useReportStore';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ms } from '@theme/responsive';

import { FacultyBoardCard } from '@components/common/FacultyBoardCard';
import { getCCForSection, getHODForYear } from '@config/facultyBoard';

type HodNav = NativeStackNavigationProp<StaffStackParamList>;

interface ClassData {
  classId: string;
  name: string;
  year: string;
  coverage: number;
  pendingCount: number;
  ccName?: string;
}

const CLASSES_DATA: ClassData[] = [
  // 1st Year Engineering Science
  { classId: '1st Year SEC-A', name: '1st Year SEC-A', year: '1st Year', coverage: 78, pendingCount: 0, ccName: 'Dr. Karuppaiya' },
  { classId: '1st Year SEC-B', name: '1st Year SEC-B', year: '1st Year', coverage: 82, pendingCount: 0, ccName: 'Mrs. G.Revathi' },
  { classId: '1st Year SEC-C', name: '1st Year SEC-C', year: '1st Year', coverage: 75, pendingCount: 1, ccName: 'Mrs. Gopikha' },
  { classId: '1st Year SEC-D', name: '1st Year SEC-D', year: '1st Year', coverage: 80, pendingCount: 0, ccName: 'Dr. Bhuvaneshwari' },
  { classId: '1st Year SEC-E', name: '1st Year SEC-E', year: '1st Year', coverage: 70, pendingCount: 0, ccName: 'Dr. Josphin' },
  { classId: '1st Year SEC-F', name: '1st Year SEC-F', year: '1st Year', coverage: 85, pendingCount: 0, ccName: 'Mrs. Jasline' },
  { classId: '1st Year SEC-G', name: '1st Year SEC-G', year: '1st Year', coverage: 72, pendingCount: 1, ccName: 'Mrs. R.Sumathi' },

  // 2nd Year CSE
  { classId: '2nd Year CSE-A', name: '2nd Year CSE-A', year: '2nd Year', coverage: 84, pendingCount: 0, ccName: 'Mrs. Agnus' },
  { classId: '2nd Year CSE-B', name: '2nd Year CSE-B', year: '2nd Year', coverage: 79, pendingCount: 0, ccName: 'Mrs. Archana' },

  // 3rd Year CSE
  { classId: '3rd Year CSE-A', name: '3rd Year CSE-A', year: '3rd Year', coverage: 88, pendingCount: 0, ccName: 'Ms. Punitha EM' },
  { classId: '3rd Year CSE-B', name: '3rd Year CSE-B', year: '3rd Year', coverage: 85, pendingCount: 0, ccName: 'Ms. E Uva Shakthi' },

  // 4th Year CSE
  { classId: '4th Year CSE-A', name: '4th Year CSE-A', year: '4th Year', coverage: 92, pendingCount: 0, ccName: 'Mr. S Faizal Mukthar Hussain' },
  { classId: '4th Year CSE-B', name: '4th Year CSE-B', year: '4th Year', coverage: 90, pendingCount: 0, ccName: 'Ms. R Rajalakshmi' },
];

export const HodDashboardScreen = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<any>();
  const reports = useReportStore((state) => state.reports);
  const fetchReports = useReportStore((state) => state.fetchReports);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const [selectedYear, setSelectedYear] = useState('1st Year');
  const [showBoardModal, setShowBoardModal] = useState(false);

  // Filter pending reports that are submitted to the HOD
  const pendingReportsList = reports.filter((r) => r.status === 'SUBMITTED_TO_HOD');
  const PENDING_REPORTS = pendingReportsList.length;

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase()
    : 'HD';

  // Filter classes according to selectedYear
  const filteredClasses = CLASSES_DATA.filter((c) => c.year === selectedYear);
  const hodBoardInfo = getHODForYear(selectedYear);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Avatar.Text size={52} label={initials} style={styles.avatar} labelStyle={styles.avatarLabel} />
        <View style={styles.headerText}>
          <Text style={styles.welcomeLabel}>HOD Dashboard • {hodBoardInfo.hodName}</Text>
          <Text style={styles.deptName}>{user?.department || hodBoardInfo.department}</Text>
        </View>
      </View>

      {/* ── TOP STATS OVERVIEW BANNER ── */}
      <View style={styles.statsSummaryBox}>
        <View style={styles.statItem}>
          <Text style={styles.statItemNum}>{CLASSES_DATA.length}</Text>
          <Text style={styles.statItemLabel}>Total Classes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statItemNum, { color: Palette.primary }]}>81%</Text>
          <Text style={styles.statItemLabel}>Dept Coverage</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statItemNum, { color: PENDING_REPORTS > 0 ? Palette.warning : Palette.success }]}>
            {PENDING_REPORTS}
          </Text>
          <Text style={styles.statItemLabel}>Pending Reports</Text>
        </View>
      </View>

      {/* ── MANAGE COORDINATORS QUICK ACTION ── */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: 14,
          borderRadius: 14,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          elevation: 2,
        }}
        onPress={() => navigation.navigate('ManageCoordinators')}
      >
        <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center' }}>
          <MaterialCommunityIcons name="account-tie" size={24} color={Palette.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#0F172A' }}>
            Class Coordinators & Credentials
          </Text>
          <Text style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>
            Assign CCs & generate login credentials per section
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color={Palette.primary} />
      </TouchableOpacity>


      {/* ── SELECT ACADEMIC YEAR ── */}
      <Text style={styles.sectionTitle}>Select Academic Year</Text>
      <View style={styles.yearSelectorContainer}>
        {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((year) => {
          const isSelected = selectedYear === year;
          return (
            <TouchableOpacity
              key={year}
              onPress={() => setSelectedYear(year)}
              style={[styles.yearBtn, isSelected && styles.yearBtnActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.yearBtnText, isSelected && styles.yearBtnTextActive]}>
                {year}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── HOD BOARD & CC BOARD BANNER FOR SELECTED YEAR ── */}
      <FacultyBoardCard yearOrDept={selectedYear} showTitle={true} />

      {/* ── CLASSES DISPLAY LIST ── */}
      <Text style={styles.sectionTitle}>{selectedYear} Section CC & Overview</Text>
      <View style={styles.classesContainer}>
        {filteredClasses.map((cls) => {
          const ccInfo = getCCForSection(cls.classId);
          const ccFacultyName = ccInfo?.facultyName || cls.ccName || 'Faculty Coordinator';
          return (
            <Card key={cls.classId} style={styles.classCard}>
              <Card.Content>
                <View style={styles.classHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.className}>{cls.name}</Text>
                    <Text style={styles.classDeptSub}>
                      {cls.year === '1st Year' ? 'Engineering Science Dept' : (user?.department || 'CSE Dept')}
                    </Text>
                    <View style={styles.ccNameTagRow}>
                      <MaterialCommunityIcons name="shield-star" size={15} color={Palette.primary} />
                      <Text style={styles.ccNameTagText}>CC: {ccFacultyName}</Text>
                    </View>
                  </View>
                  {cls.pendingCount > 0 ? (
                    <Badge style={styles.pendingBadge}>{`${cls.pendingCount} Pending`}</Badge>
                  ) : (
                    <Badge style={styles.okBadge}>All Logged</Badge>
                  )}
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Average Coverage</Text>
                    <Text style={styles.progressValue}>{cls.coverage}%</Text>
                  </View>
                  <ProgressBar progress={cls.coverage / 100} color={Palette.primary} style={styles.progressBar} />
                </View>

                <Button
                  mode="outlined"
                  compact
                  icon="eye"
                  style={styles.inspectBtn}
                  labelStyle={styles.inspectBtnLabel}
                  onPress={() => navigation.navigate('StaffHome', {
                    screen: 'FacultyProgress',
                    params: { classId: cls.classId }
                  })}
                >
                  Inspect Class Progress
                </Button>
              </Card.Content>
            </Card>
          );
        })}
      </View>

      {/* ── QUICK ACTIONS ── */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <TouchableOpacity
        style={styles.actionRow}
        onPress={() => navigation.navigate('DepartmentClasses')}
        activeOpacity={0.7}
      >
        <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
          <MaterialCommunityIcons name="google-classroom" size={22} color={Palette.primary} />
        </View>
        <View style={styles.actionTextBox}>
          <Text style={styles.actionTitle}>Department Classes & Subjects</Text>
          <Text style={styles.actionSubtitle}>Explore classes, spreadsheets, and subjects mapping</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#94A3B8" />
      </TouchableOpacity>

      {/* ── LOGOUT BUTTON ── */}
      <Button
        mode="text"
        onPress={logout}
        style={styles.logoutBtn}
        textColor={Palette.error}
        labelStyle={styles.logoutLabel}
        icon="logout"
      >
        Sign Out Account
      </Button>
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

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ms(8),
    marginBottom: ms(20),
  },
  avatar: {
    backgroundColor: Palette.primary,
    elevation: 2,
  },
  avatarLabel: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerText: {
    marginLeft: ms(14),
    flex: 1,
  },
  welcomeLabel: {
    fontSize: ms(12),
    fontWeight: '700',
    color: Palette.textLight,
    textTransform: 'uppercase',
  },
  deptName: {
    fontSize: ms(18),
    fontWeight: '900',
    color: Palette.textDark,
    marginTop: ms(1),
  },

  // Dynamic Summary Stats Box
  statsSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    paddingVertical: ms(14),
    paddingHorizontal: ms(16),
    marginBottom: ms(16),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(4) },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statItemNum: {
    fontSize: ms(20),
    fontWeight: '900',
    color: Palette.textDark,
  },
  statItemLabel: {
    fontSize: ms(11),
    fontWeight: '600',
    color: Palette.textLight,
    marginTop: ms(2),
  },
  statDivider: {
    width: 1,
    height: ms(24),
    backgroundColor: '#CBD5E1',
  },

  // Section labels
  sectionTitle: {
    fontSize: ms(11),
    fontWeight: '800',
    color: Palette.textLight,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    marginBottom: ms(10),
    marginTop: ms(14),
    paddingLeft: ms(4),
  },

  // Year Selector styles
  yearSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    padding: ms(8),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: ms(12),
  },
  yearBtn: {
    flex: 1,
    paddingVertical: ms(10),
    borderRadius: ms(12),
    alignItems: 'center',
    marginHorizontal: ms(4),
    backgroundColor: '#F1F5F9',
  },
  yearBtnActive: {
    backgroundColor: Palette.primary,
  },
  yearBtnText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: Palette.textLight,
  },
  yearBtnTextActive: {
    color: '#FFFFFF',
  },

  // Class Cards styles
  classesContainer: {
    marginBottom: ms(8),
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    marginBottom: ms(12),
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(4) },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ms(12),
  },
  className: {
    fontSize: ms(16),
    fontWeight: '800',
    color: Palette.textDark,
  },
  classDeptSub: {
    fontSize: ms(12),
    color: Palette.textLight,
    fontWeight: '500',
    marginTop: ms(1),
  },
  pendingBadge: {
    backgroundColor: '#FEF2F2',
    color: Palette.error,
    fontWeight: '800',
    paddingHorizontal: ms(8),
    borderRadius: ms(6),
  },
  okBadge: {
    backgroundColor: '#ECFDF5',
    color: Palette.success,
    fontWeight: '800',
    paddingHorizontal: ms(8),
    borderRadius: ms(6),
  },
  progressSection: {
    marginBottom: ms(14),
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ms(6),
  },
  progressLabel: {
    fontSize: ms(12),
    color: Palette.textLight,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: ms(13),
    fontWeight: '800',
    color: Palette.primary,
  },
  progressBar: {
    height: ms(6),
    borderRadius: ms(3),
  },
  inspectBtn: {
    borderRadius: ms(10),
    borderColor: Palette.primary,
    borderWidth: 1.5,
  },
  inspectBtnLabel: {
    fontSize: ms(12),
    fontWeight: '700',
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
    fontSize: ms(15),
    fontWeight: '800',
    color: Palette.textDark,
  },
  reviewSubtitle: {
    fontSize: ms(12.5),
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

  // Logout styles
  logoutBtn: {
    marginTop: ms(20),
    alignSelf: 'center',
  },
  logoutLabel: {
    fontSize: ms(13),
    fontWeight: '800',
  },
  // Quick Actions styles
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    padding: ms(16),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: ms(16),
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(4) },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  actionIconBox: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(14),
  },
  actionTextBox: {
    flex: 1,
  },
  actionTitle: {
    fontSize: ms(14.5),
    fontWeight: '800',
    color: Palette.textDark,
  },
  actionSubtitle: {
    fontSize: ms(11.5),
    color: Palette.textLight,
    fontWeight: '500',
    marginTop: ms(2),
  },
  ccNameTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ms(4),
    gap: ms(4),
  },
  ccNameTagText: {
    fontSize: ms(12.5),
    fontWeight: '800',
    color: Palette.primary,
  },
});

export default HodDashboardScreen;
