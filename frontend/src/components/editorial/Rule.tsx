import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { EditorialColors, EditorialRules } from '@theme/editorial';

interface RuleProps {
  thick?: boolean;
  thickness?: 'hairline' | 'heavy' | 'divider' | 'section' | number;
  color?: string;
  style?: ViewStyle;
}

export const Rule: React.FC<RuleProps> = ({ thick = false, thickness, color = EditorialColors.ink, style }) => {
  let ruleHeight: number = thick ? EditorialRules.heavy : EditorialRules.hairline;
  if (thickness === 'heavy' || thickness === 'section') {
    ruleHeight = EditorialRules.heavy;
  } else if (thickness === 'hairline' || thickness === 'divider') {
    ruleHeight = EditorialRules.hairline;
  } else if (typeof thickness === 'number') {
    ruleHeight = thickness;
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
});
