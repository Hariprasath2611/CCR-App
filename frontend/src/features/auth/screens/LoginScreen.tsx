import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { useAuthStore, UserSession } from '../store/useAuthStore';
import { Palette } from '@theme/colors';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleLogin = (role: 'STAFF' | 'HOD' | 'ADMIN', isCC = false) => {
    const dummyUser: UserSession = {
      id: Math.random().toString(),
      name: `Faculty ${role}`,
      email: email || `${role.toLowerCase()}@college.edu`,
      role,
      isClassCoordinator: isCC,
      department: 'Computer Science',
    };
    login(dummyUser, 'dummy-access-token', 'dummy-refresh-token');
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.surface} elevation={4}>
        <Text style={styles.title}>CCMS Portal</Text>
        <Text style={styles.subtitle}>Course Completion Management System</Text>
        
        <TextInput
          label="College Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
        />

        <Text style={styles.roleHeader}>Select role to login (Boilerplate Mock):</Text>
        <View style={styles.buttonRow}>
          <Button mode="contained" onPress={() => handleLogin('STAFF')} style={styles.loginBtn}>
            Staff
          </Button>
          <Button mode="contained" onPress={() => handleLogin('STAFF', true)} style={styles.loginBtn}>
            Staff + CC
          </Button>
        </View>
        <View style={styles.buttonRow}>
          <Button mode="contained" onPress={() => handleLogin('HOD')} style={styles.loginBtn}>
            HOD
          </Button>
          <Button mode="contained" onPress={() => handleLogin('ADMIN')} style={styles.loginBtn}>
            Admin
          </Button>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Palette.background,
  },
  surface: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: Palette.surface,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Palette.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Palette.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  roleHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  loginBtn: {
    flex: 0.48,
    borderRadius: 8,
  },
});
