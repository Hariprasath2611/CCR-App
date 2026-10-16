import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';

export type DayLoggingStatus = 'all' | 'partly' | 'none';

export interface DayItem {
  weekday: string; // e.g. "Mon"
  dayNumber: number | string;
  status?: DayLoggingStatus;
  isToday?: boolean;
  dateKey?: string;
}

export interface WeekStripProps {
  days?: DayItem[];
  selectedDay?: string;
  onSelectDay?: (day: DayItem) => void;
  style?: ViewStyle;
}

const DEFAULT_DAYS: DayItem[] = [
  { weekday: 'Mon', dayNumber: '12', status: 'all' },
  { weekday: 'Tue', dayNumber: '13', status: 'all' },
  { weekday: 'Wed', dayNumber: '14', status: 'partly', isToday: true },
  { weekday: 'Thu', dayNumber: '15', status: 'none' },
  { weekday: 'Fri', dayNumber: '16', status: 'none' },
  { weekday: 'Sat', dayNumber: '17', status: 'none' },
];

export const WeekStrip: React.FC<WeekStripProps> = ({
  days = DEFAULT_DAYS,
  selectedDay,
  onSelectDay,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {days.map((item, index) => {
        const isSelected = selectedDay
          ? selectedDay.toLowerCase() === item.weekday.toLowerCase()
          : item.isToday;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayColumn,
              item.isToday && styles.todayColumn,
              isSelected && !item.isToday && styles.selectedColumn,
            ]}
            onPress={() => onSelectDay && onSelectDay(item)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.weekdayText,
                (item.isToday || isSelected) && styles.activeWeekdayText,
              ]}
            >
              {item.weekday.toUpperCase()}
            </Text>
            <Text
              style={[
                styles.dayNumberText,
                (item.isToday || isSelected) && styles.activeDayNumberText,
              ]}
            >
              {item.dayNumber}
            </Text>

            {/* Status dot */}
            <View style={styles.dotContainer}>
              {item.status === 'all' ? (
                <View style={styles.dotFilled} />
              ) : item.status === 'partly' ? (
                <View style={styles.dotHalfContainer}>
                  <View style={styles.dotHalfLeft} />
                  <View style={styles.dotHalfRight} />
                </View>
              ) : (
                <View style={styles.dotEmpty} />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: DayRibbonShapes.borderWidth,
    borderColor: DayRibbonColors.line,
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginBottom: 16,
    ...DayRibbonShapes.shadow,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 14,
    marginHorizontal: 2,
  },
  todayColumn: {
    backgroundColor: DayRibbonColors.lemon,
  },
  selectedColumn: {
    backgroundColor: DayRibbonColors.bg,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  weekdayText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    marginBottom: 4,
  },
  activeWeekdayText: {
    color: DayRibbonColors.ink,
  },
  dayNumberText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 16,
    color: DayRibbonColors.ink,
    marginBottom: 6,
  },
  activeDayNumberText: {
    color: DayRibbonColors.ink,
  },
  dotContainer: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFilled: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DayRibbonColors.cobalt,
  },
  dotHalfContainer: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: DayRibbonColors.cobalt,
  },
  dotHalfLeft: {
    flex: 1,
    backgroundColor: DayRibbonColors.cobalt,
  },
  dotHalfRight: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dotEmpty: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: DayRibbonColors.dashed,
    backgroundColor: 'transparent',
  },
});

export default WeekStrip;
