import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { EditorialColors, EditorialFonts, EditorialSpacing } from '@theme/editorial';
import { Rule } from '@components/editorial/Rule';
import { Label } from '@components/editorial/Label';
import { NotificationAlertRow } from '@components/editorial/NotificationAlertRow';
import { EmptyState } from '@components/editorial/EmptyState';
import { ms } from '@theme/responsive';

interface NotificationItem {
  id: string;
  type: 'APPROVAL' | 'SUBMISSION' | 'EXTRA_HOURS' | 'ALERT';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    type: 'APPROVAL',
    title: 'Weekly Syllabus Plan Approved',
    message: 'Dr. Suresh Babu (HOD) approved your Week 12 Teaching Plan for Computer Networks (CS3591).',
    timestamp: '10 MINS AGO',
    read: false,
  },
  {
    id: 'notif_2',
    type: 'EXTRA_HOURS',
    title: 'Extra Hour Request Confirmed',
    message: 'Your compensatory teaching slot request for 20/07/2026 (Period 3) has been granted.',
    timestamp: '2 HOURS AGO',
    read: false,
  },
  {
    id: 'notif_3',
    type: 'SUBMISSION',
    title: 'Class CC Report Forwarded',
    message: 'Consolidated Course Coverage Report for 1st Year SEC-B has been forwarded to Principal for audit.',
    timestamp: 'YESTERDAY',
    read: true,
  },
  {
    id: 'notif_4',
    type: 'ALERT',
    title: 'Syllabus Lag Reminder',
    message: 'Week 13 deadline is approaching. Ensure Unit 4 syllabus logs are recorded before Friday 4:00 PM.',
    timestamp: '2 DAYS AGO',
    read: true,
  },
];

export const NotificationsScreen = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'ALL' | 'APPROVAL' | 'ALERTS'>('ALL');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleItemRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'APPROVAL') return n.type === 'APPROVAL' || n.type === 'EXTRA_HOURS';
    if (activeTab === 'ALERTS') return n.type === 'ALERT' || n.type === 'SUBMISSION';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={styles.headerBox}>
        <View style={styles.topRow}>
          <Label text="COMMUNICATION LOG" />
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>MARK ALL READ</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.headingText}>NOTIFICATIONS.</Text>
        <Text style={styles.subHeadingText}>
          {unreadCount > 0
            ? `${unreadCount} UNREAD NOTIFICATION${unreadCount > 1 ? 'S' : ''} IN SYSTEM AUDIT LOG`
            : 'ALL CAUGHT UP · ZERO UNREAD SYSTEM NOTIFICATIONS'}
        </Text>
      </View>
      <Rule thick style={styles.heroRule} />

      {/* ── FILTER TABS ── */}
      <View style={styles.tabsRow}>
        {(['ALL', 'APPROVAL', 'ALERTS'] as const).map((tab) => {
          const isSelected = activeTab === tab;
          const label = tab === 'ALL' ? 'ALL UPDATES' : tab === 'APPROVAL' ? 'APPROVALS' : 'ALERTS & LOGS';
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabChip, isSelected && styles.tabChipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabChipText, isSelected && styles.tabChipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── NOTIFICATIONS FEED ── */}
      {filtered.length === 0 ? (
        <EmptyState
          title="NO NOTIFICATIONS"
          subtitle="There are currently no updates in this audit category."
        />
      ) : (
        <View style={styles.listBlock}>
          {filtered.map((item) => (
            <NotificationAlertRow
              key={item.id}
              tag={item.type.replace('_', ' ')}
              isUrgent={!item.read || item.type === 'ALERT'}
              time={item.timestamp}
              body={`${item.title} — ${item.message}`}
              onPress={() => toggleItemRead(item.id)}
            />
          ))}
          <Rule thickness="hairline" />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
  },
  content: {
    paddingHorizontal: EditorialSpacing.screenHorizontal,
    paddingTop: EditorialSpacing.topSafeArea,
    paddingBottom: ms(48),
  },
  headerBox: {
    marginBottom: ms(8),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headingText: {
    fontFamily: EditorialFonts.display,
    fontSize: ms(24),
    lineHeight: ms(28),
    color: EditorialColors.ink,
    marginTop: ms(4),
  },
  subHeadingText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: ms(11),
    color: EditorialColors.muted,
    letterSpacing: 0.5,
    marginTop: ms(4),
  },
  markAllBtn: {
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingHorizontal: ms(8),
    paddingVertical: ms(4),
    backgroundColor: EditorialColors.white,
  },
  markAllText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: ms(9.5),
    color: EditorialColors.ink,
    letterSpacing: 0.5,
  },
  heroRule: {
    marginBottom: ms(20),
  },
  tabsRow: {
    flexDirection: 'row',
    marginBottom: ms(16),
  },
  tabChip: {
    paddingVertical: ms(6),
    paddingHorizontal: ms(12),
    backgroundColor: EditorialColors.white,
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    marginRight: ms(8),
  },
  tabChipActive: {
    backgroundColor: EditorialColors.ink,
  },
  tabChipText: {
    fontFamily: EditorialFonts.bold,
    fontSize: ms(11),
    letterSpacing: 0.5,
    color: EditorialColors.ink,
  },
  tabChipTextActive: {
    color: EditorialColors.white,
  },
  listBlock: {
    backgroundColor: EditorialColors.white,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    paddingHorizontal: ms(16),
    paddingBottom: ms(8),
  },
});

export default NotificationsScreen;

