import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar } from 'react-native';
import { TimetableRepository } from '@database/repositories/TimetableRepository';
import { SQLiteTimetableItem } from '@database/types';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StaffStackParamList } from '@navigation/types';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { matchFacultyName } from '../../../utils/facultyMatcher';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { EditorialChip } from '@components/editorial/EditorialChip';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

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

  const filteredSlots = slots.filter((slot) => slot.day_of_week.toLowerCase() === selectedDay.toLowerCase());

  const handleLogProgress = (subjectCode: string) => {
    navigation.navigate('WeeklyProgress', { subjectCode, weekNumber: 12 });
  };

  return (
    <View style={styles.screenWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor={EditorialColors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, EditorialSpacing.topSafeArea),
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Label text="TIMETABLE & LECTURES" />
          <Text style={styles.headerTitle}>
            WEEKLY SCHEDULE<Text style={styles.accentDot}>.</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Allocated class periods, rooms, and subject teaching slots.
          </Text>
        </View>

        {/* 4px Heavy Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* Day Filter Chips */}
        <View style={styles.chipRow}>
          {DAYS.map((day) => (
            <EditorialChip
              key={day}
              label={day.toUpperCase()}
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
          <Label text={`${filteredSlots.length} PERIODS`} />
        </View>

        {/* Schedule List */}
        {loading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonBlock} />
          </View>
        ) : filteredSlots.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Label text={`NO LECTURES SCHEDULED FOR ${selectedDay.toUpperCase()}`} />
          </View>
        ) : (
          <View style={styles.slotList}>
            {filteredSlots.map((item) => (
              <View key={item.id} style={styles.slotRow}>
                {/* Period Column */}
                <View style={styles.periodCol}>
                  <Text style={styles.periodNum}>{item.period}</Text>
                  <Label text="PERIOD" />
                </View>

                {/* Vertical Divider */}
                <View style={styles.vertDivider} />

                {/* Class Details */}
                <View style={styles.infoCol}>
                  <View style={styles.metaRow}>
                    <Text style={styles.subjectCode}>{item.subject_code}</Text>
                    <View style={styles.sectionBadge}>
                      <Text style={styles.sectionBadgeText}>{item.class_section}</Text>
                    </View>
                  </View>
                  <Text style={styles.subjectName} numberOfLines={1}>
                    {item.subject_name}
                  </Text>
                  <Label text={`HALL: ${item.room_no || 'TBA'}`} style={styles.roomMeta} />
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={styles.logButton}
                  onPress={() => handleLogProgress(item.subject_code)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.logButtonText}>LOG</Text>
                  <Feather name="chevron-right" size={14} color={EditorialColors.ink} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
  },
  content: {
    paddingHorizontal: EditorialSpacing.screenHorizontal,
  },
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: EditorialFonts.display,
    fontSize: 36,
    lineHeight: 40,
    color: EditorialColors.ink,
    letterSpacing: -0.5,
    marginTop: 4,
    marginBottom: 4,
  },
  accentDot: {
    color: EditorialColors.accent,
  },
  headerSubtitle: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    color: EditorialColors.muted,
    lineHeight: 18,
  },
  heavySpacer: {
    marginVertical: 18,
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
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.ink,
  },
  slotList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
  },
  slotRow: {
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.ink,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodCol: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodNum: {
    fontFamily: EditorialFonts.display,
    fontSize: 28,
    lineHeight: 32,
    color: EditorialColors.ink,
    marginBottom: 2,
  },
  vertDivider: {
    width: 1,
    height: 48,
    backgroundColor: EditorialColors.ink,
    marginHorizontal: 12,
  },
  infoCol: {
    flex: 1,
    marginRight: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  subjectCode: {
    fontFamily: EditorialFonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    color: EditorialColors.muted,
  },
  sectionBadge: {
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  sectionBadgeText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 10,
    color: EditorialColors.ink,
  },
  subjectName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 15,
    lineHeight: 20,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  roomMeta: {
    letterSpacing: 1.5,
  },
  logButton: {
    height: 38,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  logButtonText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
  },
  skeletonContainer: {
    gap: 12,
    paddingVertical: 16,
  },
  skeletonBlock: {
    height: 72,
    backgroundColor: EditorialColors.track,
  },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: 'center',
  },
});
