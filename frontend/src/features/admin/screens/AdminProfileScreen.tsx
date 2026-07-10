import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { Palette } from '@theme/colors';

export const AdminProfileScreen = () => {
  const { user, logout } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Principal Profile</Text>
      <Text variant="titleMedium">{user?.name}</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>{user?.email}</Text>
      <Text variant="bodySmall" style={styles.subtitle}>Role: {user?.role === 'ADMIN' ? 'Principal' : user?.role}</Text>

      <Button mode="contained" onPress={logout} style={styles.btn} buttonColor={Palette.error}>
        Sign Out
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.background,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: Palette.textDark,
  },
  subtitle: {
    color: Palette.textLight,
    marginBottom: 8,
  },
  btn: {
    marginTop: 32,
    width: '80%',
  },
});
export default AdminProfileScreen;
