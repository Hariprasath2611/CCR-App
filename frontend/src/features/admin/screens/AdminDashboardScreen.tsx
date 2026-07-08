import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Avatar, Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useReportStore } from '@features/cc/store/useReportStore';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export const AdminDashboardScreen = () => {
  const { logout, user } = useAuthStore();
  const navigation = useNavigation<any>();
  const reports = useReportStore((state) => state.reports);

  // Dynamic statistics calculations
  const totalDepartments = 12; // Seeding departments list
  const totalClasses = 48; // Standard mockup
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
            <Text style={styles.principalName}>Dr. Ramesh 👋</Text>
            <Text style={styles.roleText}>Principal</Text>
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
            onPress={() => navigation.navigate('Reports')}
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

          {/* Action 2: Pending Approvals */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('Reports')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FFF7ED' }]}>
              <MaterialCommunityIcons name="folder-clock-outline" size={24} color="#F97316" />
            </View>
            <View style={styles.actionTextBox}>
              <Text style={styles.actionTitle}>Pending Approvals</Text>
              <Text style={styles.actionSubtitle}>Approve or reject reports</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>

          {/* Action 3: Report Analytics */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('Analytics')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
              <MaterialCommunityIcons name="chart-bar" size={24} color="#10B981" />
            </View>
            <View style={styles.actionTextBox}>
              <Text style={styles.actionTitle}>Report Analytics</Text>
              <Text style={styles.actionSubtitle}>View overall report analytics</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={logout}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={18} color={Palette.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
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
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#C8D8F5',
    fontSize: 15,
    fontWeight: '500',
  },
  principalName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
  },
  roleText: {
    color: '#C8D8F5',
    fontSize: 15,
    marginTop: 2,
  },
  bellButton: {
    padding: 8,
    position: 'relative',
  },
  bellBadge: {
    backgroundColor: '#EF4444',
    position: 'absolute',
    top: 8,
    right: 8,
    borderWidth: 1.5,
    borderColor: '#0F52BA',
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -15,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
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
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statTextBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F52BA',
    marginTop: 2,
  },

  // Quick Actions Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F52BA',
    marginTop: 18,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionTextBox: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  
  // Sign Out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 28,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#FCE8E6',
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 6,
  },
});
