import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import { StaffDashboardScreen } from '@features/staff/screens/StaffDashboardScreen';
import { WeeklyTimetableScreen } from '@features/staff/screens/WeeklyTimetableScreen';
import { AssignedSubjectsScreen } from '@features/staff/screens/AssignedSubjectsScreen';
import { SubjectDetailScreen } from '@features/staff/screens/SubjectDetailScreen';
import { WeeklyPlanFormScreen } from '@features/staff/screens/WeeklyPlanFormScreen';
import { WeeklyProgressScreen } from '@features/staff/screens/WeeklyProgressScreen';
import { ExtraHoursRequestScreen } from '@features/staff/screens/ExtraHoursRequestScreen';
import { ReportHistoryScreen } from '@features/staff/screens/ReportHistoryScreen';
import { ApprovalStatusScreen } from '@features/staff/screens/ApprovalStatusScreen';
import { StaffProfileScreen } from '@features/staff/screens/StaffProfileScreen';
import { NotificationsScreen } from '@features/notifications/screens/NotificationsScreen';

// Navigators
import { CCNavigator } from './CCNavigator';

// Types
import { StaffStackParamList } from './types';
import { Palette } from '@theme/colors';

const Stack = createNativeStackNavigator<StaffStackParamList>();
const Tab = createBottomTabNavigator();

const StaffStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Palette.primary },
        headerTintColor: Palette.surface,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="StaffDashboard"
        component={StaffDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WeeklyTimetable"
        component={WeeklyTimetableScreen}
        options={{ title: 'Timetable' }}
      />
      <Stack.Screen
        name="AssignedSubjects"
        component={AssignedSubjectsScreen}
        options={{ title: 'Subjects' }}
      />
      <Stack.Screen
        name="SubjectDetail"
        component={SubjectDetailScreen}
        options={{ title: 'Syllabus Details' }}
      />
      <Stack.Screen
        name="WeeklyPlanForm"
        component={WeeklyPlanFormScreen}
        options={{ title: 'Weekly Teaching Plan' }}
      />
      <Stack.Screen
        name="WeeklyProgress"
        component={WeeklyProgressScreen}
        options={{ title: 'Log Progress' }}
      />
      <Stack.Screen
        name="ExtraHoursRequest"
        component={ExtraHoursRequestScreen}
        options={{ title: 'Request Extra Hours' }}
      />
      <Stack.Screen
        name="ReportHistory"
        component={ReportHistoryScreen}
        options={{ title: 'Report History' }}
      />
      <Stack.Screen
        name="ApprovalStatus"
        component={ApprovalStatusScreen}
        options={{ title: 'Approvals Tracker' }}
      />
      <Stack.Screen
        name="StaffProfile"
        component={StaffProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
};

export const StaffTabNavigator = () => {
  const { user } = useAuthStore();

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
          if (route.name === 'StaffHome') {
            iconName = 'account-box';
          } else if (route.name === 'CCPanel') {
            iconName = 'shield-account';
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
        name="StaffHome"
        component={StaffStackNavigator}
        options={{ title: 'Staff Portal', headerShown: false }}
      />
      {user?.isClassCoordinator && (
        <Tab.Screen
          name="CCPanel"
          component={CCNavigator}
          options={{ title: 'CC Board', headerShown: false }}
        />
      )}
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Tab.Screen
        name="Profile"
        component={StaffProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default StaffTabNavigator;
