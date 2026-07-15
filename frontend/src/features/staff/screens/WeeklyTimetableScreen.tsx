import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { TimetableRepository } from '@database/repositories/TimetableRepository';
import { SQLiteTimetableItem } from '@database/types';
import { Palette } from '@theme/colors';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StaffStackParamList } from '@navigation/types';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const WeeklyTimetableScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const { user } = useAuthStore();
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [slots, setSlots] = useState<SQLiteTimetableItem[]>([]);
  const [loading, setLoading] = useState(true);

  const timetableRepo = new TimetableRepository();

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const data = await timetableRepo.getTimetable();
      const mySlots = user?.role === 'ADMIN' ? data : data.filter((s) => s.faculty_name === user?.name);
      setSlots(mySlots);
    } catch (err) {
      console.error('Failed to load timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimetable();
  }, []);

  const filteredSlots = slots.filter((slot) => slot.day_of_week.toLowerCase() === selectedDay.toLowerCase());

  const handleLogProgress = (subjectCode: string) => {
    navigation.navigate('WeeklyProgress', { subjectCode, weekNumber: 12 });
  };

  return (
    <View style={styles.container}>
      {/* Horizontal Day Selector tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {DAYS.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main schedule logs */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Palette.primary} />
          <Text style={styles.loadingText}>Loading Timetable...</Text>
        </View>
      ) : filteredSlots.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={64} color={Palette.textLight} />
          <Text style={styles.emptyTitle}>No Classes Scheduled</Text>
          <Text style={styles.emptySubtitle}>You have no lectures scheduled for {selectedDay}.</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.scheduleHeader}>Academic Schedule: {selectedDay}</Text>
          {filteredSlots.map((item) => (
            <Card key={item.id} style={styles.card}>
              <Card.Content style={styles.cardContent}>
                {/* Period circle badge */}
                <View style={styles.periodCol}>
                  <Text style={styles.periodNum}>{item.period}</Text>
                  <Text style={styles.periodLabel}>Period</Text>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Class details */}
                <View style={styles.infoCol}>
                  <View style={styles.subjectRow}>
                    <Text style={styles.subjectCode}>{item.subject_code}</Text>
                    <View style={styles.classBadge}>
                      <Text style={styles.classBadgeText}>{item.class_section}</Text>
                    </View>
                  </View>
                  <Text style={styles.subjectName} numberOfLines={1}>
                    {item.subject_name}
                  </Text>
                  <View style={styles.roomRow}>
                    <Feather name="map-pin" size={12} color={Palette.textLight} />
                    <Text style={styles.roomText}>Lecture Hall: {item.room_no}</Text>
                  </View>
                </View>

                {/* Action button */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLogProgress(item.subject_code)}
                  activeOpacity={0.7}
                >
                  <Feather name="plus-circle" size={24} color={Palette.primary} />
                  <Text style={styles.actionBtnLabel}>Log</Text>
                </TouchableOpacity>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
    paddingVertical: 12,
  },
  tabScrollContent: {
    paddingHorizontal: 12,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabButtonActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  tabText: {
    fontSize: 13,
    color: Palette.textLight,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Palette.textLight,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.textDark,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Palette.textLight,
    textAlign: 'center',
    marginTop: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  scheduleHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  periodCol: {
    alignItems: 'center',
    width: 48,
  },
  periodNum: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.primary,
  },
  periodLabel: {
    fontSize: 10,
    color: Palette.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  divider: {
    height: 40,
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  infoCol: {
    flex: 1,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  subjectCode: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.primary,
    marginRight: 6,
  },
  classBadge: {
    backgroundColor: 'rgba(15, 82, 186, 0.08)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  classBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Palette.primary,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.textDark,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  roomText: {
    fontSize: 11,
    color: Palette.textLight,
    marginLeft: 4,
    fontWeight: '500',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 12,
  },
  actionBtnLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.primary,
    marginTop: 2,
  },
});

export default WeeklyTimetableScreen;
