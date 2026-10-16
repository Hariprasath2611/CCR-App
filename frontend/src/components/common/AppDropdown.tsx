import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Text } from 'react-native';
import { Portal, Dialog } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';

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
        style={[styles.inputRow, hasError && styles.inputRowError]}
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
        <Feather name="chevron-down" size={18} color={DayRibbonColors.muted} />
      </TouchableOpacity>

      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>{label}</Dialog.Title>
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
                    <View style={[styles.circleRadio, isSelected && styles.circleRadioSelected]}>
                      {isSelected ? <View style={styles.circleRadioInner} /> : null}
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
    marginBottom: 16,
  },
  label: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    marginBottom: 6,
  },
  labelError: {
    color: DayRibbonColors.warn,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DayRibbonColors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputRowError: {
    borderColor: DayRibbonColors.warn,
  },
  valueText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 15,
    color: DayRibbonColors.ink,
    flex: 1,
  },
  placeholderText: {
    color: DayRibbonColors.mutedSoft,
  },
  errorText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 12,
    color: DayRibbonColors.warn,
    marginTop: 4,
    marginLeft: 2,
  },
  dialog: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    maxHeight: '80%',
    ...DayRibbonShapes.shadow,
  },
  dialogTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 18,
    color: DayRibbonColors.ink,
  },
  dialogContent: {
    paddingHorizontal: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DayRibbonColors.line,
  },
  optionRowSelected: {
    backgroundColor: DayRibbonColors.bg,
  },
  circleRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  circleRadioSelected: {
    borderColor: DayRibbonColors.cobalt,
    backgroundColor: DayRibbonColors.surface,
  },
  circleRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: DayRibbonColors.cobalt,
  },
  optionLabel: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 15,
    color: DayRibbonColors.ink,
    flex: 1,
  },
  optionLabelSelected: {
    fontFamily: DayRibbonFonts.body700,
    color: DayRibbonColors.cobalt,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
  },
});

export default AppDropdown;
