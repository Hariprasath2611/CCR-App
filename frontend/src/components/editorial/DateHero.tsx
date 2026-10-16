import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, AppState } from 'react-native';
import { DayRibbonColors, DayRibbonFonts } from '@theme/dayRibbon';

export interface DateHeroProps {
  dayOfMonth?: number | string;
  weekday?: string;
  monthYear?: string;
  date?: Date;
  style?: ViewStyle;
}

export const DateHero: React.FC<DateHeroProps> = ({
  dayOfMonth,
  weekday,
  monthYear,
  date: propDate,
  style,
}) => {
  const [currentDate, setCurrentDate] = useState(() => propDate || new Date());

  useEffect(() => {
    if (propDate) {
      setCurrentDate(propDate);
      return;
    }

    const refresh = () => setCurrentDate(new Date());
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
  }, [propDate]);

  const activeDate = propDate || currentDate;

  const dayStr = dayOfMonth !== undefined
    ? String(dayOfMonth)
    : String(activeDate.getDate()).padStart(2, '0');

  const weekdayStr = weekday || activeDate.toLocaleDateString('en-US', { weekday: 'long' });
  const monthYearStr = monthYear || activeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.numeral}>{dayStr}</Text>
      <View style={styles.labelCol}>
        <Text style={styles.weekdayText}>{weekdayStr}</Text>
        <Text style={styles.monthYearText}>{monthYearStr}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  numeral: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 72,
    lineHeight: 76,
    color: DayRibbonColors.cobalt,
    marginRight: 14,
  },
  labelCol: {
    justifyContent: 'center',
  },
  weekdayText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    lineHeight: 20,
    color: DayRibbonColors.ink,
  },
  monthYearText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 14,
    lineHeight: 18,
    color: DayRibbonColors.muted,
  },
});

export default DateHero;
