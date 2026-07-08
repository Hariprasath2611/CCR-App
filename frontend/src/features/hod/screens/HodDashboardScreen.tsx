import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Avatar, Button, Badge, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { Palette } from '@theme/colors';
import { HodStackParamList } from '@navigation/types';

type HodNav = NativeStackNavigationProp<HodStackParamList>;
import { useReportStore } from '@features/cc/store/useReportStore';

interface ActionCardProps {
  title: string;
  subtitle: string;
  badgeCount?: number;
  buttonLabel: string;
  onPress: () => void;
  buttonMode?: 'contained' | 'outlined';
  accentColor?: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  badgeCount,
  buttonLabel,
  onPress,
  buttonMode = 'contained',
  accentColor = Palette.primary,
}) => (
  <Card style={[styles.card, { borderLeftColor: accentColor }]}>
    <Card.Content>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {badgeCount !== undefined && badgeCount > 0 && (
          <Badge style={[styles.badge, { backgroundColor: Palette.error }]}>
            {badgeCount}
          </Badge>
        )}
      </View>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
      <Button
        mode={buttonMode}
        compact
        style={[styles.cardBtn, buttonMode === 'contained' && { backgroundColor: accentColor }]}
        onPress={onPress}
        labelStyle={styles.cardBtnLabel}
      >
        {buttonLabel}
      </Button>
    </Card.Content>
  </Card>
);

export const HodDashboardScreen = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<HodNav>();
  const reports = useReportStore((state) => state.reports);

  // Filter pending reports that are submitted to the HOD
  const pendingReportsList = reports.filter((r) => r.status === 'SUBMITTED_TO_HOD');
  const PENDING_REPORTS = pendingReportsList.length;
  const PENDING_EXTRA_HOURS = 3; // Mock other requests

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase()
    : 'HD';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Avatar.Text size={52} label={initials} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.welcomeLabel}>HOD Dashboard</Text>
          <Text style={styles.deptName}>{user?.department || 'Department'}</Text>
        </View>
      </View>

      {/* ── Summary Strip ── */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryChip}>
          <Text style={styles.summaryCount}>{PENDING_REPORTS}</Text>
          <Text style={styles.summaryLabel}>Pending{'\n'}Reports</Text>
        </View>
        <Divider style={styles.summaryDivider} />
        <View style={styles.summaryChip}>
          <Text style={styles.summaryCount}>{PENDING_EXTRA_HOURS}</Text>
          <Text style={styles.summaryLabel}>Extra Hour{'\n'}Requests</Text>
        </View>
        <Divider style={styles.summaryDivider} />
        <View style={styles.summaryChip}>
          <Text style={[styles.summaryCount, { color: Palette.success }]}>74%</Text>
          <Text style={styles.summaryLabel}>Syllabus{'\n'}Coverage</Text>
        </View>
      </View>

      {/* ── Action Cards ── */}
      <Text style={styles.sectionTitle}>Pending Reviews</Text>

      <ActionCard
        title="CC Consolidated Reports"
        subtitle={`${PENDING_REPORTS} class reports awaiting HOD approval and remarks.`}
        badgeCount={PENDING_REPORTS}
        buttonLabel="Review Reports"
        accentColor={Palette.primary}
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
      />

      <ActionCard
        title="Extra Teaching Hour Requests"
        subtitle={`${PENDING_EXTRA_HOURS} faculty requested compensatory class slots this week.`}
        badgeCount={PENDING_EXTRA_HOURS}
        buttonLabel="Review Requests"
        accentColor={Palette.warning}
        buttonMode="outlined"
        onPress={() =>
          navigation.navigate('RequestDetails', {
            requestId: 'sample-extra-001',
            requestType: 'EXTRA_HOURS',
          })
        }
      />

      <Text style={styles.sectionTitle}>Analytics</Text>

      <ActionCard
        title="Department Syllabus Analytics"
        subtitle="View class-wise and faculty-wise syllabus completion trends and coverage index."
        buttonLabel="Open Analytics"
        accentColor={Palette.success}
        buttonMode="outlined"
        onPress={() => navigation.navigate('DeptAnalytics')}
      />

      <Button
        mode="text"
        onPress={logout}
        style={styles.logoutBtn}
        textColor={Palette.error}
        labelStyle={styles.logoutLabel}
      >
        Sign Out
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Off-white premium workspace canvas
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  avatar: {
    backgroundColor: '#0F52BA',
  },
  headerText: {
    marginLeft: 14,
  },
  welcomeLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  deptName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryChip: {
    flex: 1,
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F52BA',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  summaryDivider: {
    height: 40,
    width: 1,
    backgroundColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  badge: {
    alignSelf: 'center',
    marginLeft: 8,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 4,
  },
  cardBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderRadius: 8,
  },
  cardBtnLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 24,
    alignSelf: 'center',
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
