import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@features/auth/store/useAuthStore';

// Screens
import { LandingScreen } from '@features/auth/screens/LandingScreen';
import { LoginScreen } from '@features/auth/screens/LoginScreen';
import { ForgotPasswordScreen } from '@features/auth/screens/ForgotPasswordScreen';

// Navigators
import { StaffTabNavigator } from './StaffNavigator';
import { HodTabNavigator } from './HodNavigator';
import { PrincipalTabNavigator } from './PrincipalNavigator';

// Types
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Auth Navigation Flow
const AuthNavigator = () => {
  return (
    <Stack.Navigator id="auth-stack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
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
      return <PrincipalTabNavigator />;
    case 'HOD':
      return <StaffTabNavigator />;
    case 'STAFF':
    default:
      return <StaffTabNavigator />;
  }
};

export default RootNavigator;
