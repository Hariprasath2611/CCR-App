import React, { useState } from 'react';
import { Alert, StyleSheet, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { Feather } from '@expo/vector-icons';
import { DEPARTMENTS } from './DeptSummaryScreen';
import { apiClient } from '@services/api/apiClient';
import {
  EditorialColors,
  EditorialFonts,
  EditorialSpacing,
} from '@theme/editorial';
import {
  EditorialHeader,
  Rule,
  Label,
  EditorialButton,
  EditorialTextField,
} from '@components/editorial';

export const PrincipalProfileScreen = () => {
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
      <EditorialHeader
        eyebrow="INSTITUTIONAL DOSSIER"
        title="EXECUTIVE PROFILE"
        subtitle="Principal credentials & institutional oversight"
      />

      {/* ── PROFILE IDENTIFICATION CARD ── */}
      <View style={styles.profileBox}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarSquare}>
            <Text style={styles.avatarInitials}>{getInitials(user?.name || 'Dr. Ramesh')}</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.principalName}>{user?.name || 'Dr. Ramesh'}</Text>
            <View style={styles.badgeWrapper}>
              <View style={styles.designationBadge}>
                <Text style={styles.designationBadgeText}>PRINCIPAL & HEAD OF INSTITUTION</Text>
              </View>
            </View>
            <Text style={styles.collegeText}>JAYA ENGINEERING COLLEGE</Text>
          </View>
        </View>
      </View>

      {/* ── SECTION 1: INSTITUTIONAL OVERSIGHT ── */}
      <View style={styles.sectionHeader}>
        <Label text="INSTITUTIONAL OVERSIGHT" variant="dark" />
      </View>
      <Rule thickness={4} color={EditorialColors.ink} style={{ marginBottom: EditorialSpacing.md }} />

      <View style={styles.detailCard}>
        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>OFFICIAL POSITION</Text>
            <Text style={styles.detailValue}>Principal / Chief Administrator</Text>
          </View>
        </View>

        <Rule thickness={1} color={EditorialColors.track} />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>ASSIGNED DIVISION</Text>
            <Text style={styles.detailValue}>College Administration & Management</Text>
          </View>
        </View>

        <Rule thickness={1} color={EditorialColors.track} />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>SUPERVISED DEPARTMENTS</Text>
            <Text style={styles.detailValue}>{DEPARTMENTS.length} Academic Departments Under Purview</Text>
          </View>
        </View>

        <Rule thickness={1} color={EditorialColors.track} />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>OFFICIAL IDENTIFIER</Text>
            <Text style={styles.detailValueMono}>JEC-PRIN-2026-01</Text>
          </View>
        </View>
      </View>

      {/* ── SECTION 2: SYSTEM & SECURITY ── */}
      <View style={[styles.sectionHeader, { marginTop: EditorialSpacing.xl }]}>
        <Label text="SYSTEM & SECURITY" variant="dark" />
      </View>
      <Rule thickness={4} color={EditorialColors.ink} style={{ marginBottom: EditorialSpacing.md }} />

      <View style={styles.detailCard}>
        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>REGISTERED EMAIL</Text>
            <Text style={styles.detailValue}>{user?.email || 'principal@jec.ac.in'}</Text>
          </View>
        </View>

        <Rule thickness={1} color={EditorialColors.track} />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>PRIVILEGE ROLE</Text>
            <Text style={styles.detailValue}>ADMIN / PRINCIPAL</Text>
          </View>
        </View>

        <Rule thickness={1} color={EditorialColors.track} />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>AUTHENTICATION STATE</Text>
            <Text style={styles.detailValue}>SECURE (PRINCIPAL VERIFIED)</Text>
          </View>
        </View>

        <Rule thickness={1} color={EditorialColors.track} />

        <TouchableOpacity
          style={styles.detailRowClickable}
          activeOpacity={0.7}
          onPress={() => setChangePasswordVisible(true)}
        >
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>PASSWORD ACCESS</Text>
            <Text style={styles.detailValue}>Update Account Password</Text>
          </View>
          <Feather name="arrow-right" size={18} color={EditorialColors.ink} />
        </TouchableOpacity>
      </View>

      {/* ── SIGN OUT ACTION ── */}
      <View style={{ marginTop: EditorialSpacing.xl }}>
        <EditorialButton
          title="SIGN OUT OF SESSION"
          variant="outline"
          fullWidth
          onPress={logout}
          rightIcon={<Feather name="log-out" size={16} color={EditorialColors.ink} />}
        />
      </View>

      {/* ── CHANGE PASSWORD MODAL ── */}
      <Portal>
        <Modal
          visible={changePasswordVisible}
          onDismiss={() => {
            setChangePasswordVisible(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalCard}>
            <Label text="CREDENTIAL UPDATE" variant="dark" />
            <Text style={styles.modalTitle}>CHANGE PASSWORD</Text>
            <Rule thickness={2} color={EditorialColors.ink} style={{ marginBottom: EditorialSpacing.lg }} />

            <EditorialTextField
              label="CURRENT PASSWORD"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              containerStyle={{ marginBottom: EditorialSpacing.md }}
            />

            <EditorialTextField
              label="NEW PASSWORD"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              containerStyle={{ marginBottom: EditorialSpacing.md }}
            />

            <EditorialTextField
              label="CONFIRM NEW PASSWORD"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              containerStyle={{ marginBottom: EditorialSpacing.xl }}
            />

            <View style={styles.modalActions}>
              <View style={{ flex: 1, marginRight: EditorialSpacing.sm }}>
                <EditorialButton
                  title="CANCEL"
                  variant="outline"
                  onPress={() => {
                    setChangePasswordVisible(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                />
              </View>
              <View style={{ flex: 1, marginLeft: EditorialSpacing.sm }}>
                <EditorialButton
                  title="UPDATE"
                  variant="primary"
                  loading={submitting}
                  disabled={submitting}
                  onPress={handleChangePassword}
                />
              </View>
            </View>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
  },
  content: {
    padding: EditorialSpacing.lg,
    paddingBottom: EditorialSpacing.xxxl,
  },
  profileBox: {
    backgroundColor: EditorialColors.white,
    borderWidth: 2,
    borderColor: EditorialColors.ink,
    borderRadius: 0,
    padding: EditorialSpacing.lg,
    marginBottom: EditorialSpacing.xl,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSquare: {
    width: 72,
    height: 72,
    borderWidth: 2,
    borderColor: EditorialColors.ink,
    backgroundColor: EditorialColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: EditorialSpacing.md,
  },
  avatarInitials: {
    fontFamily: EditorialFonts.bold,
    fontSize: 26,
    color: EditorialColors.ink,
  },
  avatarInfo: {
    flex: 1,
  },
  principalName: {
    fontFamily: EditorialFonts.bold,
    fontSize: 18,
    color: EditorialColors.ink,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  badgeWrapper: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  designationBadge: {
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    backgroundColor: EditorialColors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  designationBadgeText: {
    fontFamily: EditorialFonts.bold,
    fontSize: 10,
    color: EditorialColors.ink,
    letterSpacing: 0.5,
  },
  collegeText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 11,
    color: EditorialColors.muted,
    letterSpacing: 0.6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailCard: {
    backgroundColor: EditorialColors.white,
    borderWidth: 1,
    borderColor: EditorialColors.track,
    borderRadius: 0,
  },
  detailRow: {
    paddingHorizontal: EditorialSpacing.md,
    paddingVertical: EditorialSpacing.md,
  },
  detailRowClickable: {
    paddingHorizontal: EditorialSpacing.md,
    paddingVertical: EditorialSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: EditorialColors.white,
  },
  detailLeft: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: EditorialFonts.bold,
    fontSize: 10,
    color: EditorialColors.muted,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  detailValue: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 14,
    color: EditorialColors.ink,
  },
  detailValueMono: {
    fontFamily: EditorialFonts.bold,
    fontSize: 14,
    color: EditorialColors.ink,
    letterSpacing: 0.5,
  },
  modalContainer: {
    padding: EditorialSpacing.lg,
  },
  modalCard: {
    backgroundColor: EditorialColors.white,
    borderWidth: 2,
    borderColor: EditorialColors.ink,
    borderRadius: 0,
    padding: EditorialSpacing.xl,
  },
  modalTitle: {
    fontFamily: EditorialFonts.bold,
    fontSize: 18,
    color: EditorialColors.ink,
    marginTop: 6,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default PrincipalProfileScreen;
