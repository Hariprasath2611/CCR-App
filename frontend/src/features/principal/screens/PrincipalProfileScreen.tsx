import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Avatar, Button, Divider, List } from 'react-native-paper';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { DEPARTMENTS } from './DeptSummaryScreen';

export const PrincipalProfileScreen = () => {
  const { user, logout } = useAuthStore();

  const getInitials = (name?: string) => {
    if (!name) return 'PR';
    return name
      .split(' ')
      .filter((w) => w.length > 0)
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
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
              label={getInitials(user?.name || 'Dr. Ramesh')}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            {/* Soft Camera Badge */}
            <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.7}>
              <Feather name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.principalName}>{user?.name || 'Dr. Ramesh'}</Text>
          <Text style={styles.designationText}>Principal & Head of Institution</Text>
          <Text style={styles.collegeText}>Jaya Engineering College</Text>
        </Card.Content>
      </Card>

      {/* ── INSTITUTION DETAILS INFO ── */}
      <Text style={styles.sectionTitle}>Institutional Info</Text>
      <Card style={styles.detailsCard}>
        <Card.Content style={styles.listContent}>
          <List.Item
            title="Institutional Position"
            description="Principal / Administrator"
            left={(props) => <List.Icon {...props} icon="shield-crown" color={Palette.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDesc}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Assigned Division"
            description="College Administration & Management"
            left={(props) => <List.Icon {...props} icon="office-building" color={Palette.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDesc}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Total Supervised Departments"
            description={`${DEPARTMENTS.length} Academic Departments`}
            left={(props) => <List.Icon {...props} icon="card-bulleted-settings-outline" color={Palette.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDesc}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Official ID"
            description="JEC-PRIN-2026-01"
            left={(props) => <List.Icon {...props} icon="card-account-details" color={Palette.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDesc}
          />
        </Card.Content>
      </Card>

      {/* ── ACCOUNT / SECURITY INFO ── */}
      <Text style={styles.sectionTitle}>System & Security</Text>
      <Card style={styles.detailsCard}>
        <Card.Content style={styles.listContent}>
          <List.Item
            title="Registered Email Address"
            description={user?.email || 'principal@jec.ac.in'}
            left={(props) => <List.Icon {...props} icon="email-outline" color={Palette.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDesc}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Privilege Access Role"
            description="ADMIN / PRINCIPAL"
            left={(props) => <List.Icon {...props} icon="key-chain" color={Palette.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDesc}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Authentication State"
            description="Secure (Principal Access Verified)"
            left={(props) => <List.Icon {...props} icon="security" color={Palette.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDesc}
          />
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: Palette.primary,
    elevation: 3,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarLabel: {
    fontWeight: '800',
    color: '#FFFFFF',
    fontSize: 34,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Palette.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    elevation: 2,
  },
  principalName: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.textDark,
  },
  designationText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.primary,
    marginTop: 4,
  },
  collegeText: {
    fontSize: 12,
    color: Palette.textLight,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.textLight,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
  },
  listContent: {
    paddingVertical: 4,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.textDark,
  },
  listDesc: {
    fontSize: 12.5,
    color: Palette.textLight,
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    backgroundColor: '#F1F5F9',
    height: 1,
  },
  signOutBtn: {
    borderRadius: 14,
    marginTop: 10,
    paddingVertical: 4,
    shadowColor: Palette.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  btnLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default PrincipalProfileScreen;
