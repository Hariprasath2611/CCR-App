import React, { useState } from 'react';
import { Alert, StyleSheet, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { Feather } from '@expo/vector-icons';
import { DEPARTMENTS } from './DeptSummaryScreen';
import { apiClient } from '@services/api/apiClient';
import {
  DayRibbonColors,
  DayRibbonFonts,
  DayRibbonShapes,
  DayRibbonSpacing,
} from '@theme/dayRibbon';
import {
  EditorialButton,
  EditorialTextField,
} from '@components/editorial';
import { ms } from '@theme/responsive';

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={styles.headerBox}>
        <Text style={styles.captionText}>INSTITUTIONAL DOSSIER</Text>
        <Text style={styles.headingText}>Executive Profile</Text>
        <Text style={styles.subHeadingText}>
          Principal credentials & institutional oversight
        </Text>
      </View>

      {/* ── PROFILE IDENTIFICATION CARD ── */}
      <View style={styles.profileBox}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{getInitials(user?.name || 'Dr. Ramesh')}</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.principalName}>{user?.name || 'Dr. Ramesh'}</Text>
            <View style={styles.badgeWrapper}>
              <View style={styles.designationBadge}>
                <Text style={styles.designationBadgeText}>Principal & Head of Institution</Text>
              </View>
            </View>
            <Text style={styles.collegeText}>Jaya Engineering College</Text>
          </View>
        </View>
      </View>

      {/* ── SECTION 1: INSTITUTIONAL OVERSIGHT ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Institutional Oversight</Text>
      </View>

      <View style={styles.detailCard}>
        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>OFFICIAL POSITION</Text>
            <Text style={styles.detailValue}>Principal / Chief Administrator</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>ASSIGNED DIVISION</Text>
            <Text style={styles.detailValue}>College Administration & Management</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>SUPERVISED DEPARTMENTS</Text>
            <Text style={styles.detailValue}>{DEPARTMENTS.length} Academic Departments Under Purview</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>OFFICIAL IDENTIFIER</Text>
            <Text style={styles.detailValueMono}>JEC-PRIN-2026-01</Text>
          </View>
        </View>
      </View>

      {/* ── SECTION 2: SYSTEM & SECURITY ── */}
      <View style={[styles.sectionHeader, { marginTop: ms(20) }]}>
        <Text style={styles.sectionTitle}>System & Security</Text>
      </View>

      <View style={styles.detailCard}>
        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>REGISTERED EMAIL</Text>
            <Text style={styles.detailValue}>{user?.email || 'principal@jec.ac.in'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>PRIVILEGE ROLE</Text>
            <Text style={styles.detailValue}>ADMIN / PRINCIPAL</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>AUTHENTICATION STATE</Text>
            <Text style={styles.detailValue}>Secure (Principal Verified)</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.detailRowClickable}
          activeOpacity={0.7}
          onPress={() => setChangePasswordVisible(true)}
        >
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>PASSWORD ACCESS</Text>
            <Text style={styles.detailValue}>Update Account Password</Text>
          </View>
          <Feather name="arrow-right" size={18} color={DayRibbonColors.ink} />
        </TouchableOpacity>
      </View>

      {/* ── SIGN OUT ACTION ── */}
      <View style={styles.signOutBox}>
        <EditorialButton
          title="Sign Out of Session"
          variant="danger"
          fullWidth
          onPress={logout}
          rightIcon={<Feather name="log-out" size={16} color={DayRibbonColors.warn} />}
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
            <Text style={styles.captionText}>CREDENTIAL UPDATE</Text>
            <Text style={styles.modalTitle}>Change Password</Text>

            <View style={{ marginTop: ms(12) }}>
              <EditorialTextField
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                containerStyle={{ marginBottom: ms(12) }}
              />

              <EditorialTextField
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                containerStyle={{ marginBottom: ms(12) }}
              />

              <EditorialTextField
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                containerStyle={{ marginBottom: ms(20) }}
              />
            </View>

            <View style={styles.modalActions}>
              <View style={{ flex: 1 }}>
                <EditorialButton
                  title="Cancel"
                  variant="outline"
                  onPress={() => {
                    setChangePasswordVisible(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <EditorialButton
                  title="Update"
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
    backgroundColor: DayRibbonColors.bg,
  },
  content: {
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
    paddingTop: DayRibbonSpacing.screenTop,
    paddingBottom: ms(48),
  },
  headerBox: {
    marginBottom: ms(16),
  },
  captionText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headingText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(26),
    color: DayRibbonColors.ink,
    marginTop: ms(4),
  },
  subHeadingText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    color: DayRibbonColors.muted,
    marginTop: ms(4),
  },
  profileBox: {
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusCard,
    padding: ms(16),
    marginBottom: ms(16),
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(14),
  },
  avatarInitials: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(22),
    color: DayRibbonColors.cobalt,
  },
  avatarInfo: {
    flex: 1,
  },
  principalName: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(19),
    color: DayRibbonColors.ink,
    marginBottom: ms(4),
  },
  badgeWrapper: {
    flexDirection: 'row',
    marginBottom: ms(4),
  },
  designationBadge: {
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusChip,
    backgroundColor: DayRibbonColors.bg,
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
  },
  designationBadgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(10),
    color: DayRibbonColors.cobalt,
  },
  collegeText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(11),
    color: DayRibbonColors.muted,
  },
  sectionHeader: {
    marginBottom: ms(10),
  },
  sectionTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(13),
    color: DayRibbonColors.ink,
  },
  detailCard: {
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusCard,
    overflow: 'hidden',
  },
  detailRow: {
    paddingHorizontal: ms(16),
    paddingVertical: ms(14),
  },
  detailRowClickable: {
    paddingHorizontal: ms(16),
    paddingVertical: ms(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DayRibbonColors.surface,
  },
  detailLeft: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(10),
    color: DayRibbonColors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: ms(2),
  },
  detailValue: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: ms(14),
    color: DayRibbonColors.ink,
  },
  detailValueMono: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(14),
    color: DayRibbonColors.cobalt,
  },
  divider: {
    height: 1,
    backgroundColor: DayRibbonColors.line,
  },
  signOutBox: {
    marginTop: ms(24),
  },
  modalContainer: {
    padding: ms(20),
  },
  modalCard: {
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.radiusCard,
    padding: ms(20),
  },
  modalTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(20),
    color: DayRibbonColors.ink,
    marginTop: ms(4),
    marginBottom: ms(4),
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
  },
});

export default PrincipalProfileScreen;
