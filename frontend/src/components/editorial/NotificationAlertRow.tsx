import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { DayRibbonColors, DayRibbonFonts } from '@theme/dayRibbon';

interface NotificationAlertRowProps {
  tag: string;
  isUrgent?: boolean;
  time: string;
  body: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const NotificationAlertRow: React.FC<NotificationAlertRowProps> = ({
  tag,
  isUrgent = false,
  time,
  body,
  onPress,
  style,
}) => {
  const content = (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        <Text
          style={[
            styles.tag,
            { color: isUrgent ? DayRibbonColors.warn : DayRibbonColors.cobalt },
          ]}
        >
          {tag.toUpperCase()}
        </Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      <Text style={styles.body}>{body}</Text>
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
  container: {
    borderBottomWidth: 1,
    borderBottomColor: DayRibbonColors.line,
    paddingVertical: 14,
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tag: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  time: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  body: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 14,
    lineHeight: 20,
    color: DayRibbonColors.ink,
  },
});

export default NotificationAlertRow;
