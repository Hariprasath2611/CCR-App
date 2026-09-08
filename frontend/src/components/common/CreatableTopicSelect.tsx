import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { AppTextInput } from './AppTextInput';
import { SQLiteSyllabusNode } from '@database/types';
import { Palette } from '@theme/colors';
import { ms } from '@theme/responsive';

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
  label = "Topics Covered (Type topics covered)",
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<SQLiteSyllabusNode[]>([]);

  // Keep options filtered based on unit and current text value
  useEffect(() => {
    if (!unit) {
      setFilteredOptions([]);
      return;
    }

    const unitTopics = syllabusNodes.filter(
      (node) => node.unit.toLowerCase() === unit.toLowerCase()
    );

    // To allow multiple lines/topics, we check the last typed phrase
    const lines = value.split('\n');
    const lastLine = lines[lines.length - 1].trim().toLowerCase();

    // Only filter if the user is typing something in the last line, otherwise show all unit topics
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
    // If there's already text, append it intelligently (on a new line if needed)
    if (!value || value.trim() === '') {
      onChangeText(topicTitle);
    } else {
      const lines = value.split('\n');
      const lastLine = lines[lines.length - 1].trim();
      
      if (lastLine === '') {
        // Just append to the empty last line
        onChangeText(value + topicTitle);
      } else {
        // The user was typing something that matched the topic, replace the last line with the full topic
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
          setShowDropdown(true); // Open dropdown when they start typing again
        }}
        error={error}
        multiline
        numberOfLines={6}
        style={styles.input}
      />
      
      {/* Dropdown list rendered inline to push content down and avoid clipping */}
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
            scrollEnabled={false} // Since we're in a scroll view already
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
    marginTop: ms(14),
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Palette.border,
    borderBottomLeftRadius: ms(8),
    borderBottomRightRadius: ms(8),
    borderTopWidth: 0,
    marginTop: ms(-8), // Pull up slightly to attach to the input
    marginBottom: ms(16),
    overflow: 'hidden',
    elevation: 1, // subtle shadow for Android
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  dropdownTitle: {
    fontSize: ms(12),
    fontWeight: '600',
    color: Palette.textLight,
  },
  closeBtn: {
    fontSize: ms(12),
    color: Palette.primary,
    fontWeight: '700',
  },
  dropdownItem: {
    paddingVertical: ms(12),
    paddingHorizontal: ms(12),
  },
  dropdownItemText: {
    fontSize: ms(14),
    color: Palette.textDark,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});
