import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EditorialColors, EditorialFonts } from '@theme/editorial';
import { EditorialTabBar } from '@components/editorial/EditorialTabBar';

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

const Stack = createNativeStackNavigator<AdminStackParamList>();
const Tab = createBottomTabNavigator();

const PrincipalStackNavigator = () => {
  return (
    <Stack.Navigator
      id="admin-stack"
      screenOptions={{
        headerStyle: { backgroundColor: EditorialColors.bg },
        headerTintColor: EditorialColors.ink,
        headerTitleStyle: {
          fontFamily: EditorialFonts.heavy,
          fontSize: 13,
          letterSpacing: 1.5,
        },
        headerShadowVisible: false,
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
        options={{ title: 'DEPARTMENT SUMMARY' }}
      />
      <Stack.Screen
        name="WeeklyReports"
        component={WeeklyReportsScreen}
        options={{ title: 'WEEKLY REPORTS' }}
      />
      <Stack.Screen
        name="InstitutionAnalytics"
        component={InstitutionAnalyticsScreen}
        options={{ title: 'INSTITUTION ANALYTICS' }}
      />
      <Stack.Screen
        name="FacultyAnalytics"
        component={FacultyAnalyticsScreen}
        options={{ title: 'FACULTY PERFORMANCE' }}
      />
      <Stack.Screen
        name="ReportExport"
        component={ReportExportScreen}
        options={{ title: 'EXPORT REPORTS' }}
      />
      <Stack.Screen
        name="AdminProfile"
        component={PrincipalProfileScreen}
        options={{ title: 'PROFILE' }}
      />
    </Stack.Navigator>
  );
};

export const PrincipalTabNavigator = () => {
  return (
    <Tab.Navigator
      id="admin-tab"
      tabBar={(props) => <EditorialTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="AdminHome"
        component={PrincipalStackNavigator}
        options={{ title: 'EXECUTIVE' }}
      />
      <Tab.Screen
        name="Profile"
        component={PrincipalProfileScreen}
        options={{ title: 'PROFILE' }}
      />
    </Tab.Navigator>
  );
};

export default PrincipalTabNavigator;
