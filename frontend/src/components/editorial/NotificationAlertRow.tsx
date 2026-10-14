import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { EditorialColors, EditorialFonts, EditorialRules } from '@theme/editorial';

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
            isUrgent && { color: EditorialColors.accent },
          ]}
        >
          {tag.toUpperCase()}
        </Text>
        <Text style={styles.time}>{time.toUpperCase()}</Text>
      </View>
      <Text style={styles.body}>{body}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
    paddingVertical: 12,
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tag: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
  },
  time: {
    fontFamily: EditorialFonts.bold,
    fontSize: 11,
    color: EditorialColors.muted,
  },
  body: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: EditorialColors.ink,
  },
});
