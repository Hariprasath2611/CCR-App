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

type HodNav = NativeStackNavigationProp<StaffStackParamList>;

interface ClassData {
  classId: string;
  name: string;
  year: string;
  coverage: number;
  pendingCount: number;
}

const CLASSES_DATA: ClassData[] = [
  // 2nd Year
  { classId: '2nd Year CSE-A', name: '2nd Year CSE-A', year: '2nd Year', coverage: 80, pendingCount: 0 },
  { classId: 'CSE-B', name: '2nd Year CSE-B', year: '2nd Year', coverage: 65, pendingCount: 1 },
  { classId: '2nd Year CSBS', name: '2nd Year CSBS', year: '2nd Year', coverage: 70, pendingCount: 0 },

  // 3rd Year
  { classId: '3rd Year CSE-A', name: '3rd Year CSE-A', year: '3rd Year', coverage: 82, pendingCount: 0 },
  { classId: '3rd Year CSE-B', name: '3rd Year CSE-B', year: '3rd Year', coverage: 75, pendingCount: 0 },
  { classId: '3rd Year IT', name: '3rd Year IT', year: '3rd Year', coverage: 60, pendingCount: 2 },

  // 4th Year
  { classId: '4th Year CSE-A', name: '4th Year CSE-A', year: '4th Year', coverage: 90, pendingCount: 0 },
  { classId: '4th Year CSE-B', name: '4th Year CSE-B', year: '4th Year', coverage: 85, pendingCount: 0 },
  { classId: '4th Year ECE', name: '4th Year ECE', year: '4th Year', coverage: 78, pendingCount: 1 },
];

export const HodDashboardScreen = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<HodNav>();
  const reports = useReportStore((state) => state.reports);

  const [selectedYear, setSelectedYear] = useState('2nd Year');

  // Filter pending reports that are submitted to the HOD
  const pendingReportsList = reports.filter((r) => r.status === 'SUBMITTED_TO_HOD');
  const PENDING_REPORTS = pendingReportsList.length;
  const PENDING_EXTRA_HOURS = 3;

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase()
    : 'HD';

  // Filter classes according to selectedYear
  const filteredClasses = CLASSES_DATA.filter((c) => c.year === selectedYear);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Avatar.Text size={52} label={initials} style={styles.avatar} labelStyle={styles.avatarLabel} />
        <View style={styles.headerText}>
          <Text style={styles.welcomeLabel}>HOD Dashboard</Text>
          <Text style={styles.deptName}>{user?.department || 'Computer Science Engineering'}</Text>
        </View>
      </View>

      {/* ── SELECT ACADEMIC YEAR ── */}
      <Text style={styles.sectionTitle}>Select Academic Year</Text>
      <View style={styles.yearSelectorContainer}>
        {['2nd Year', '3rd Year', '4th Year'].map((year) => {
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

      {/* ── CLASSES DISPLAY LIST ── */}
      <Text style={styles.sectionTitle}>{selectedYear} Classes Overview</Text>
      <View style={styles.classesContainer}>
        {filteredClasses.map((cls) => (
          <Card key={cls.classId} style={styles.classCard}>
            <Card.Content>
              <View style={styles.classHeader}>
                <View>
                  <Text style={styles.className}>{cls.name}</Text>
                  <Text style={styles.classDeptSub}>{user?.department || 'CSE Dept'}</Text>
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
                onPress={() => navigation.navigate('FacultyProgress', { classId: cls.classId })}
              >
                Inspect Class Progress
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* ── PENDING REVIEWS ── */}
      <Text style={styles.sectionTitle}>Pending CC & HOD Reviews</Text>
      
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
            {PENDING_REPORTS} class consolidated progress reports are awaiting your approval and HOD feedback.
          </Text>
          <Button
            mode="contained"
            style={styles.reviewBtn}
            buttonColor={Palette.primary}
            onPress={() => {
              if (PENDING_REPORTS > 0) {
                navigation.navigate('RequestDetails', {
                  requestId: pendingReportsList[0].id,
                  requestType: 'CC_REPORT',
                });
              } else {
                alert('No pending CC reports to review.');
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
            <Badge style={styles.warningBadge}>{PENDING_EXTRA_HOURS}</Badge>
          </View>
          <Text style={styles.reviewSubtitle}>
            {PENDING_EXTRA_HOURS} faculty slot requests require approval for compensatory lecture timing.
          </Text>
          <Button
            mode="outlined"
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
    padding: 16,
    paddingBottom: 32,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
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
    marginLeft: 14,
    flex: 1,
  },
  welcomeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textLight,
    textTransform: 'uppercase',
  },
  deptName: {
    fontSize: 18,
    fontWeight: '900',
    color: Palette.textDark,
    marginTop: 1,
  },

  // Section labels
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.textLight,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 14,
    paddingLeft: 4,
  },

  // Year Selector styles
  yearSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  yearBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#F1F5F9',
  },
  yearBtnActive: {
    backgroundColor: Palette.primary,
  },
  yearBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textLight,
  },
  yearBtnTextActive: {
    color: '#FFFFFF',
  },

  // Class Cards styles
  classesContainer: {
    marginBottom: 8,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
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
    marginBottom: 12,
  },
  className: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.textDark,
  },
  classDeptSub: {
    fontSize: 12,
    color: Palette.textLight,
    fontWeight: '500',
    marginTop: 1,
  },
  pendingBadge: {
    backgroundColor: '#FEF2F2',
    color: Palette.error,
    fontWeight: '800',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  okBadge: {
    backgroundColor: '#ECFDF5',
    color: Palette.success,
    fontWeight: '800',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  progressSection: {
    marginBottom: 14,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: Palette.textLight,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.primary,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  inspectBtn: {
    borderRadius: 10,
    borderColor: Palette.primary,
    borderWidth: 1.5,
  },
  inspectBtnLabel: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Review card styles
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.textDark,
  },
  reviewSubtitle: {
    fontSize: 12.5,
    color: Palette.textLight,
    lineHeight: 18,
    marginBottom: 12,
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
    borderRadius: 10,
    paddingVertical: 2,
  },

  // Logout styles
  logoutBtn: {
    marginTop: 20,
    alignSelf: 'center',
  },
  logoutLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
});

export default HodDashboardScreen;
