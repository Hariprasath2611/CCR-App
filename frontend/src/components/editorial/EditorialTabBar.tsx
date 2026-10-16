import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { DayRibbonColors, DayRibbonFonts } from '@theme/dayRibbon';

export const EditorialTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  const getTabIcon = (routeName: string): keyof typeof Feather.glyphMap => {
    switch (routeName) {
      case 'StaffHome':
        return 'calendar';
      case 'CounselorTab':
        return 'clipboard';
      case 'HodTab':
      case 'HodHome':
        return 'grid';
      case 'Analytics':
        return 'bar-chart-2';
      case 'Notifications':
        return 'bell';
      case 'AdminHome':
        return 'activity';
      case 'Profile':
        return 'user';
      default:
        return 'layers';
    }
  };

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
          const iconName = getTabIcon(route.name);
          const activeColor = DayRibbonColors.cobalt;
          const inactiveColor = DayRibbonColors.mutedSoft;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || labelStr}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Feather
                name={iconName}
                size={20}
                color={isFocused ? activeColor : inactiveColor}
                style={{ strokeWidth: 1.8 }}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isFocused ? activeColor : inactiveColor,
                    fontFamily: isFocused ? DayRibbonFonts.body700 : DayRibbonFonts.body500,
                  },
                ]}
                numberOfLines={1}
              >
                {labelStr}
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
    backgroundColor: DayRibbonColors.surface,
    borderTopWidth: 1,
    borderTopColor: DayRibbonColors.line,
  },
  tabRow: {
    height: 64, // total ~74px with padding
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  tabText: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
});

export default EditorialTabBar;
