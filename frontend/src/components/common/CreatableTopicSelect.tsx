import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { AppTextInput } from './AppTextInput';
import { SQLiteSyllabusNode } from '@database/types';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';

interface CreatableTopicSelectProps {
  unit: string;
  syllabusNodes: SQLiteSyllabusNode[];
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  label?: string;
}

export const CreatableTopicSelect: React.FC<CreatableTopicSelectProps> = ({
  unit,
  syllabusNodes,
  value,
  onChangeText,
  error,
  label = 'Topics Covered (Type topics covered)',
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<SQLiteSyllabusNode[]>([]);

  useEffect(() => {
    if (!unit) {
      setFilteredOptions([]);
      return;
    }

    const unitTopics = syllabusNodes.filter(
      (node) => node.unit.toLowerCase() === unit.toLowerCase()
    );

    const lines = value.split('\n');
    const lastLine = lines[lines.length - 1].trim().toLowerCase();

    if (lastLine.length > 0) {
      const filtered = unitTopics.filter((node) =>
        node.topic_title.toLowerCase().includes(lastLine)
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(unitTopics);
    }
  }, [unit, syllabusNodes, value]);

  const handleSelectTopic = (topicTitle: string) => {
    if (!value || value.trim() === '') {
      onChangeText(topicTitle);
    } else {
      const lines = value.split('\n');
      const lastLine = lines[lines.length - 1].trim();

      if (lastLine === '') {
        onChangeText(value + topicTitle);
      } else {
        lines[lines.length - 1] = topicTitle;
        onChangeText(lines.join('\n'));
      }
    }
    setShowDropdown(false);
  };

  return (
    <View style={styles.container}>
      <AppTextInput
        label={label}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setShowDropdown(true);
        }}
        error={error}
        multiline
        numberOfLines={4}
        style={styles.input}
      />

      {showDropdown && filteredOptions.length > 0 && (
        <View style={styles.dropdownContainer}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>Suggested Topics from {unit}</Text>
            <TouchableOpacity onPress={() => setShowDropdown(false)}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.topic_id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleSelectTopic(item.topic_title)}
              >
                <Text style={styles.dropdownItemText}>{item.topic_title}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  input: {
    marginTop: 6,
  },
  dropdownContainer: {
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: 14,
    marginTop: -8,
    marginBottom: 16,
    overflow: 'hidden',
    ...DayRibbonShapes.shadow,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: DayRibbonColors.bg,
    borderBottomWidth: 1,
    borderBottomColor: DayRibbonColors.line,
  },
  dropdownTitle: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  closeBtn: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.cobalt,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dropdownItemText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 14,
    color: DayRibbonColors.ink,
  },
  separator: {
    height: 1,
    backgroundColor: DayRibbonColors.line,
  },
});

export default CreatableTopicSelect;
