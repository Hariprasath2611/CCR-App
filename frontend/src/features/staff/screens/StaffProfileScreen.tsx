import React, { useState } from 'react';
import { Alert, StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Avatar, Button, Divider, List, Dialog, Portal, TextInput } from 'react-native-paper';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient } from '@services/api/apiClient';

import { ms } from '@theme/responsive';

export const StaffProfileScreen = () => {
  const { user, logout } = useAuthStore();

  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Validation Error', 'New password must be at least 6 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      Alert.alert('Success', 'Password changed successfully!');
      setChangePasswordVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to change password. Please try again.';
      Alert.alert('Error', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'PF';
    return name
      .split(' ')
      .filter((w) => w.length > 0)
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Determine designation/position based on role
  const getDesignation = () => {
    if (user?.role === 'HOD') {
      return 'Senior Professor & HOD';
    }
    if (user?.isClassCoordinator) {
      return 'Assistant Professor & CC';
    }
    return 'Assistant Professor';
  };

  const getMockFacultyId = () => {
    if (user?.role === 'HOD') return 'JEC-CSE-HOD-01';
    if (user?.isClassCoordinator) return 'JEC-CSE-FAC-12';
    return 'JEC-CSE-FAC-34';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── PROFILE HEADER CARD ── */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.headerContent}>
          {/* Circular Photo / Avatar frame */}
          <View style={styles.avatarContainer}>
            <Avatar.Text
              size={96}
              label={getInitials(user?.name)}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            {/* Soft Camera Badge */}
            <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.7}>
              <Feather name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.facultyName}>{user?.name || 'Faculty Member'}</Text>
          <Text style={styles.designationText}>{getDesignation()}</Text>
          <Text style={styles.collegeText}>Jaya Engineering College</Text>
        </Card.Content>
      </Card>

      {/* ── DESIGNATION & DEPARTMENT INFO ── */}
      <Text style={styles.sectionTitle}>Institutional Info</Text>
      <Card style={styles.detailsCard}>
        <Card.Content style={styles.listContent}>
          <List.Item
            title="Faculty Position"
            description={getDesignation()}
            left={(props) => <List.Icon {...props} icon="tie" color={Palette.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDesc}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Department"
            description={user?.department || 'Computer Science Engineering'}
            left={(props) => <List.Icon {...props} icon="office-building" color={Palette.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDesc}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Faculty Identification ID"
            description={getMockFacultyId()}
            left={(props) => <List.Icon {...props} icon="card-account-details" color={Palette.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDesc}
          />
          {user?.isClassCoordinator && (
            <>
              <Divider style={styles.divider} />
              <List.Item
                title="Class Coordination"
                description={`Assigned In-charge: Class ${user.assignedClassId || 'CSE-B'}`}
                left={(props) => <List.Icon {...props} icon="account-supervisor" color={Palette.primary} />}
                titleStyle={styles.listTitle}
                descriptionStyle={styles.listDesc}
              />
            </>
          )}
        </Card.Content>
      </Card>

      {/* ── ACCOUNT / LOGIN INFO ── */}
      <Text style={styles.sectionTitle}>Login Credentials</Text>
      <Card style={styles.detailsCard}>
        <Card.Content style={styles.listContent}>
          <List.Item
            title="Email Address"
            description={user?.email || 'faculty@college.com'}
            left={(props) => <List.Icon {...props} icon="email-outline" color={Palette.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDesc}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Account Privilege Level"
            description={user?.role || 'STAFF'}
            left={(props) => <List.Icon {...props} icon="shield-outline" color={Palette.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDesc}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Session Validity"
            description="Active (Device Authorization Online)"
            left={(props) => <List.Icon {...props} icon="cellphone-key" color={Palette.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDesc}
          />
          <Divider style={styles.divider} />
          <TouchableOpacity onPress={() => setChangePasswordVisible(true)}>
            <List.Item
              title="Change Password"
              description="Update your account login security password"
              left={(props) => <List.Icon {...props} icon="lock-reset" color={Palette.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color={Palette.textLight} />}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* ── SIGN OUT BUTTON ── */}
      <Button
        mode="contained"
        onPress={logout}
        style={styles.signOutBtn}
        buttonColor={Palette.error}
        labelStyle={styles.btnLabel}
        icon="logout"
      >
        Sign Out Account
      </Button>

      {/* ── CHANGE PASSWORD DIALOG ── */}
      <Portal>
        <Dialog visible={changePasswordVisible} onDismiss={() => {
          setChangePasswordVisible(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }}>
          <Dialog.Title>Change Password</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              mode="outlined"
              activeOutlineColor={Palette.primary}
              style={{ marginBottom: ms(12) }}
            />
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              mode="outlined"
              activeOutlineColor={Palette.primary}
              style={{ marginBottom: ms(12) }}
            />
            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              mode="outlined"
              activeOutlineColor={Palette.primary}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setChangePasswordVisible(false);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            }} textColor={Palette.textLight}>Cancel</Button>
            <Button loading={submitting} disabled={submitting} onPress={handleChangePassword} textColor={Palette.primary}>
              Update
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: ms(20),
    paddingBottom: ms(40),
  },
  
  // Profile Card styles
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(24),
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(10) },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: ms(24),
    paddingVertical: ms(12),
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: ms(16),
  },
  avatar: {
    backgroundColor: Palette.primary,
    shadowColor: Palette.primary,
    shadowOffset: { width: ms(0), height: ms(8) },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarLabel: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: ms(2),
    right: ms(2),
    backgroundColor: Palette.accent,
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 2,
  },
  facultyName: {
    fontSize: ms(20),
    fontWeight: '900',
    color: Palette.textDark,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  designationText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: Palette.primary,
    marginTop: ms(4),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  collegeText: {
    fontSize: ms(12),
    color: Palette.textLight,
    fontWeight: '600',
    marginTop: ms(2),
  },

  // Section titles
  sectionTitle: {
    fontSize: ms(12),
    fontWeight: '800',
    color: Palette.textLight,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    marginBottom: ms(8),
    paddingLeft: ms(4),
  },

  // Details Cards
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    marginBottom: ms(20),
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(6) },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  listContent: {
    paddingVertical: ms(4),
    paddingHorizontal: ms(8),
  },
  listTitle: {
    fontSize: ms(14),
    fontWeight: '700',
    color: Palette.textDark,
  },
  listDesc: {
    fontSize: ms(12.5),
    color: Palette.textLight,
    fontWeight: '500',
    marginTop: ms(1),
  },
  divider: {
    backgroundColor: '#F1F5F9',
    height: ms(1),
  },

  // Sign out button
  signOutBtn: {
    borderRadius: ms(16),
    paddingVertical: ms(6),
    shadowColor: Palette.error,
    shadowOffset: { width: ms(0), height: ms(8) },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
    marginTop: ms(16),
  },
  btnLabel: {
    fontSize: ms(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default StaffProfileScreen;
