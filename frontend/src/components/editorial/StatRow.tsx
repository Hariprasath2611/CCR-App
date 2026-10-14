import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { EditorialColors, EditorialFonts, EditorialRules } from '@theme/editorial';

export interface StatItem {
  value: string | number;
  label: string;
  isLagging?: boolean;
  valueSuffix?: string;
}

interface StatRowProps {
  stats: StatItem[];
  style?: ViewStyle;
}

export const StatRow: React.FC<StatRowProps> = ({ stats, style }) => {
  return (
    <View style={[styles.container, style]}>
      {stats.map((item, index) => {
        const isLast = index === stats.length - 1;
        return (
          <React.Fragment key={index}>
            <View style={styles.column}>
              <Text
                style={[
                  styles.valueText,
                  item.isLagging && { color: EditorialColors.accent },
                ]}
                numberOfLines={1}
              >
                {item.value}
                {item.valueSuffix ? (
                  <Text
                    style={[
                      styles.suffixText,
                      item.isLagging && { color: EditorialColors.accent },
                    ]}
                  >
                    {item.valueSuffix}
                  </Text>
                ) : null}
              </Text>
              <Text style={styles.labelText} numberOfLines={1}>
                {item.label.toUpperCase()}
              </Text>
            </View>
            {!isLast && <View style={styles.verticalDivider} />}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: EditorialRules.heavy, // 4px ink top border
    borderTopColor: EditorialColors.ink,
    borderBottomWidth: EditorialRules.hairline, // 1px ink bottom border for container clarity
    borderBottomColor: EditorialColors.ink,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  verticalDivider: {
    width: EditorialRules.hairline, // 1px ink vertical
    height: 38,
    backgroundColor: EditorialColors.ink,
  },
  valueText: {
    fontFamily: EditorialFonts.display,
    fontSize: 30,
    lineHeight: 32,
    color: EditorialColors.ink,
    letterSpacing: -0.5,
  },
  suffixText: {
    fontFamily: EditorialFonts.display,
    fontSize: 16,
    color: EditorialColors.accent,
  },
  labelText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
});
