import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { DayRibbonColors } from '@theme/dayRibbon';

interface RuleProps {
  thick?: boolean;
  thickness?: 'hairline' | 'heavy' | 'divider' | 'section' | number;
  color?: string;
  dashed?: boolean;
  style?: ViewStyle;
}

export const Rule: React.FC<RuleProps> = ({
  thick = false,
  thickness,
  color = DayRibbonColors.line,
  dashed = false,
  style,
}) => {
  let ruleHeight = 1;
  if (thickness === 'heavy' || thickness === 'section') {
    ruleHeight = 2;
  } else if (thickness === 'hairline' || thickness === 'divider') {
    ruleHeight = 1;
  } else if (typeof thickness === 'number') {
    ruleHeight = thickness;
  } else if (thick) {
    ruleHeight = 2;
  }

  if (dashed) {
    return (
      <View
        style={[
          styles.dashedRule,
          {
            borderColor: color === DayRibbonColors.line ? DayRibbonColors.dashed : color,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.rule,
        {
          height: ruleHeight,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  rule: {
    width: '100%',
  },
  dashedRule: {
    width: '100%',
    borderBottomWidth: 2,
    borderStyle: 'dashed',
  },
});

export default Rule;
