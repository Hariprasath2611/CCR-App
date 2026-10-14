import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { EditorialColors, EditorialRules } from '@theme/editorial';

interface RuleProps {
  thick?: boolean;
  color?: string;
  style?: ViewStyle;
}

export const Rule: React.FC<RuleProps> = ({ thick = false, color = EditorialColors.ink, style }) => {
  return (
    <View
      style={[
        styles.rule,
        {
          height: thick ? EditorialRules.heavy : EditorialRules.hairline,
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
