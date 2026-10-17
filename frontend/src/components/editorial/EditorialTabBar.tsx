import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { DayRibbonFonts } from '@theme/dayRibbon';

// -------------------------------------------------------------
// Hanging Bookmark Ribbon for Active Tab
// -------------------------------------------------------------
const BookmarkRibbon: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ribbonWidth = 44;
  const bodyHeight = 33;
  const cutout = 11;
  const halfWidth = ribbonWidth / 2;
  const color = '#1E38E8';

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
// Custom Icons Matching DayRibbon Visual Specification
// -------------------------------------------------------------

// 1. Faculty Avatar: Golden head + white/slate shoulders
const FacultyIcon = ({ isFocused }: { isFocused: boolean }) => {
  const headColor = '#FFA51E';
  const bodyColor = isFocused ? '#FFFFFF' : '#7886A0';

  return (
    <View style={styles.iconCentered}>
      <View
        style={{
          width: 7.5,
          height: 7.5,
          borderRadius: 3.75,
          backgroundColor: headColor,
          marginBottom: 2.2,
        }}
      />
      <View
        style={{
          width: 17,
          height: 9,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          backgroundColor: bodyColor,
        }}
      />
    </View>
  );
};

// 2. HOD Portal Bar Chart: 1 yellow/orange bar + 3 white/slate bars
const HodPortalIcon = ({ isFocused }: { isFocused: boolean }) => {
  const orangeColor = '#FFA51E';
  const barColor = isFocused ? '#FFFFFF' : '#7886A0';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 18 }}>
      <View style={{ width: 3.5, height: 14, borderRadius: 1.75, backgroundColor: orangeColor, marginRight: 2.5 }} />
      <View style={{ width: 3.5, height: 18, borderRadius: 1.75, backgroundColor: barColor, marginRight: 2.5 }} />
      <View style={{ width: 3.5, height: 14, borderRadius: 1.75, backgroundColor: barColor, marginRight: 2.5 }} />
      <View style={{ width: 3.5, height: 10, borderRadius: 1.75, backgroundColor: barColor }} />
    </View>
  );
};

// 3. CC Board: Clipboard with top clip & 3 note lines
const CCBoardIcon = ({ isFocused }: { isFocused: boolean }) => {
  const boardColor = isFocused ? '#FFFFFF' : '#7886A0';
  const clipColor = isFocused ? '#CBD5E1' : '#9AA8BE';
  const lineColor = isFocused ? '#1E38E8' : '#FFFFFF';

  return (
    <View
      style={{
        width: 18,
        height: 21,
        backgroundColor: boardColor,
        borderRadius: 3.5,
        alignItems: 'center',
        paddingTop: 5,
      }}
    >
      {/* Top Clip */}
      <View
        style={{
          position: 'absolute',
          top: -2,
          width: 8,
          height: 3.5,
          backgroundColor: clipColor,
          borderRadius: 1.5,
        }}
      />
      {/* Lines */}
      <View style={{ width: 10, height: 1.8, backgroundColor: lineColor, borderRadius: 1, marginBottom: 2.2 }} />
      <View style={{ width: 10, height: 1.8, backgroundColor: lineColor, borderRadius: 1, marginBottom: 2.2 }} />
      <View style={{ width: 6, height: 1.8, backgroundColor: lineColor, borderRadius: 1, alignSelf: 'flex-start', marginLeft: 4 }} />
    </View>
  );
};

// 4. Analytics: Donut chart progress ring with top-right gap
const AnalyticsIcon = ({ isFocused }: { isFocused: boolean }) => {
  const ringColor = isFocused ? '#FFFFFF' : '#7886A0';

  return (
    <View
      style={{
        width: 19,
        height: 19,
        borderRadius: 9.5,
        borderWidth: 3.2,
        borderColor: ringColor,
        borderTopColor: 'transparent',
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
};

// 5. Alerts: Bell with coral-red notification dot
const AlertsIcon = ({ isFocused }: { isFocused: boolean }) => {
  const bellColor = isFocused ? '#FFFFFF' : '#7886A0';

  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialCommunityIcons name="bell" size={19} color={bellColor} />
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 1,
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: '#FF4B72',
          borderWidth: 1,
          borderColor: isFocused ? '#1E38E8' : '#FFFFFF',
        }}
      />
    </View>
  );
};

