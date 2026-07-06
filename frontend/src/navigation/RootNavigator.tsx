import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@features/auth/store/useAuthStore';

// Screens
import { LoginScreen } from '@features/auth/screens/LoginScreen';
import { ForgotPasswordScreen } from '@features/auth/screens/ForgotPasswordScreen';

// Navigators
import { StaffTabNavigator } from './StaffNavigator';
import { HodTabNavigator } from './HodNavigator';
import { AdminTabNavigator } from './AdminNavigator';

// Types
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Auth Navigation Flow
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export const RootNavigator = () => {
  const { user, accessToken } = useAuthStore();

  if (!accessToken || !user) {
    return <AuthNavigator />;
  }

  // Switch dashboards based on user role privileges
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

export default RootNavigator;
