import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { TextInput, Portal, Dialog, RadioButton, Text, Button } from 'react-native-paper';
import { Palette } from '@theme/colors';

import { ms } from '@theme/responsive';

interface DropdownOption {
  label: string;
  value: string;
}

interface AppDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  error?: string;
  style?: any;
}

export const AppDropdown: React.FC<AppDropdownProps> = ({
  label,
  value,
  options,
  onSelect,
  error,
  style,
}) => {
  const [visible, setVisible] = useState(false);
  const selectedLabel = options.find((opt) => opt.value === value)?.label || 'Select option';

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={() => setVisible(true)} activeOpacity={0.7}>
        <View pointerEvents="none">
          <TextInput
            label={label}
            value={selectedLabel}
            mode="outlined"
            error={!!error}
            right={<TextInput.Icon icon="chevron-down" />}
            outlineColor={Palette.border}
            activeOutlineColor={Palette.primary}
            style={styles.input}
          />
        </View>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.title}>Select {label}</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <ScrollView>
              <RadioButton.Group
                onValueChange={(val) => {
                  onSelect(val);
                  setVisible(false);
                }}
                value={value}
              >
                {options.map((option) => (
                  <View key={option.value} style={styles.optionRow}>
                    <RadioButton.Android value={option.value} color={Palette.primary} />
                    <TouchableOpacity
                      onPress={() => {
                        onSelect(option.value);
                        setVisible(false);
                      }}
                      style={styles.labelTouch}
                    >
                      <Text style={styles.optionLabel}>{option.label}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </RadioButton.Group>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)} textColor={Palette.primary}>
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: ms(8),
  },
  input: {
    backgroundColor: Palette.surface,
  },
  errorText: {
    color: Palette.error,
    fontSize: ms(12),
    marginTop: ms(4),
    paddingLeft: ms(4),
  },
  dialog: {
    backgroundColor: Palette.surface,
    borderRadius: ms(12),
    maxHeight: '80%',
  },
  title: {
    color: Palette.textDark,
  },
  dialogContent: {
    paddingHorizontal: ms(10),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ms(8),
    borderBottomWidth: 1,
    borderBottomColor: Palette.secondary,
  },
  labelTouch: {
    flex: 1,
    paddingLeft: ms(12),
  },
  optionLabel: {
    fontSize: ms(16),
    color: Palette.textDark,
  },
});