// 6. Profile: ID badge with lanyard loop and center person silhouette
const ProfileIcon = ({ isFocused }: { isFocused: boolean }) => {
  const badgeColor = isFocused ? '#FFFFFF' : '#7886A0';
  const clipColor = isFocused ? '#CBD5E1' : '#9AA8BE';
  const personColor = isFocused ? '#1E38E8' : '#FFFFFF';

  return (
    <View
      style={{
        width: 17,
        height: 21,
        backgroundColor: badgeColor,
        borderRadius: 3.5,
        alignItems: 'center',
        paddingTop: 3.5,
      }}
    >
      {/* Top Lanyard Loop */}
      <View
        style={{
          position: 'absolute',
          top: -3,
          width: 6,
          height: 3,
          borderWidth: 1.2,
          borderBottomWidth: 0,
          borderColor: clipColor,
          borderRadius: 1.5,
        }}
      />
      {/* Head */}
      <View
        style={{
          width: 4.8,
          height: 4.8,
          borderRadius: 2.4,
          backgroundColor: personColor,
          marginBottom: 1.5,
        }}
      />
      {/* Shoulders */}
      <View
        style={{
          width: 9.5,
          height: 4.5,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          backgroundColor: personColor,
        }}
      />
    </View>
  );
};

// 7. Executive (Admin fallback)
const ExecutiveIcon = ({ isFocused }: { isFocused: boolean }) => {
  const color = isFocused ? '#FFFFFF' : '#7886A0';
  return <Feather name="shield" size={19} color={color} />;
};

// Icon Selector
const renderTabIcon = (routeName: string, title: string | undefined, isFocused: boolean) => {
  const key = (title || routeName).toUpperCase();

  if (key.includes('FACULTY') || routeName === 'StaffHome') {
    return <FacultyIcon isFocused={isFocused} />;
  }
  if (key.includes('HOD') || routeName === 'HodHome' || routeName === 'HodTab') {
    return <HodPortalIcon isFocused={isFocused} />;
  }
  if (key.includes('CC') || key.includes('COORDINATOR') || routeName === 'CounselorTab') {
    return <CCBoardIcon isFocused={isFocused} />;
  }
  if (key.includes('ANALYTICS') || routeName === 'Analytics') {
    return <AnalyticsIcon isFocused={isFocused} />;
  }
  if (key.includes('ALERT') || key.includes('NOTIFICATION') || routeName === 'Notifications') {
    return <AlertsIcon isFocused={isFocused} />;
  }
  if (key.includes('PROFILE') || routeName === 'Profile' || routeName === 'HodProfile' || routeName === 'StaffProfile' || routeName === 'AdminProfile') {
    return <ProfileIcon isFocused={isFocused} />;
  }
  if (key.includes('EXECUTIVE') || routeName === 'AdminHome') {
    return <ExecutiveIcon isFocused={isFocused} />;
  }

  return <FacultyIcon isFocused={isFocused} />;
};

// -------------------------------------------------------------
// EditorialTabBar Component
// -------------------------------------------------------------
export const EditorialTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {/* Signature 4-Color DayRibbon Top Accent Stripe */}
      <View style={styles.topAccentBar}>
        <View style={[styles.accentSegment, { backgroundColor: '#FFA51E' }]} />
        <View style={[styles.accentSegment, { backgroundColor: '#FF4B72' }]} />
        <View style={[styles.accentSegment, { backgroundColor: '#2CD4A0' }]} />
        <View style={[styles.accentSegment, { backgroundColor: '#1E38E8' }]} />
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
          const iconNode = renderTabIcon(route.name, options.title, isFocused);

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || labelStr}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              {isFocused ? (
                <BookmarkRibbon>{iconNode}</BookmarkRibbon>
              ) : (
                <View style={styles.inactiveIconSlot}>{iconNode}</View>
              )}

              <Text
                style={[
                  styles.tabText,
                  {
                    color: isFocused ? '#0E1330' : '#6B7A99',
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  topAccentBar: {
    flexDirection: 'row',
    width: '100%',
    height: 2.5,
  },
  accentSegment: {
    flex: 1,
    height: 2.5,
  },
  tabRow: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  ribbonContainer: {
    width: 44,
    alignItems: 'center',
  },
  ribbonBody: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveIconSlot: {
    width: 44,
    height: 44, // Matches 33px ribbon body + 11px cutout
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCentered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 10.5,
    letterSpacing: 0.3,
    marginTop: 3,
  },
});

export default EditorialTabBar;
