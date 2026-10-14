import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { SegBar } from './SegBar';

interface ListRowProps {
  indexOrCode?: string;
  name: string;
  caption?: string;
  value?: string | number;
  valueSuffix?: string;
  isLagging?: boolean;
  progress?: number;
  total?: number;
  showSegBar?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  rightElement?: React.ReactNode;
}

export const ListRow: React.FC<ListRowProps> = ({
  indexOrCode,
  name,
  caption,
  value,
  valueSuffix,
  isLagging = false,
  progress,
  total,
  showSegBar = false,
  onPress,
  style,
  rightElement,
}) => {
  const Content = (
    <View style={[styles.rowContainer, style]}>
      <View style={styles.topSection}>
        {indexOrCode ? (
          <Text style={styles.codeText}>{indexOrCode}</Text>
        ) : null}

        <View style={styles.nameContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {name}
          </Text>
          {caption ? (
            <Text style={styles.captionText} numberOfLines={1}>
              {caption.toUpperCase()}
            </Text>
          ) : null}
        </View>

        {rightElement ? (
          <View style={styles.rightSlot}>{rightElement}</View>
        ) : value !== undefined ? (
          <View style={styles.valueContainer}>
            <Text
              style={[
                styles.valueText,
                isLagging && { color: EditorialColors.accent },
              ]}
            >
              {value}
              {valueSuffix ? (
                <Text
                  style={[
                    styles.valueSuffix,
                    isLagging && { color: EditorialColors.accent },
                  ]}
                >
                  {valueSuffix}
                </Text>
              ) : null}
            </Text>
          </View>
        ) : null}
      </View>

      {showSegBar && progress !== undefined ? (
        <View style={styles.segBarWrapper}>
          <SegBar progress={progress} total={total} isLagging={isLagging} />
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
};

const styles = StyleSheet.create({
  rowContainer: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
    paddingVertical: EditorialSpacing.rowPaddingVertical,
    width: '100%',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  codeText: {
    fontFamily: EditorialFonts.bold,
    fontSize: 13,
    color: EditorialColors.muted,
    marginRight: 10,
  },
  nameContainer: {
    flex: 1,
    paddingRight: 12,
  },
  nameText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 17,
    lineHeight: 22,
    color: EditorialColors.ink,
  },
  captionText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
    marginTop: 2,
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontFamily: EditorialFonts.display,
    fontSize: 30,
    lineHeight: 32,
    color: EditorialColors.ink,
    letterSpacing: -0.5,
  },
  valueSuffix: {
    fontFamily: EditorialFonts.display,
    fontSize: 18,
    color: EditorialColors.accent,
  },
  segBarWrapper: {
    marginTop: 10,
    width: '100%',
  },
});
