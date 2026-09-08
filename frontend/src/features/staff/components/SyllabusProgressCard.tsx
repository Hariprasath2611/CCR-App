import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Checkbox } from 'react-native-paper';
import { SQLiteSyllabusNode } from '@database/types';
import { Palette } from '@theme/colors';

import { ms } from '@theme/responsive';

interface SyllabusProgressCardProps {
  node: SQLiteSyllabusNode;
  onToggleStatus: (topicId: string, currentStatus: boolean) => void;
}

export const SyllabusProgressCard: React.FC<SyllabusProgressCardProps> = ({
  node,
  onToggleStatus,
}) => {
  const isCompleted = node.is_completed === 1;

  return (
    <Card style={[styles.card, isCompleted && styles.completedCard]}>
      <Card.Content style={styles.content}>
        <Checkbox.Android
          status={isCompleted ? 'checked' : 'unchecked'}
          onPress={() => onToggleStatus(node.topic_id, isCompleted)}
          color={Palette.primary}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.title, isCompleted && styles.completedTitle]}>
            {node.topic_title}
          </Text>
          <Text style={styles.subtitle}>
            Unit: {node.unit} {isCompleted && ` • Completed: ${node.completed_date}`}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderRadius: ms(8),
    marginVertical: ms(4),
    elevation: 1,
  },
  completedCard: {
    backgroundColor: Palette.secondary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ms(8),
    paddingHorizontal: ms(12),
  },
  textContainer: {
    flex: 1,
    paddingLeft: ms(8),
  },
  title: {
    fontSize: ms(15),
    fontWeight: '500',
    color: Palette.textDark,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: Palette.textLight,
  },
  subtitle: {
    fontSize: ms(12),
    color: Palette.textLight,
    marginTop: ms(2),
  },
});
