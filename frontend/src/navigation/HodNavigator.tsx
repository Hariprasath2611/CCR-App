import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EditorialColors, EditorialFonts } from '@theme/editorial';
import { EditorialTabBar } from '@components/editorial/EditorialTabBar';

// Screens
import { HodDashboardScreen } from '@features/hod/screens/HodDashboardScreen';
import { DepartmentClassesScreen } from '@features/hod/screens/DepartmentClassesScreen';
import { ManageCoordinatorsScreen } from '@features/hod/screens/ManageCoordinatorsScreen';
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

const Stack = createNativeStackNavigator<HodStackParamList>();
const Tab = createBottomTabNavigator();

const HodStackNavigator = () => {
  return (
    <Stack.Navigator
      id="hod-stack"
      screenOptions={{
        headerStyle: { backgroundColor: EditorialColors.bg },
        headerTintColor: EditorialColors.ink,
        headerTitleStyle: {
          fontFamily: EditorialFonts.heavy,
          fontSize: 16,
        },
        headerShadowVisible: false,
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
        options={{ title: 'CLASSES' }}
      />
      <Stack.Screen
        name="ManageCoordinators"
        component={ManageCoordinatorsScreen}
        options={{ title: 'CLASS COORDINATORS' }}
      />
      <Stack.Screen
        name="FacultyProgress"
        component={FacultyProgressScreen}
        options={{ title: 'FACULTY PROGRESS' }}
      />
      <Stack.Screen
        name="SubjectReports"
        component={SubjectReportsScreen}
        options={{ title: 'SUBJECT REPORTS' }}
      />
      <Stack.Screen
        name="CCReports"
        component={CCReportsScreen}
        options={{ title: 'CC CLASS REPORTS' }}
      />
      <Stack.Screen
        name="RequestDetails"
        component={RequestDetailsScreen}
        options={{ title: 'REQUEST DETAILS' }}
      />
      <Stack.Screen
        name="ApprovalScreen"
        component={ApprovalScreen}
        options={{ title: 'APPROVAL QUEUE' }}
      />
      <Stack.Screen
        name="ExtraHourRequests"
        component={ExtraHourRequestsScreen}
        options={{ title: 'EXTRA HOUR REQUESTS' }}
      />
      <Stack.Screen
        name="DeptAnalytics"
        component={DeptAnalyticsScreen}
        options={{ title: 'ANALYTICS' }}
      />
      <Stack.Screen
        name="HodProfile"
        component={HodProfileScreen}
        options={{ title: 'PROFILE' }}
      />
    </Stack.Navigator>
  );
};

export const HodTabNavigator = () => {
  return (
    <Tab.Navigator
      id="hod-tab"
      tabBar={(props) => <EditorialTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HodHome"
        component={HodStackNavigator}
        options={{ title: 'HOD PORTAL' }}
      />
      <Tab.Screen
        name="Analytics"
        component={DeptAnalyticsScreen}
        options={{ title: 'ANALYTICS' }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'ALERTS' }}
      />
      <Tab.Screen
        name="Profile"
        component={HodProfileScreen}
        options={{ title: 'PROFILE' }}
      />
    </Tab.Navigator>
  );
};

export default HodTabNavigator;
