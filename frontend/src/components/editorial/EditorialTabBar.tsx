import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialFonts, EditorialRules } from '@theme/editorial';

export const EditorialTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const labelStr = typeof label === 'string' ? label : route.name;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={[
                styles.tabItem,
                isFocused ? styles.tabItemActive : styles.tabItemInactive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  isFocused ? styles.tabTextActive : styles.tabTextInactive,
                ]}
                numberOfLines={1}
              >
                {labelStr.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: EditorialColors.bg,
    borderTopWidth: EditorialRules.hairline, // 1px ink top border
    borderTopColor: EditorialColors.ink,
  },
  tabRow: {
    height: 70, // 70px high
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  tabItem: {
    flex: 1,
    height: 48,
    borderRadius: 0, // square
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabItemActive: {
    backgroundColor: EditorialColors.ink, // active tab = ink fill + white text
  },
  tabItemInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: EditorialColors.white,
  },
  tabTextInactive: {
    color: EditorialColors.muted, // inactive = muted text
  },
});
