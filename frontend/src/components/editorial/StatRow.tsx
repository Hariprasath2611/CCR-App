import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { EditorialColors, EditorialFonts, EditorialRules } from '@theme/editorial';

export interface StatItem {
  value: string | number;
  label: string;
  isLagging?: boolean;
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
        const isLast = index === items.length - 1;
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
    paddingVertical: 14,
    borderTopWidth: EditorialRules.hairline,
    borderBottomWidth: EditorialRules.hairline,
    borderColor: EditorialColors.ink,
    marginVertical: 12,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontFamily: EditorialFonts.display,
    fontSize: 24,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  suffixText: {
    fontFamily: EditorialFonts.display,
    fontSize: 16,
    color: EditorialColors.accent,
  },
  labelText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 10,
    letterSpacing: 1.5,
    color: EditorialColors.muted,
  },
  divider: {
    width: EditorialRules.hairline,
    height: 32,
    backgroundColor: EditorialColors.track,
  },
});

export default StatRow;
