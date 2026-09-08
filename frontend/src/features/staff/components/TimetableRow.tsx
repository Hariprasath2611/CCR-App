import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { SQLiteTimetableItem } from '@database/types';
import { Palette } from '@theme/colors';

import { ms } from '@theme/responsive';

interface TimetableRowProps {
  item: SQLiteTimetableItem;
  onPressLogProgress: () => void;
}

export const TimetableRow: React.FC<TimetableRowProps> = ({ item, onPressLogProgress }) => {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.leftCol}>
          <Text style={styles.period}>Period {item.period}</Text>
          <Text style={styles.subjectCode}>{item.subject_code}</Text>
        </View>
        
        <View style={styles.midCol}>
          <Text style={styles.subjectName} numberOfLines={1}>{item.subject_name}</Text>
          <Text style={styles.detail}>
            Section: {item.class_section}  •  Room: {item.room_no}
          </Text>
        </View>

        <IconButton
          icon="plus-circle-outline"
          iconColor={Palette.primary}
          size={24}
          onPress={onPressLogProgress}
        />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderRadius: ms(8),
    marginVertical: ms(6),
    borderLeftWidth: 4,
    borderLeftColor: Palette.accent,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ms(12),
  },
  leftCol: {
    width: ms(80),
    borderRightWidth: 1,
    borderRightColor: Palette.secondary,
    paddingRight: ms(8),
  },
  period: {
    fontSize: ms(12),
    color: Palette.textLight,
    fontWeight: '500',
  },
  subjectCode: {
    fontSize: ms(15),
    fontWeight: 'bold',
    color: Palette.primary,
    marginTop: ms(2),
  },
  midCol: {
    flex: 1,
    paddingHorizontal: ms(12),
  },
  subjectName: {
    fontSize: ms(16),
    fontWeight: '600',
    color: Palette.textDark,
  },
  detail: {
    fontSize: ms(12),
    color: Palette.textLight,
    marginTop: ms(2),
  },
});
