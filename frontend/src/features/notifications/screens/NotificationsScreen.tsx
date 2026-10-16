import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
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
    timestamp: '10 mins ago',
    read: false,
  },
  {
    id: 'notif_2',
    type: 'EXTRA_HOURS',
    title: 'Extra Hour Request Confirmed',
    message: 'Your compensatory teaching slot request for 20/07/2026 (Period 3) has been granted.',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 'notif_3',
    type: 'SUBMISSION',
    title: 'Class CC Report Forwarded',
    message: 'Consolidated Course Coverage Report for 1st Year SEC-B has been forwarded to Principal for audit.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'notif_4',
    type: 'ALERT',
    title: 'Syllabus Lag Reminder',
    message: 'Week 13 deadline is approaching. Ensure Unit 4 syllabus logs are recorded before Friday 4:00 PM.',
    timestamp: '2 days ago',
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
          <Text style={styles.captionText}>COMMUNICATION LOG</Text>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              style={styles.markAllBtn}
              accessibilityLabel="Mark all notifications as read"
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.headingText}>Notifications</Text>
        <Text style={styles.subHeadingText}>
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''} in system audit log`
            : 'All caught up · Zero unread system notifications'}
        </Text>
      </View>

      {/* ── FILTER TABS ── */}
      <View style={styles.tabsRow}>
        {(['ALL', 'APPROVAL', 'ALERTS'] as const).map((tab) => {
          const isSelected = activeTab === tab;
          const label = tab === 'ALL' ? 'All Updates' : tab === 'APPROVAL' ? 'Approvals' : 'Alerts & Logs';
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
          title="No Notifications"
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
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  content: {
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
    paddingTop: DayRibbonSpacing.screenTop,
    paddingBottom: ms(48),
  },
  headerBox: {
    marginBottom: ms(16),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  captionText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headingText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(26),
    color: DayRibbonColors.ink,
    marginTop: ms(4),
  },
  subHeadingText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    color: DayRibbonColors.muted,
    marginTop: ms(4),
  },
  markAllBtn: {
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusChip,
    paddingHorizontal: ms(12),
    paddingVertical: ms(6),
    backgroundColor: DayRibbonColors.surface,
  },
  markAllText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(11),
    color: DayRibbonColors.cobalt,
  },
  tabsRow: {
    flexDirection: 'row',
    marginBottom: ms(16),
    gap: ms(8),
  },
  tabChip: {
    paddingVertical: ms(8),
    paddingHorizontal: ms(14),
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusChip,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabChipActive: {
    backgroundColor: DayRibbonColors.ink,
    borderColor: DayRibbonColors.ink,
  },
  tabChipText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(11),
    color: DayRibbonColors.ink,
  },
  tabChipTextActive: {
    color: DayRibbonColors.surface,
  },
  listBlock: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.radiusCard,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    paddingHorizontal: ms(16),
    paddingBottom: ms(8),
  },
});

export default NotificationsScreen;
