import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Avatar, Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useReportStore } from '@features/cc/store/useReportStore';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DEPARTMENTS } from './DeptSummaryScreen';

import { ms } from '@theme/responsive';

export const PrincipalDashboardScreen = () => {
  const { logout, user } = useAuthStore();
  const navigation = useNavigation<any>();
  const reports = useReportStore((state) => state.reports);
  const fetchReports = useReportStore((state) => state.fetchReports);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Dynamic statistics calculations
  const totalDepartments = DEPARTMENTS.length;
  const totalClasses = reports.length > 0 ? new Set(reports.map(r => r.classId)).size : 13;
  const reportsSubmitted = reports.length;
  const pendingApproval = reports.filter((r) => r.status === 'SUBMITTED_TO_HOD').length;
  const approvedReports = reports.filter((r) => r.status === 'SENT_TO_ADMIN').length;
  const rejectedReports = reports.filter(
    (r) => r.status === 'REJECTED_BY_HOD' || r.status === 'RETURNED_BY_HOD'
  ).length;

  return (
    <View style={styles.container}>
      {/* ── Header Banner ── */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.principalName}>{user?.name || 'Dr. Ramesh'} 👋</Text>
            <Text style={styles.roleText}>Principal • CCR Central Administration</Text>
          </View>
          
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={28} color="#FFFFFF" />
            <Badge style={styles.bellBadge} size={8} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Content Card overlapping Header ── */}
      <View style={styles.contentWrapper}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── 2x3 Statistics Grid ── */}
          <View style={styles.statsGrid}>
            
            {/* Stat 1: Departments */}
            <View style={styles.statCell}>
              <View style={[styles.statIconBox, { backgroundColor: '#EEF2FF' }]}>
                <MaterialCommunityIcons name="office-building" size={24} color="#3B82F6" />
              </View>
              <View style={styles.statTextBox}>
                <Text style={styles.statLabel}>Departments</Text>
                <Text style={styles.statValue}>{totalDepartments}</Text>
              </View>
            </View>

            {/* Stat 2: Total Classes */}
            <View style={styles.statCell}>
              <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5' }]}>
                <MaterialCommunityIcons name="google-classroom" size={24} color="#10B981" />
              </View>
              <View style={styles.statTextBox}>
                <Text style={styles.statLabel}>Total Classes</Text>
                <Text style={styles.statValue}>{totalClasses}</Text>
              </View>
            </View>

            {/* Stat 3: Reports Submitted */}
            <View style={styles.statCell}>
              <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}>
                <MaterialCommunityIcons name="file-document-outline" size={24} color="#2563EB" />
              </View>
              <View style={styles.statTextBox}>
                <Text style={styles.statLabel}>Reports Submitted</Text>
                <Text style={styles.statValue}>{reportsSubmitted}</Text>
              </View>
            </View>

            {/* Stat 4: Pending Approval */}
            <View style={styles.statCell}>
              <View style={[styles.statIconBox, { backgroundColor: '#FFF7ED' }]}>
                <MaterialCommunityIcons name="folder-outline" size={24} color="#F97316" />
              </View>
              <View style={styles.statTextBox}>
                <Text style={styles.statLabel}>Pending Approval</Text>
                <Text style={styles.statValue}>{pendingApproval}</Text>
              </View>
            </View>

            {/* Stat 5: Approved Reports */}
            <View style={styles.statCell}>
              <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5' }]}>
                <MaterialCommunityIcons name="file-check-outline" size={24} color="#10B981" />
              </View>
              <View style={styles.statTextBox}>
                <Text style={styles.statLabel}>Approved Reports</Text>
                <Text style={styles.statValue}>{approvedReports}</Text>
              </View>
            </View>

            {/* Stat 6: Rejected Reports */}
            <View style={styles.statCell}>
              <View style={[styles.statIconBox, { backgroundColor: '#FEF2F2' }]}>
                <MaterialCommunityIcons name="file-cancel-outline" size={24} color="#EF4444" />
              </View>
              <View style={styles.statTextBox}>
                <Text style={styles.statLabel}>Rejected Reports</Text>
                <Text style={styles.statValue}>{rejectedReports}</Text>
              </View>
            </View>

          </View>

          {/* ── Quick Actions ── */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          {/* Action 1: View Departments */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('DeptSummary')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#F5F3FF' }]}>
              <MaterialCommunityIcons name="account-group-outline" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.actionTextBox}>
              <Text style={styles.actionTitle}>View Departments</Text>
              <Text style={styles.actionSubtitle}>View all department classes</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>




        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F52BA', // Sapphire/Royal Blue
  },
  header: {
    paddingTop: ms(50),
    paddingHorizontal: ms(24),
    paddingBottom: ms(40),
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#C8D8F5',
    fontSize: ms(15),
    fontWeight: '500',
  },
  principalName: {
    color: '#FFFFFF',
    fontSize: ms(24),
    fontWeight: 'bold',
    marginTop: ms(2),
  },
  roleText: {
    color: '#C8D8F5',
    fontSize: ms(15),
    marginTop: ms(2),
  },
  bellButton: {
    padding: ms(8),
    position: 'relative',
  },
  bellBadge: {
    backgroundColor: '#EF4444',
    position: 'absolute',
    top: ms(8),
    right: ms(8),
    borderWidth: 1.5,
    borderColor: '#0F52BA',
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: ms(28),
    borderTopRightRadius: ms(28),
    marginTop: ms(-15),
  },
  scrollContent: {
    paddingHorizontal: ms(20),
    paddingTop: ms(24),
    paddingBottom: ms(32),
  },
  
  // 2x3 Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  statCell: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: ms(12),
    paddingVertical: ms(12),
    paddingHorizontal: ms(10),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ms(12),
    shadowColor: '#000',
    shadowOffset: { width: ms(0), height: ms(1) },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statIconBox: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(10),
  },
  statTextBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: ms(11),
    fontWeight: '600',
    color: '#64748B',
  },
  statValue: {
    fontSize: ms(18),
    fontWeight: 'bold',
    color: '#0F52BA',
    marginTop: ms(2),
  },

  // Quick Actions Section
  sectionTitle: {
    fontSize: ms(16),
    fontWeight: 'bold',
    color: '#0F52BA',
    marginTop: ms(18),
    marginBottom: ms(12),
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: ms(12),
    padding: ms(14),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: ms(10),
    shadowColor: '#000',
    shadowOffset: { width: ms(0), height: ms(1) },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  actionIconBox: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(14),
  },
  actionTextBox: {
    flex: 1,
  },
  actionTitle: {
    fontSize: ms(15),
    fontWeight: '700',
    color: '#1E293B',
  },
  actionSubtitle: {
    fontSize: ms(12),
    color: '#64748B',
    marginTop: ms(2),
  },
  
  // Sign Out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: ms(28),
    paddingVertical: ms(10),
    paddingHorizontal: ms(20),
    borderWidth: 1,
    borderColor: '#FCE8E6',
    borderRadius: ms(8),
    backgroundColor: '#FEF2F2',
  },
  signOutText: {
    fontSize: ms(14),
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: ms(6),
  },
});
