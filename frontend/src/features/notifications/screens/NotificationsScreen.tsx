import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Avatar, Badge, Chip, Divider, Button } from 'react-native-paper';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { ms } from '@theme/responsive';

interface NotificationItem {
  id: string;
  type: 'APPROVAL' | 'SUBMISSION' | 'EXTRA_HOURS' | 'ALERT';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: string;
  iconColor: string;
  bgColor: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    type: 'APPROVAL',
    title: 'Weekly Syllabus Plan Approved',
    message: 'Dr. Suresh Babu (HOD) approved your Week 12 Teaching Plan for Computer Networks (CS3591).',
    timestamp: '10 mins ago',
    read: false,
    icon: 'check-decagram',
    iconColor: '#10B981',
    bgColor: '#ECFDF5',
  },
  {
    id: 'notif_2',
    type: 'EXTRA_HOURS',
    title: 'Extra Hour Request Confirmed',
    message: 'Your compensatory teaching slot request for 20/07/2026 (Period 3) has been granted.',
    timestamp: '2 hours ago',
    read: false,
    icon: 'clock-check-outline',
    iconColor: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  {
    id: 'notif_3',
    type: 'SUBMISSION',
    title: 'Class CC Report Forwarded',
    message: 'Consolidated Course Coverage Report for 1st Year SEC-B has been forwarded to Principal for audit.',
    timestamp: 'Yesterday',
    read: true,
    icon: 'file-send-outline',
    iconColor: '#8B5CF6',
    bgColor: '#F5F3FF',
  },
  {
    id: 'notif_4',
    type: 'ALERT',
    title: 'Syllabus Lag Reminder',
    message: 'Week 13 deadline is approaching. Ensure Unit 4 syllabus logs are recorded before Friday 4:00 PM.',
    timestamp: '2 days ago',
    read: true,
    icon: 'alert-circle-outline',
    iconColor: '#F59E0B',
    bgColor: '#FFFBEB',
  },
];

export const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
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
      {/* Top Banner */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerTitle}>Notifications Center</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0
              ? `You have ${unreadCount} unread update${unreadCount > 1 ? 's' : ''}`
              : 'All caught up with syllabus & approvals'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {(['ALL', 'APPROVAL', 'ALERTS'] as const).map((tab) => {
          const isSelected = activeTab === tab;
          const label = tab === 'ALL' ? 'All Updates' : tab === 'APPROVAL' ? 'Approvals' : 'Alerts & Logs';
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabChip, isSelected && styles.tabChipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabChipText, isSelected && styles.tabChipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="bell-sleep-outline" size={64} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptySubtitle}>You have no updates in this category right now.</Text>
        </View>
      ) : (
        filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => toggleItemRead(item.id)}
            activeOpacity={0.85}
          >
            <Card style={[styles.card, !item.read && styles.unreadCard]}>
              <Card.Content style={styles.cardContent}>
                <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={24} color={item.iconColor} />
                </View>

                <View style={styles.textBox}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.itemTitle, !item.read && styles.itemTitleBold]}>
                      {item.title}
                    </Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.itemMessage}>{item.message}</Text>
                  <Text style={styles.timestamp}>{item.timestamp}</Text>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: ms(16),
    paddingBottom: ms(40),
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ms(16),
    marginTop: ms(4),
  },
  headerTitle: {
    fontSize: ms(20),
    fontWeight: '900',
    color: Palette.textDark,
  },
  headerSubtitle: {
    fontSize: ms(12.5),
    color: Palette.textLight,
    marginTop: ms(2),
  },
  markAllBtn: {
    paddingVertical: ms(4),
    paddingHorizontal: ms(8),
  },
  markAllText: {
    fontSize: ms(12),
    color: Palette.primary,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    marginBottom: ms(16),
  },
  tabChip: {
    paddingVertical: ms(6),
    paddingHorizontal: ms(14),
    borderRadius: ms(20),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: ms(8),
  },
  tabChipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  tabChipText: {
    fontSize: ms(12),
    fontWeight: '600',
    color: Palette.textLight,
  },
  tabChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    marginBottom: ms(12),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: Palette.primary,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: ms(14),
  },
  iconBox: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(12),
  },
  textBox: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: ms(14),
    color: Palette.textDark,
    fontWeight: '700',
    flex: 1,
  },
  itemTitleBold: {
    fontWeight: '900',
    color: '#0F172A',
  },
  unreadDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: Palette.primary,
    marginLeft: ms(6),
  },
  itemMessage: {
    fontSize: ms(12.5),
    color: '#475569',
    marginTop: ms(4),
    lineHeight: ms(18),
  },
  timestamp: {
    fontSize: ms(11),
    color: '#94A3B8',
    marginTop: ms(6),
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ms(60),
  },
  emptyTitle: {
    fontSize: ms(17),
    fontWeight: '800',
    color: Palette.textDark,
    marginTop: ms(12),
  },
  emptySubtitle: {
    fontSize: ms(13),
    color: Palette.textLight,
    marginTop: ms(4),
    textAlign: 'center',
  },
});

export default NotificationsScreen;
