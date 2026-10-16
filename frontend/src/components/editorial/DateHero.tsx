import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
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
  date = new Date(),
  style,
}) => {
  const dayStr = dayOfMonth !== undefined
    ? String(dayOfMonth)
    : String(date.getDate()).padStart(2, '0');

  const weekdayStr = weekday || date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthYearStr = monthYear || date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

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
