import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import { PrincipalDashboardScreen } from '@features/principal/screens/PrincipalDashboardScreen';
import { DeptSummaryScreen } from '@features/principal/screens/DeptSummaryScreen';
import { WeeklyReportsScreen } from '@features/principal/screens/WeeklyReportsScreen';
import { InstitutionAnalyticsScreen } from '@features/principal/screens/InstitutionAnalyticsScreen';
import { FacultyAnalyticsScreen } from '@features/principal/screens/FacultyAnalyticsScreen';
import { ReportExportScreen } from '@features/principal/screens/ReportExportScreen';
import { PrincipalProfileScreen } from '@features/principal/screens/PrincipalProfileScreen';

// Types
import { AdminStackParamList } from './types';
import { Palette } from '@theme/colors';

const Stack = createNativeStackNavigator<AdminStackParamList>();
const Tab = createBottomTabNavigator();

const PrincipalStackNavigator = () => {
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
        component={PrincipalDashboardScreen}
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
        component={PrincipalProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
};

export const PrincipalTabNavigator = () => {
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
            iconName = 'home';
          } else if (route.name === 'Reports') {
            iconName = 'file-document-outline';
          } else if (route.name === 'Analytics') {
            iconName = 'chart-line';
          } else if (route.name === 'Profile') {
            iconName = 'account-outline';
          }
          return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="AdminHome"
        component={PrincipalStackNavigator}
        options={{ title: 'Dashboard', headerShown: false }}
      />
      <Tab.Screen
        name="Reports"
        component={WeeklyReportsScreen}
        options={{ title: 'Reports' }}
      />
      <Tab.Screen
        name="Analytics"
        component={InstitutionAnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
      <Tab.Screen
        name="Profile"
        component={PrincipalProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default PrincipalTabNavigator;
