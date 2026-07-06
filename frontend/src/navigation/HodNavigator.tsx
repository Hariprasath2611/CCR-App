import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import { HodDashboardScreen } from '@features/hod/screens/HodDashboardScreen';
import { DepartmentClassesScreen } from '@features/hod/screens/DepartmentClassesScreen';
import { FacultyProgressScreen } from '@features/hod/screens/FacultyProgressScreen';
import { SubjectReportsScreen } from '@features/hod/screens/SubjectReportsScreen';
import { CCReportsScreen } from '@features/hod/screens/CCReportsScreen';
import { RequestDetailsScreen } from '@features/hod/screens/RequestDetailsScreen';
import { ApprovalScreen } from '@features/hod/screens/ApprovalScreen';
import { ExtraHourRequestsScreen } from '@features/hod/screens/ExtraHourRequestsScreen';
import { DeptAnalyticsScreen } from '@features/hod/screens/DeptAnalyticsScreen';
import { HodProfileScreen } from '@features/hod/screens/HodProfileScreen';
import { NotificationsScreen } from '@features/notifications/screens/NotificationsScreen';

// Types
import { HodStackParamList } from './types';
import { Palette } from '@theme/colors';

const Stack = createNativeStackNavigator<HodStackParamList>();
const Tab = createBottomTabNavigator();

const HodStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Palette.primary },
        headerTintColor: Palette.surface,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="HodDashboard"
        component={HodDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DepartmentClasses"
        component={DepartmentClassesScreen}
        options={{ title: 'Classes' }}
      />
      <Stack.Screen
        name="FacultyProgress"
        component={FacultyProgressScreen}
        options={{ title: 'Faculty Progress' }}
      />
      <Stack.Screen
        name="SubjectReports"
        component={SubjectReportsScreen}
        options={{ title: 'Subject Reports' }}
      />
      <Stack.Screen
        name="CCReports"
        component={CCReportsScreen}
        options={{ title: 'CC Class Reports' }}
      />
      <Stack.Screen
        name="RequestDetails"
        component={RequestDetailsScreen}
        options={{ title: 'Request Details' }}
      />
      <Stack.Screen
        name="ApprovalScreen"
        component={ApprovalScreen}
        options={{ title: 'Approval Queue' }}
      />
      <Stack.Screen
        name="ExtraHourRequests"
        component={ExtraHourRequestsScreen}
        options={{ title: 'Extra Hour Requests' }}
      />
      <Stack.Screen
        name="DeptAnalytics"
        component={DeptAnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
      <Stack.Screen
        name="HodProfile"
        component={HodProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
};

export const HodTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: Palette.primary },
        headerTintColor: Palette.surface,
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.textLight,
        tabBarStyle: { backgroundColor: Palette.surface },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'help-circle';
          if (route.name === 'HodHome') {
            iconName = 'bulletin-board';
          } else if (route.name === 'Analytics') {
            iconName = 'chart-bar';
          } else if (route.name === 'Notifications') {
            iconName = 'bell';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HodHome"
        component={HodStackNavigator}
        options={{ title: 'HOD Portal', headerShown: false }}
      />
      <Tab.Screen
        name="Analytics"
        component={DeptAnalyticsScreen}
        options={{ title: 'Dept Analytics' }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Tab.Screen
        name="Profile"
        component={HodProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default HodTabNavigator;
