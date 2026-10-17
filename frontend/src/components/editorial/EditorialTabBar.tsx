import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';
import {
  FacultyNavIcon,
  CCBoardNavIcon,
  ProfileNavIcon,
  HodPortalNavIcon,
  AnalyticsNavIcon,
  AlertsNavIcon,
} from './DayRibbonIcons';

// -------------------------------------------------------------
// Hanging Bookmark Ribbon for Active Tab (46 x 50, 14px notch)
// -------------------------------------------------------------
const HangingBookmarkRibbon: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ribbonWidth = 46;
  const bodyHeight = 36;
  const cutout = 14;
  const halfWidth = ribbonWidth / 2; // 23
  const color = DayRibbonColors.blue; // #2B35E0

  return (
    <View style={styles.ribbonContainer}>
      <View style={[styles.ribbonBody, { width: ribbonWidth, height: bodyHeight, backgroundColor: color }]}>
        {children}
      </View>
      <View style={{ width: ribbonWidth, height: cutout, flexDirection: 'row' }}>
        <View
          style={{
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderLeftWidth: halfWidth,
            borderRightWidth: 0,
            borderBottomWidth: cutout,
            borderLeftColor: color,
            borderBottomColor: 'transparent',
          }}
        />
        <View
          style={{
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderLeftWidth: 0,
            borderRightWidth: halfWidth,
            borderBottomWidth: cutout,
            borderRightColor: color,
            borderBottomColor: 'transparent',
          }}
        />
      </View>
    </View>
  );
};

// -------------------------------------------------------------
// Icon Selector
// -------------------------------------------------------------
const renderNavIcon = (routeName: string, title: string | undefined, isFocused: boolean) => {
  const key = (title || routeName).toUpperCase();

  if (key.includes('FACULTY') || routeName === 'StaffHome') {
    return <FacultyNavIcon isFocused={isFocused} size={22} />;
  }
  if (key.includes('HOD') || routeName === 'HodHome' || routeName === 'HodTab') {
    return <HodPortalNavIcon isFocused={isFocused} size={22} />;
  }
  if (key.includes('CC') || key.includes('COORDINATOR') || routeName === 'CounselorTab') {
    return <CCBoardNavIcon isFocused={isFocused} size={22} />;
  }
  if (key.includes('ANALYTICS') || routeName === 'Analytics') {
    return <AnalyticsNavIcon isFocused={isFocused} size={22} />;
  }
  if (key.includes('ALERT') || key.includes('NOTIFICATION') || routeName === 'Notifications') {
    return <AlertsNavIcon isFocused={isFocused} size={22} hasUnread={true} />;
  }
  if (key.includes('PROFILE') || routeName.includes('Profile')) {
    return <ProfileNavIcon isFocused={isFocused} size={22} />;
  }

  return <FacultyNavIcon isFocused={isFocused} size={22} />;
};

// -------------------------------------------------------------
// EditorialTabBar
// -------------------------------------------------------------
export const EditorialTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {/* 3px Four-Color Strip Along the Top Edge */}
      <View style={styles.topAccentBar}>
        <View style={[styles.accentSegment, { backgroundColor: DayRibbonColors.blue }]} />
        <View style={[styles.accentSegment, { backgroundColor: DayRibbonColors.amber }]} />
        <View style={[styles.accentSegment, { backgroundColor: DayRibbonColors.coral }]} />
        <View style={[styles.accentSegment, { backgroundColor: DayRibbonColors.mint }]} />
      </View>

      {/* Tabs Row */}
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
          const iconNode = renderNavIcon(route.name, options.title, isFocused);

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || labelStr}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.82}
            >
              {isFocused ? (
                <HangingBookmarkRibbon>{iconNode}</HangingBookmarkRibbon>
              ) : (
                <View style={styles.inactiveIconSlot}>{iconNode}</View>
              )}

              <Text
                style={[
                  styles.tabText,
                  {
                    color: isFocused ? DayRibbonColors.ink : DayRibbonColors.inactiveLabel,
                    fontFamily: isFocused ? DayRibbonFonts.body700 : DayRibbonFonts.body600,
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
    backgroundColor: DayRibbonColors.pageBg,
    ...DayRibbonShapes.upwardShadow,
  },
  topAccentBar: {
    flexDirection: 'row',
    width: '100%',
    height: 3,
  },
  accentSegment: {
    flex: 1,
    height: 3,
  },
  tabRow: {
    height: 74,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 44, // 44x44 touch target
  },
  ribbonContainer: {
    width: 46,
    alignItems: 'center',
  },
  ribbonBody: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveIconSlot: {
    width: 46,
    height: 50, // 36 + 14 = 50, matches hanging ribbon exactly
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 10.5,
    letterSpacing: 0.35,
    marginTop: 4,
    textTransform: 'uppercase',
  },
});

export default EditorialTabBar;
