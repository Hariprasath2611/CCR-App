import React, { useState } from 'react';
import { Alert, StyleSheet, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { Feather } from '@expo/vector-icons';
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={styles.headerBox}>
        <Text style={styles.captionText}>PERSONNEL DOSSIER</Text>
        <Text style={styles.headingText}>Faculty Profile</Text>
        <Text style={styles.subHeadingText}>
          Institutional credentials & access privileges
        </Text>
      </View>

      {/* ── PROFILE IDENTIFICATION CARD ── */}
      <View style={styles.profileBox}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{getInitials(user?.name)}</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.facultyName}>{user?.name || 'Faculty Member'}</Text>
            <View style={styles.badgeWrapper}>
              <View style={styles.designationBadge}>
                <Text style={styles.designationBadgeText}>{getDesignation()}</Text>
              </View>
            </View>
            <Text style={styles.collegeText}>Jaya Engineering College</Text>
          </View>
        </View>
      </View>

      {/* ── SECTION 1: INSTITUTIONAL RECORD ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Institutional Record</Text>
      </View>

      <View style={styles.detailCard}>
        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>FACULTY POSITION</Text>
            <Text style={styles.detailValue}>{getDesignation()}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>DEPARTMENT</Text>
            <Text style={styles.detailValue}>{user?.department || 'Computer Science Engineering'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>IDENTIFICATION ID</Text>
            <Text style={styles.detailValueMono}>{getMockFacultyId()}</Text>
          </View>
        </View>

        {user?.isClassCoordinator && (
          <>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>CLASS COORDINATION</Text>
                <Text style={styles.detailValue}>Assigned In-charge: Class {user.assignedClassId || 'CSE-B'}</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* ── SECTION 2: SECURITY & CREDENTIALS ── */}
      <View style={[styles.sectionHeader, { marginTop: ms(20) }]}>
        <Text style={styles.sectionTitle}>Security & Credentials</Text>
      </View>

      <View style={styles.detailCard}>
        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>EMAIL ADDRESS</Text>
            <Text style={styles.detailValue}>{user?.email || 'faculty@college.com'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>ACCOUNT PRIVILEGE</Text>
            <Text style={styles.detailValue}>{user?.role || 'STAFF'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Text style={styles.detailLabel}>SESSION STATUS</Text>
            <Text style={styles.detailValue}>Active (Device Verified)</Text>
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
  facultyName: {
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

export default StaffProfileScreen;
