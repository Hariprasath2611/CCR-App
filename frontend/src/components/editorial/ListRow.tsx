import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';
import { ProgressBar } from './ProgressBar';

export interface ListRowProps {
  indexOrCode?: string;
  name: string;
  caption?: string;
  value?: string | number;
  valueSuffix?: string;
  isLagging?: boolean;
  isBehindPlan?: boolean;
  progress?: number;
  total?: number;
  showSegBar?: boolean;
  showProgressBar?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  rightElement?: React.ReactNode;
}

export const ListRow: React.FC<ListRowProps> = ({
  indexOrCode,
  name,
  caption,
  value,
  valueSuffix,
  isLagging = false,
  isBehindPlan = false,
  progress,
  total,
  showSegBar = false,
  showProgressBar = true,
  onPress,
  style,
  rightElement,
}) => {
  const isWarn = isLagging || isBehindPlan;

  const content = (
    <View style={[styles.card, style]}>
      <View style={styles.topSection}>
        <View style={styles.nameContainer}>
          {indexOrCode ? (
            <Text style={styles.codeText}>{indexOrCode}</Text>
          ) : null}
          <Text style={styles.nameText} numberOfLines={1}>
            {name}
          </Text>
          {caption ? (
            <Text style={styles.captionText} numberOfLines={1}>
              {caption}
            </Text>
          ) : null}
        </View>

        {rightElement ? (
          <View style={styles.rightSlot}>{rightElement}</View>
        ) : value !== undefined ? (
          <View style={styles.valueContainer}>
            <Text
              style={[
                styles.valueText,
                isWarn ? styles.warnValueText : styles.normalValueText,
              ]}
            >
              {value}
              {valueSuffix ? (
                <Text
                  style={[
                    styles.valueSuffix,
                    isWarn ? styles.warnValueText : styles.normalValueText,
                  ]}
                >
                  {valueSuffix}
                </Text>
              ) : null}
            </Text>
          </View>
        ) : null}
      </View>

      {(showSegBar || showProgressBar) && progress !== undefined ? (
        <View style={styles.progressWrapper}>
          <ProgressBar
            progress={progress}
            isBehindPlan={isWarn}
            height={8}
          />
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: DayRibbonShapes.borderWidth,
    borderColor: DayRibbonColors.line,
    padding: 16,
    marginBottom: 12,
    width: '100%',
    ...DayRibbonShapes.shadow,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    letterSpacing: 0.5,
    color: DayRibbonColors.cobalt,
    marginBottom: 2,
  },
  nameContainer: {
    flex: 1,
    paddingRight: 12,
  },
  nameText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    lineHeight: 22,
    color: DayRibbonColors.ink,
  },
  captionText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    marginTop: 3,
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 26,
    lineHeight: 30,
  },
  normalValueText: {
    color: DayRibbonColors.cobalt,
  },
  warnValueText: {
    color: DayRibbonColors.warn,
  },
  valueSuffix: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 16,
  },
  progressWrapper: {
    marginTop: 12,
    width: '100%',
  },
});

export default ListRow;
