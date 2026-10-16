import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';

export type PeriodState = 'done' | 'now' | 'free' | 'upcoming';

export interface PeriodBlockProps {
  periodNumber: number | string;
  timeRange: string;
  title: string;
  subtitle?: string;
  room?: string;
  state?: PeriodState;
  onPressLog?: () => void;
  onPressCard?: () => void;
  style?: ViewStyle;
}

export const PeriodBlock: React.FC<PeriodBlockProps> = ({
  periodNumber,
  timeRange,
  title,
  subtitle,
  room,
  state = 'upcoming',
  onPressLog,
  onPressCard,
  style,
}) => {
  const isDone = state === 'done';
  const isNow = state === 'now';
  const isFree = state === 'free';
  const isUpcoming = state === 'upcoming';

  const cardStyle = [
    styles.blockCard,
    isDone && styles.doneCard,
    isNow && styles.nowCard,
    isFree && styles.freeCard,
    isUpcoming && styles.upcomingCard,
  ];

  return (
    <View style={[styles.container, style]}>
      {/* Left Time Column */}
      <View style={styles.leftCol}>
        <Text
          style={[
            styles.periodNumeral,
            isDone && { color: DayRibbonColors.cobalt },
            isNow && { color: DayRibbonColors.ink },
            isFree && { color: DayRibbonColors.dashed },
          ]}
        >
          {String(periodNumber).padStart(2, '0')}
        </Text>
        <Text style={styles.timeCaption} numberOfLines={1}>
          {timeRange}
        </Text>
      </View>

      {/* Right Block */}
      <TouchableOpacity
        style={cardStyle}
        activeOpacity={onPressCard || onPressLog ? 0.75 : 1}
        onPress={onPressCard || onPressLog}
        disabled={!onPressCard && !onPressLog}
      >
        <View style={styles.topInfoRow}>
          <View style={styles.titleArea}>
            <Text
              style={[
                styles.titleText,
                isDone && styles.doneText,
                isFree && styles.freeTitleText,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={[
                  styles.subtitleText,
                  isDone && styles.doneSubtitleText,
                  isFree && styles.freeSubtitleText,
                ]}
                numberOfLines={1}
              >
                {subtitle}
                {room ? ` • Hall: ${room}` : ''}
              </Text>
            ) : null}
          </View>

          {/* Right badge / indicator */}
          {isDone ? (
            <View style={styles.loggedBadge}>
              <Text style={styles.loggedBadgeText}>LOGGED</Text>
            </View>
          ) : isUpcoming && room ? (
            <View style={styles.roomBadge}>
              <Text style={styles.roomBadgeText}>{room}</Text>
            </View>
          ) : null}
        </View>

        {/* If state == 'now', show the signature single call to action */}
        {isNow && (
          <TouchableOpacity
            style={styles.nowActionButton}
            onPress={onPressLog}
            activeOpacity={0.85}
          >
            <Text style={styles.nowActionText}>Log this class</Text>
            <Feather name="arrow-right" size={16} color={DayRibbonColors.white} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 14,
  },
  leftCol: {
    width: 68,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingRight: 10,
  },
  periodNumeral: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 34,
    lineHeight: 38,
    color: DayRibbonColors.ink,
  },
  timeCaption: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    marginTop: 2,
  },
  blockCard: {
    flex: 1,
    borderRadius: DayRibbonShapes.cardRadius,
    padding: 16,
    justifyContent: 'center',
  },
  doneCard: {
    backgroundColor: DayRibbonColors.cobalt,
    ...DayRibbonShapes.shadow,
  },
  nowCard: {
    backgroundColor: DayRibbonColors.lemon,
    paddingVertical: 18,
    ...DayRibbonShapes.shadow,
  },
  freeCard: {
    backgroundColor: 'transparent',
    borderWidth: DayRibbonShapes.dashedBorderWidth,
    borderColor: DayRibbonColors.dashed,
    borderStyle: 'dashed',
  },
  upcomingCard: {
    backgroundColor: DayRibbonColors.surface,
    borderWidth: DayRibbonShapes.borderWidth,
    borderColor: DayRibbonColors.line,
    ...DayRibbonShapes.shadow,
  },
  topInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleArea: {
    flex: 1,
    marginRight: 10,
  },
  titleText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    lineHeight: 22,
    color: DayRibbonColors.ink,
  },
  doneText: {
    color: DayRibbonColors.white,
  },
  freeTitleText: {
    color: DayRibbonColors.muted,
  },
  subtitleText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    lineHeight: 18,
    color: DayRibbonColors.muted,
    marginTop: 2,
  },
  doneSubtitleText: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  freeSubtitleText: {
    color: DayRibbonColors.mutedSoft,
  },
  loggedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  loggedBadgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 10,
    letterSpacing: 1,
    color: DayRibbonColors.white,
  },
  roomBadge: {
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: DayRibbonColors.bg,
  },
  roomBadgeText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    color: DayRibbonColors.muted,
  },
  nowActionButton: {
    height: 42,
    backgroundColor: DayRibbonColors.ink,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  nowActionText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    color: DayRibbonColors.white,
    letterSpacing: 0.5,
  },
});

export default PeriodBlock;
