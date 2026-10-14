import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Text } from 'react-native';
import { Portal, Dialog } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { EditorialColors, EditorialFonts, EditorialRules } from '@theme/editorial';

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
  const hasError = !!error;

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={[styles.label, hasError && styles.labelError]}>
          {label.toUpperCase()}
        </Text>
      ) : null}

      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        style={[styles.inputRow, hasError ? styles.inputRowError : styles.inputRowNormal]}
      >
        <Text
          style={[
            styles.valueText,
            !value && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedLabel}
        </Text>
        <Feather name="chevron-down" size={18} color={EditorialColors.ink} />
      </TouchableOpacity>

      {hasError ? <Text style={styles.errorText}>{error.toUpperCase()}</Text> : null}

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>{label.toUpperCase()}</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      onSelect(option.value);
                      setVisible(false);
                    }}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.squareRadio, isSelected && styles.squareRadioSelected]}>
                      {isSelected ? <View style={styles.squareRadioInner} /> : null}
                    </View>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 18,
  },
  label: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  labelError: {
    color: EditorialColors.accent,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    paddingBottom: 8,
    paddingTop: 4,
  },
  inputRowNormal: {
    borderBottomColor: EditorialColors.ink,
  },
  inputRowError: {
    borderBottomColor: EditorialColors.accent,
  },
  valueText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 16,
    color: EditorialColors.ink,
    flex: 1,
  },
  placeholderText: {
    color: EditorialColors.muted,
  },
  errorText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1,
    color: EditorialColors.accent,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  dialog: {
    backgroundColor: EditorialColors.bg,
    borderRadius: 0,
    borderWidth: EditorialRules.borderWidth,
    borderColor: EditorialColors.ink,
    maxHeight: '80%',
  },
  dialogTitle: {
    fontFamily: EditorialFonts.display,
    fontSize: 18,
    color: EditorialColors.ink,
    letterSpacing: -0.3,
  },
  dialogContent: {
    paddingHorizontal: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.track,
  },
  optionRowSelected: {
    backgroundColor: EditorialColors.white,
  },
  squareRadio: {
    width: 18,
    height: 18,
    borderWidth: EditorialRules.borderWidth,
    borderColor: EditorialColors.ink,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  squareRadioSelected: {
    backgroundColor: EditorialColors.ink,
  },
  squareRadioInner: {
    width: 6,
    height: 6,
    backgroundColor: EditorialColors.white,
  },
  optionLabel: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 15,
    color: EditorialColors.ink,
    flex: 1,
  },
  optionLabelSelected: {
    fontFamily: EditorialFonts.heavy,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 2,
    color: EditorialColors.muted,
  },
});
