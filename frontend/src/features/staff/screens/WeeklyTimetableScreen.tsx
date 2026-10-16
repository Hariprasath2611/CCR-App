import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text, StatusBar } from 'react-native';
import { TimetableRepository } from '@database/repositories/TimetableRepository';
import { SQLiteTimetableItem } from '@database/types';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StaffStackParamList } from '@navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { matchFacultyName } from '../../../utils/facultyMatcher';
import {
  DayRibbonColors,
  DayRibbonFonts,
  DayRibbonShapes,
  DayRibbonSpacing,
} from '@theme/dayRibbon';
import { EditorialChip } from '@components/editorial/EditorialChip';
import { PeriodBlock } from '@components/editorial/PeriodBlock';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const PERIOD_TIMES: Record<number, string> = {
  1: '08:30 - 09:20',
  2: '09:20 - 10:10',
  3: '10:25 - 11:15',
  4: '11:15 - 12:05',
  5: '12:45 - 01:35',
  6: '01:35 - 02:25',
  7: '02:35 - 03:25',
};

export const WeeklyTimetableScreen = () => {
  const insets = useSafeAreaInsets();
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
      const userSlots = user?.role === 'ADMIN'
        ? data
        : data.filter((s) => matchFacultyName(s.faculty_name, user?.name));
      const mySlots = (userSlots.length === 0 && data.length > 0) ? data : userSlots;
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

  const filteredSlots = slots.filter(
    (slot) => slot.day_of_week.toLowerCase() === selectedDay.toLowerCase()
  );

  const handleLogProgress = (subjectCode: string) => {
    navigation.navigate('WeeklyProgress', { subjectCode, weekNumber: 12 });
  };

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
        {/* Header Title Block */}
        <View style={styles.header}>
          <Text style={styles.captionTag}>TIMETABLE & LECTURES</Text>
          <Text style={styles.headerTitle}>Weekly Schedule</Text>
          <Text style={styles.headerSubtitle}>
            Allocated class periods, rooms, and subject teaching slots.
          </Text>
        </View>

        {/* Day Filter Chips */}
        <View style={styles.chipRow}>
          {DAYS.map((day) => (
            <EditorialChip
              key={day}
              label={day}
              selected={selectedDay === day}
              onPress={() => setSelectedDay(day)}
            />
          ))}
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>
            {selectedDay.toUpperCase()} SESSIONS
          </Text>
          <Text style={styles.sectionHeaderMeta}>{filteredSlots.length} PERIODS</Text>
        </View>

        {/* Schedule List with PeriodBlocks */}
        {loading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonBlock} />
          </View>
        ) : filteredSlots.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No lectures scheduled for {selectedDay}
            </Text>
          </View>
        ) : (
          <View style={styles.slotList}>
            {filteredSlots.map((item, index) => {
              const periodNum = item.period || index + 1;
              const timeRange = PERIOD_TIMES[periodNum] || '09:00 - 09:50';
              const isNow = index === 0;

              return (
                <PeriodBlock
                  key={item.id}
                  periodNumber={periodNum}
                  timeRange={timeRange}
                  title={item.subject_name}
                  subtitle={`${item.class_section} • ${item.subject_code}`}
                  room={item.room_no || 'TBA'}
                  state={isNow ? 'now' : 'upcoming'}
                  onPressLog={() => handleLogProgress(item.subject_code)}
                />
              );
            })}
          </View>
        )}
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
    marginBottom: 16,
  },
  captionTag: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: DayRibbonColors.ink,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
  slotList: {
    width: '100%',
  },
  skeletonContainer: {
    gap: 12,
    paddingVertical: 16,
  },
  skeletonBlock: {
    height: 72,
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 14,
    color: DayRibbonColors.muted,
  },
});

export default WeeklyTimetableScreen;
