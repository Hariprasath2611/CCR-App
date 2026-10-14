import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Text,
  StatusBar,
  Modal,
} from 'react-native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { delegationApi, CoordinatorItem } from '@services/api/delegationApi';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { EditorialChip } from '@components/editorial/EditorialChip';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const ManageCoordinatorsScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [coordinators, setCoordinators] = useState<CoordinatorItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('3rd Year');

  // Modal State
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Success Credentials Modal State
  const [credentialsModalVisible, setCredentialsModalVisible] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password?: string; note?: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await delegationApi.fetchCoordinators();
      setCoordinators(data);
    } catch (err: any) {
      console.log('Error fetching coordinators:', err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAssign = (classId: string, currentCC?: any) => {
    setSelectedClassId(classId);
    if (currentCC) {
      setName(currentCC.name || '');
      setEmail(currentCC.email || '');
    } else {
      setName('');
      setEmail('');
    }
    setCustomPassword('');
    setAssignModalVisible(true);
  };

  const handleSaveCoordinator = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Required Fields', 'Please enter both Faculty Name and Institutional Email.');
      return;
    }

    try {
      setSubmitting(true);
      const result = await delegationApi.assignCoordinator({
        classId: selectedClassId,
        name: name.trim(),
        email: email.trim(),
        department: user?.department || 'Computer Science',
        password: customPassword.trim() || undefined,
      });

      setAssignModalVisible(false);
      setCreatedCredentials(result.credentials);
      setCredentialsModalVisible(true);
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || err.message || 'Failed to assign Class Coordinator.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = (classId: string) => {
    Alert.alert(
      'Remove Coordinator',
      `Are you sure you want to remove the Class Coordinator for ${classId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await delegationApi.removeCoordinator(classId);
              Alert.alert('Success', 'Class Coordinator removed successfully.');
              loadData();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to remove coordinator.');
            }
          },
        },
      ]
    );
  };

  const filteredCoordinators = coordinators.filter((c) => c.year === selectedYear);

  return (
    <View style={styles.screenWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor={EditorialColors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, EditorialSpacing.topSafeArea),
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Label text="FACULTY GOVERNANCE & ACCESS" />
          <Text style={styles.headerTitle}>
            COORDINATOR ACCESS<Text style={styles.accentDot}>.</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Assign Class Coordinators per section and generate verified login credentials.
          </Text>
        </View>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* Year Filter Chips */}
        <View style={styles.chipRow}>
          {YEARS.map((yr) => (
            <EditorialChip
              key={yr}
              label={yr.toUpperCase()}
              selected={selectedYear === yr}
              onPress={() => setSelectedYear(yr)}
            />
          ))}
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>
            {selectedYear.toUpperCase()} SECTIONS
          </Text>
          <Label text={`${filteredCoordinators.length} CLASSES`} />
        </View>

        {/* Coordinators List */}
        {loading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonBlock} />
          </View>
        ) : filteredCoordinators.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>NO CLASSES CONFIGURED</Text>
            <Text style={styles.emptySub}>
              No section entries registered for {selectedYear}.
            </Text>
          </View>
        ) : (
          <View style={styles.coordList}>
            {filteredCoordinators.map((item) => {
              const isAssigned = !!item.coordinator;
              return (
                <View key={item.classId} style={styles.coordRow}>
                  <View style={styles.rowTop}>
                    <View style={styles.infoCol}>
                      <View style={styles.codeRow}>
                        <Text style={styles.classCode}>{item.classId}</Text>
                        <View
                          style={[
                            styles.statusBadge,
                            !isAssigned ? styles.accentStatusBadge : null,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              !isAssigned ? styles.accentStatusText : null,
                            ]}
                          >
                            {isAssigned ? 'ASSIGNED' : 'UNASSIGNED'}
                          </Text>
                        </View>
                      </View>

                      {isAssigned ? (
                        <>
                          <Text style={styles.coordName}>{item.coordinator?.name}</Text>
                          <Label text={`EMAIL: ${item.coordinator?.email}`} style={styles.emailMeta} />
                        </>
                      ) : (
                        <Text style={styles.unassignedText}>
                          No coordinator currently assigned to compile reports.
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.rowActions}>
                    {isAssigned && (
                      <TouchableOpacity
                        style={styles.dangerOutlineBtn}
                        onPress={() => handleRemove(item.classId)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dangerOutlineBtnText}>REMOVE</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.primaryActionBtn}
                      onPress={() => handleOpenAssign(item.classId, item.coordinator)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.primaryActionBtnText}>
                        {isAssigned ? 'RE-ASSIGN CC' : 'ASSIGN CC'}
                      </Text>
                      <Feather name="arrow-right" size={14} color={EditorialColors.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Modal: Assign Coordinator */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={assignModalVisible}
          onRequestClose={() => setAssignModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  ASSIGN COORDINATOR<Text style={styles.accentDot}>.</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setAssignModalVisible(false)}
                  style={styles.modalCloseButton}
                  accessibilityLabel="Close modal"
                >
                  <Feather name="x" size={20} color={EditorialColors.ink} />
                </TouchableOpacity>
              </View>

              <Rule thickness="hairline" style={{ marginBottom: 16 }} />

              <Label text={`TARGET SECTION: ${selectedClassId}`} style={{ marginBottom: 14 }} />

              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>FACULTY FULL NAME</Text>
                <TextInput
                  style={styles.underlineInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Dr. Karuppaiya"
                  placeholderTextColor={EditorialColors.muted}
                />
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>INSTITUTIONAL EMAIL</Text>
                <TextInput
                  style={styles.underlineInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="e.g. faculty@jec.ac.in"
                  placeholderTextColor={EditorialColors.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>CUSTOM PASSWORD (OPTIONAL)</Text>
                <TextInput
                  style={styles.underlineInput}
                  value={customPassword}
                  onChangeText={setCustomPassword}
                  placeholder="Leave blank for auto-generated password"
                  placeholderTextColor={EditorialColors.muted}
                  secureTextEntry
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.outlineActionBtn}
                  onPress={() => setAssignModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.outlineActionBtnText}>CANCEL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleSaveCoordinator}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={EditorialColors.white} />
                  ) : (
                    <Text style={styles.modalSubmitBtnText}>SAVE & DISPATCH</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal: Credentials Dispatched */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={credentialsModalVisible}
          onRequestClose={() => setCredentialsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  CREDENTIALS READY<Text style={styles.accentDot}>.</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setCredentialsModalVisible(false)}
                  style={styles.modalCloseButton}
                  accessibilityLabel="Close modal"
                >
                  <Feather name="x" size={20} color={EditorialColors.ink} />
                </TouchableOpacity>
              </View>

              <Rule thickness="hairline" style={{ marginBottom: 16 }} />

              <Text style={styles.successMessage}>
                Class Coordinator successfully registered with executive reporting privileges.
              </Text>

              <View style={styles.credentialDetailsBox}>
                <View style={styles.credRow}>
                  <Text style={styles.credKey}>EMAIL</Text>
                  <Text style={styles.credVal}>{createdCredentials?.email}</Text>
                </View>
                {createdCredentials?.password && (
                  <View style={styles.credRow}>
                    <Text style={styles.credKey}>TEMPORARY PASSWORD</Text>
                    <Text style={styles.credVal}>{createdCredentials?.password}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => setCredentialsModalVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionText}>DONE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
  },
  content: {
    paddingHorizontal: EditorialSpacing.screenHorizontal,
  },
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: EditorialFonts.display,
    fontSize: 34,
    lineHeight: 38,
    color: EditorialColors.ink,
    letterSpacing: -0.5,
    marginTop: 4,
    marginBottom: 4,
  },
  accentDot: {
    color: EditorialColors.accent,
  },
  headerSubtitle: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
    lineHeight: 18,
  },
  heavySpacer: {
    marginVertical: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.ink,
  },
  coordList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
  },
  coordRow: {
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.ink,
    paddingVertical: 16,
  },
  rowTop: {
    marginBottom: 10,
  },
  infoCol: {
    width: '100%',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  classCode: {
    fontFamily: EditorialFonts.bold,
    fontSize: 13,
    letterSpacing: 1,
    color: EditorialColors.ink,
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  accentStatusBadge: {
    borderColor: EditorialColors.accent,
  },
  statusText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 9,
    letterSpacing: 1,
    color: EditorialColors.ink,
  },
  accentStatusText: {
    color: EditorialColors.accent,
  },
  coordName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 17,
    lineHeight: 22,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  emailMeta: {
    letterSpacing: 1.5,
  },
  unassignedText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    color: EditorialColors.muted,
    lineHeight: 18,
    marginTop: 2,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  dangerOutlineBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: EditorialColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerOutlineBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.accent,
  },
  primaryActionBtn: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.white,
  },
  skeletonContainer: {
    gap: 12,
    paddingVertical: 16,
  },
  skeletonBlock: {
    height: 90,
    backgroundColor: EditorialColors.track,
  },
  emptyContainer: {
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 14,
    letterSpacing: 2,
    color: EditorialColors.ink,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 17, 17, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: EditorialColors.bg,
    borderWidth: 2,
    borderColor: EditorialColors.ink,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: EditorialFonts.display,
    fontSize: 18,
    color: EditorialColors.ink,
    letterSpacing: 0.5,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
  },
  inputBlock: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
    marginBottom: 6,
  },
  underlineInput: {
    height: 44,
    borderBottomWidth: 2,
    borderBottomColor: EditorialColors.ink,
    fontFamily: EditorialFonts.semibold,
    fontSize: 15,
    color: EditorialColors.ink,
    paddingVertical: 6,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  outlineActionBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineActionBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
  },
  modalSubmitBtn: {
    flex: 1,
    height: 48,
    backgroundColor: EditorialColors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 1.5,
    color: EditorialColors.white,
  },
  successMessage: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    color: EditorialColors.ink,
    lineHeight: 18,
    marginBottom: 16,
  },
  credentialDetailsBox: {
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    padding: 14,
    marginBottom: 20,
    backgroundColor: EditorialColors.bg,
  },
  credRow: {
    marginBottom: 10,
  },
  credKey: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 10,
    letterSpacing: 1.5,
    color: EditorialColors.muted,
    marginBottom: 2,
  },
  credVal: {
    fontFamily: EditorialFonts.bold,
    fontSize: 14,
    color: EditorialColors.ink,
  },
  primaryActionButton: {
    height: 54,
    width: '100%',
    backgroundColor: EditorialColors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.white,
  },
});
