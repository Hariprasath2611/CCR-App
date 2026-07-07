import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import { AdminDashboardScreen } from '@features/admin/screens/AdminDashboardScreen';
import { DeptSummaryScreen } from '@features/admin/screens/DeptSummaryScreen';
import { WeeklyReportsScreen } from '@features/admin/screens/WeeklyReportsScreen';
import { InstitutionAnalyticsScreen } from '@features/admin/screens/InstitutionAnalyticsScreen';
import { FacultyAnalyticsScreen } from '@features/admin/screens/FacultyAnalyticsScreen';
import { ReportExportScreen } from '@features/admin/screens/ReportExportScreen';
import { AdminProfileScreen } from '@features/admin/screens/AdminProfileScreen';

// Types
import { AdminStackParamList } from './types';
import { Palette } from '@theme/colors';

const Stack = createNativeStackNavigator<AdminStackParamList>();
const Tab = createBottomTabNavigator();

const AdminStackNavigator = () => {
  return (
    <Stack.Navigator
      id="admin-stack"
      screenOptions={{
        headerStyle: { backgroundColor: Palette.primary },
        headerTintColor: Palette.surface,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DeptSummary"
        component={DeptSummaryScreen}
        options={{ title: 'Department Summary' }}
      />
      <Stack.Screen
        name="WeeklyReports"
        component={WeeklyReportsScreen}
        options={{ title: 'Weekly Reports' }}
      />
      <Stack.Screen
        name="ReportExport"
        component={ReportExportScreen}
        options={{ title: 'Export Reports' }}
      />
      <Stack.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
};

export const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      id="admin-tab"
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: Palette.primary },
        headerTintColor: Palette.surface,
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.textLight,
        tabBarStyle: { backgroundColor: Palette.surface },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'help-circle';
          if (route.name === 'AdminHome') {
            iconName = 'bank';
          } else if (route.name === 'Analytics') {
            iconName = 'chart-line';
          } else if (route.name === 'Faculty') {
            iconName = 'account-group';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }
          return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="AdminHome"
        component={AdminStackNavigator}
        options={{ title: 'Admin Console', headerShown: false }}
      />
      <Tab.Screen
        name="Analytics"
        component={InstitutionAnalyticsScreen}
        options={{ title: 'Institution Analytics' }}
      />
      <Tab.Screen
        name="Faculty"
        component={FacultyAnalyticsScreen}
        options={{ title: 'Faculty Performance' }}
      />
      <Tab.Screen
        name="Profile"
        component={AdminProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;
