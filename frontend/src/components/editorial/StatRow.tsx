import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';

export interface StatItem {
  value: string | number;
  label: string;
  isLagging?: boolean;
  isBehindPlan?: boolean;
  valueSuffix?: string;
}

export interface StatRowProps {
  stats?: StatItem[];
  columns?: StatItem[];
  style?: ViewStyle;
}

export const StatRow: React.FC<StatRowProps> = ({ stats, columns, style }) => {
  const items = stats || columns || [];

  return (
    <View style={[styles.container, style]}>
      {items.map((item, index) => {
        const isWarn = item.isLagging || item.isBehindPlan;
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            <View style={styles.column}>
              <View style={styles.valueRow}>
                <Text
                  style={[
                    styles.valueText,
                    { color: isWarn ? DayRibbonColors.warn : DayRibbonColors.ink },
                  ]}
                  numberOfLines={1}
                >
                  {item.value}
                </Text>
                {item.valueSuffix ? (
                  <Text
                    style={[
                      styles.suffixText,
                      { color: isWarn ? DayRibbonColors.warn : DayRibbonColors.muted },
                    ]}
                  >
                    {item.valueSuffix}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.labelText} numberOfLines={1}>
                {item.label.toUpperCase()}
              </Text>
            </View>
            {!isLast && <View style={styles.divider} />}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: DayRibbonShapes.borderWidth,
    borderColor: DayRibbonColors.line,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginVertical: 12,
    ...DayRibbonShapes.shadow,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  valueText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 24,
    lineHeight: 28,
  },
  suffixText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 16,
    marginLeft: 2,
  },
  labelText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 10,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: DayRibbonColors.line,
  },
});

export default StatRow;
