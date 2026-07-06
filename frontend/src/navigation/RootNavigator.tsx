import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '@features/auth/store/useAuthStore';

// Screens
import { LoginScreen } from '@features/auth/screens/LoginScreen';
import { ForgotPasswordScreen } from '@features/auth/screens/ForgotPasswordScreen';
import { StaffDashboardScreen } from '@features/staff/screens/StaffDashboardScreen';
import { WeeklyPlanFormScreen } from '@features/staff/screens/WeeklyPlanFormScreen';
import { ProgressLogScreen } from '@features/staff/screens/ProgressLogScreen';
import { ExtraHoursRequestScreen } from '@features/staff/screens/ExtraHoursRequestScreen';
import { CCDashboardScreen } from '@features/cc/screens/CCDashboardScreen';
import { HodDashboardScreen } from '@features/hod/screens/HodDashboardScreen';
import { AdminDashboardScreen } from '@features/admin/screens/AdminDashboardScreen';

// Params lists types
import {
  AuthStackParamList,
  StaffStackParamList,
  HodStackParamList,
  AdminStackParamList,
} from './types';
import { Palette } from '@theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const StaffStack = createNativeStackNavigator<StaffStackParamList>();

// Auth Navigation Flow
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// Staff Nested Screen Stack Flow
const StaffStackNavigator = () => {
  return (
    <StaffStack.Navigator>
      <StaffStack.Screen 
        name="StaffDashboard" 
        component={StaffDashboardScreen} 
        options={{ headerShown: false }}
      />
      <StaffStack.Screen 
        name="WeeklyPlanForm" 
        component={WeeklyPlanFormScreen} 
        options={{ title: 'Weekly Plan Targets' }}
      />
      <StaffStack.Screen 
        name="ProgressLog" 
        component={ProgressLogScreen} 
        options={{ title: 'Log Progress' }}
      />
      <StaffStack.Screen 
        name="ExtraHoursRequest" 
        component={ExtraHoursRequestScreen} 
        options={{ title: 'Request Extra Hours' }}
      />
    </StaffStack.Navigator>
  );
};

// Staff + CC Flow Navigator
const StaffTabNavigator = () => {
  const { user } = useAuthStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerTintColor: Palette.primary,
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.textLight,
        tabBarStyle: { backgroundColor: Palette.surface },
      }}
    >
      <Tab.Screen 
        name="StaffHome" 
        component={StaffStackNavigator} 
        options={{ title: 'Staff Portal', headerShown: false }} 
      />
      {user?.isClassCoordinator && (
        <Tab.Screen 
          name="CCDashboard" 
          component={CCDashboardScreen} 
          options={{ title: 'CC Board' }} 
        />
      )}
    </Tab.Navigator>
  );
};

// HOD Flow Navigator
const HodTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTintColor: Palette.primary,
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.textLight,
        tabBarStyle: { backgroundColor: Palette.surface },
      }}
    >
      <Tab.Screen 
        name="HodDashboard" 
        component={HodDashboardScreen} 
        options={{ title: 'HOD Portal' }} 
      />
    </Tab.Navigator>
  );
};

// Admin Flow Navigator
const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTintColor: Palette.primary,
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.textLight,
        tabBarStyle: { backgroundColor: Palette.surface },
      }}
    >
      <Tab.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen} 
        options={{ title: 'Admin Console' }} 
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { user, accessToken } = useAuthStore();

  if (!accessToken || !user) {
    return <AuthNavigator />;
  }

  // Switch dashboards base on user role privileges
  switch (user.role) {
    case 'ADMIN':
      return <AdminTabNavigator />;
    case 'HOD':
      return <HodTabNavigator />;
    case 'STAFF':
    default:
      return <StaffTabNavigator />;
  }
};
