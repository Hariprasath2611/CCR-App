import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, AppState } from 'react-native';
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

export const getCurrentWeekDays = (now: Date = new Date()): DayItem[] => {
  const currentDayIndex = now.getDay(); // 0 is Sunday, 1 is Mon, 6 is Sat
  const dayOffsetToMon = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
  const monday = new Date(now);
  monday.setDate(now.getDate() + dayOffsetToMon);

  const days: DayItem[] = [];
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 6; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);

    const isToday =
      dayDate.getDate() === now.getDate() &&
      dayDate.getMonth() === now.getMonth() &&
      dayDate.getFullYear() === now.getFullYear();

    const isPast = dayDate.getTime() < now.setHours(0, 0, 0, 0);

    days.push({
      weekday: weekdays[i],
      dayNumber: String(dayDate.getDate()),
      isToday,
      status: isToday ? 'partly' : (isPast ? 'all' : 'none'),
    });
  }

  return days;
};

export const WeekStrip: React.FC<WeekStripProps> = ({
  days: propDays,
  selectedDay,
  onSelectDay,
  style,
}) => {
  const [currentWeekDays, setCurrentWeekDays] = useState<DayItem[]>(() => propDays || getCurrentWeekDays());

  useEffect(() => {
    if (propDays) {
      setCurrentWeekDays(propDays);
      return;
    }

    const refresh = () => setCurrentWeekDays(getCurrentWeekDays());
    refresh();

    // Auto-update when app comes to foreground from background
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
      }
    });

    // Auto-update periodically to catch midnight rollover live
    const interval = setInterval(refresh, 30000);

    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [propDays]);

  const days = propDays || currentWeekDays;

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
