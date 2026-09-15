import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Portal,
  Modal,
  TextInput,
  Badge,
  Divider,
  Avatar,
} from 'react-native-paper';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { delegationApi, CoordinatorItem } from '@services/api/delegationApi';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ms } from '@theme/responsive';

const { width } = Dimensions.get('window');

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const ManageCoordinatorsScreen = () => {
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
      // Fallback local list if offline/demo
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── HEADER CARD ── */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="account-tie" size={28} color={Palette.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Class Coordinators</Text>
            <Text style={styles.headerSubtitle}>
              {user?.department || 'Department'} • Delegation & Credentials
            </Text>
          </View>
        </View>
      </Card>

      {/* ── YEAR SELECTOR TABS ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {YEARS.map((year) => {
          const isSelected = selectedYear === year;
          return (
            <TouchableOpacity
              key={year}
              style={[styles.yearTab, isSelected && styles.yearTabActive]}
              onPress={() => setSelectedYear(year)}
            >
              <Text style={[styles.yearTabText, isSelected && styles.yearTabTextActive]}>
                {year}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── CLASS SECTIONS LIST ── */}
      {loading ? (
        <ActivityIndicator size="large" color={Palette.primary} style={{ marginTop: 40 }} />
      ) : filteredCoordinators.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="info" size={32} color={Palette.textSecondary} />
          <Text style={styles.emptyText}>No sections found for {selectedYear}.</Text>
        </View>
      ) : (
        filteredCoordinators.map((item) => {
          const isAssigned = !!item.coordinator;
          return (
            <Card key={item.classId} style={styles.classCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.className}>{item.name}</Text>
                  <Text style={styles.classCode}>{item.classId}</Text>
                </View>
                <Badge
                  style={[
                    styles.statusBadge,
                    { backgroundColor: isAssigned ? '#E8F5E9' : '#FFF3E0' },
                  ]}
                >
                  <Text style={{ color: isAssigned ? '#2E7D32' : '#E65100', fontWeight: 'bold' }}>
                    {isAssigned ? 'Assigned' : 'Unassigned'}
                  </Text>
                </Badge>
              </View>

              <Divider style={styles.divider} />

              {isAssigned ? (
                <View style={styles.coordinatorInfo}>
                  <Avatar.Text
                    size={42}
                    label={item.coordinator?.name ? item.coordinator.name.substring(0, 2).toUpperCase() : 'CC'}
                    style={{ backgroundColor: Palette.primaryLight }}
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.coordinatorName}>{item.coordinator?.name}</Text>
                    <Text style={styles.coordinatorEmail}>{item.coordinator?.email}</Text>
                    <Text style={styles.coordinatorDept}>{item.coordinator?.department}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.unassignedBox}>
                  <Feather name="alert-circle" size={18} color="#E65100" />
                  <Text style={styles.unassignedText}>
                    No Class Coordinator assigned. Assign a faculty to coordinate this section.
                  </Text>
                </View>
              )}

              <View style={styles.cardActions}>
                <Button
                  mode="contained"
                  icon="account-edit"
                  style={styles.actionBtn}
                  buttonColor={Palette.primary}
                  onPress={() => handleOpenAssign(item.classId, item.coordinator)}
                >
                  {isAssigned ? 'Change CC' : 'Assign CC'}
                </Button>
                {isAssigned && (
                  <Button
                    mode="outlined"
                    textColor="#D32F2F"
                    style={styles.removeBtn}
                    onPress={() => handleRemove(item.classId)}
                  >
                    Remove
                  </Button>
                )}
              </View>
            </Card>
          );
        })
      )}

      {/* ── ASSIGN / EDIT MODAL ── */}
      <Portal>
        <Modal
          visible={assignModalVisible}
          onDismiss={() => setAssignModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Assign Class Coordinator</Text>
          <Text style={styles.modalSubtitle}>Section: {selectedClassId}</Text>

          <TextInput
            label="Faculty Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            placeholder="e.g. Dr. Ramesh Kumar"
            style={styles.input}
          />

          <TextInput
            label="Institutional Email *"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="e.g. ramesh.cse@jec.com"
            style={styles.input}
          />

          <TextInput
            label="Custom Password (Optional)"
            value={customPassword}
            onChangeText={setCustomPassword}
            mode="outlined"
            secureTextEntry
            placeholder="Default: JEC@CC2026"
            style={styles.input}
          />

          <View style={styles.modalButtons}>
            <Button
              mode="text"
              onPress={() => setAssignModalVisible(false)}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveCoordinator}
              loading={submitting}
              disabled={submitting}
              buttonColor={Palette.primary}
            >
              Generate & Assign
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* ── CREDENTIALS SUCCESS MODAL ── */}
      <Portal>
        <Modal
          visible={credentialsModalVisible}
          onDismiss={() => setCredentialsModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <MaterialCommunityIcons name="check-decagram" size={48} color="#2E7D32" />
            <Text style={styles.modalTitle}>Coordinator Assigned!</Text>
          </View>

          <Card style={styles.credCard}>
            <Text style={styles.credLabel}>Login Email:</Text>
            <Text style={styles.credValue}>{createdCredentials?.email}</Text>

            {createdCredentials?.password ? (
              <>
                <Text style={[styles.credLabel, { marginTop: 10 }]}>Temporary Password:</Text>
                <Text style={styles.credValue}>{createdCredentials.password}</Text>
              </>
            ) : (
              <Text style={{ marginTop: 8, color: Palette.textSecondary, fontStyle: 'italic' }}>
                {createdCredentials?.note || 'Account linked to existing password.'}
              </Text>
            )}
          </Card>

          <Button
            mode="contained"
            buttonColor={Palette.primary}
            style={{ marginTop: 16 }}
            onPress={() => setCredentialsModalVisible(false)}
          >
            Done
          </Button>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  yearTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  yearTabActive: {
    backgroundColor: Palette.primary,
  },
  yearTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  yearTabTextActive: {
    color: '#FFFFFF',
  },
  classCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  className: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  classCode: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  divider: {
    marginVertical: 12,
  },
  coordinatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  coordinatorName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  coordinatorEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 1,
  },
  coordinatorDept: {
    fontSize: 12,
    color: Palette.primary,
    marginTop: 2,
  },
  unassignedBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    alignItems: 'center',
  },
  unassignedText: {
    fontSize: 12,
    color: '#9A3412',
    marginLeft: 8,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionBtn: {
    borderRadius: 10,
  },
  removeBtn: {
    borderRadius: 10,
    borderColor: '#FFCDD2',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    color: Palette.primary,
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  credCard: {
    backgroundColor: '#F1F5F9',
    padding: 14,
    borderRadius: 12,
  },
  credLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  credValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 14,
  },
});
