import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
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
import { delegationApi, SubjectAllocationItem } from '@services/api/delegationApi';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// Default subjects catalog for common classes if not seeded in timetable
const DEFAULT_CLASS_SUBJECTS: Record<string, { code: string; name: string }[]> = {
  default: [
    { code: 'CS3591', name: 'Computer Networks' },
    { code: 'CS3501', name: 'Compiler Design' },
    { code: 'CS3551', name: 'Distributed Computing' },
    { code: 'CS3511', name: 'Cryptology and Cyber Security' },
    { code: 'CCS356', name: 'Object Oriented Software Engineering' },
  ],
};

export const FacultyAllocationScreen = () => {
  const { user } = useAuthStore();
  const classId = user?.assignedClassId || '3rd Year CSE-A';

  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<SubjectAllocationItem[]>([]);
  const [subjectsList, setSubjectsList] = useState<{ code: string; name: string }[]>([]);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<{ code: string; name: string } | null>(null);
  const [tab, setTab] = useState<'existing' | 'new'>('existing');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // New Faculty State
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyEmail, setNewFacultyEmail] = useState('');
  const [newFacultyDept, setNewFacultyDept] = useState(user?.department || 'Computer Science');
  const [submitting, setSubmitting] = useState(false);

  // Credentials Result Modal
  const [credModalVisible, setCredModalVisible] = useState(false);
  const [credInfo, setCredInfo] = useState<{ email: string; password?: string; note?: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await delegationApi.fetchClassAllocations(classId);
      setAllocations(res.assignments || []);

      if (res.timetableSubjects && res.timetableSubjects.length > 0) {
        setSubjectsList(
          res.timetableSubjects.map((s: any) => ({ code: s.subjectCode, name: s.subjectName }))
        );
      } else {
        setSubjectsList(DEFAULT_CLASS_SUBJECTS.default);
      }
    } catch (err: any) {
      console.log('Error loading class allocations:', err?.message);
      setSubjectsList(DEFAULT_CLASS_SUBJECTS.default);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await delegationApi.searchFaculty(text);
      setSearchResults(results || []);
    } catch (err) {
      console.log('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleOpenAssignModal = (subject: { code: string; name: string }) => {
    setSelectedSubject(subject);
    setTab('existing');
    setSearchQuery('');
    setSearchResults([]);
    setNewFacultyName('');
    setNewFacultyEmail('');
    setModalVisible(true);
  };

  const handleAllocateExisting = async (faculty: any) => {
    if (!selectedSubject) return;

    try {
      setSubmitting(true);
      const res = await delegationApi.allocateSubject({
        classId,
        subjectCode: selectedSubject.code,
        subjectName: selectedSubject.name,
        facultyEmail: faculty.email,
        facultyName: faculty.name,
        department: faculty.department,
      });

      setModalVisible(false);
      setCredInfo(res.credentials);
      setCredModalVisible(true);
      loadData();
    } catch (err: any) {
      Alert.alert('Allocation Error', err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAndAllocate = async () => {
    if (!selectedSubject) return;
    if (!newFacultyName.trim() || !newFacultyEmail.trim()) {
      Alert.alert('Validation', 'Please enter Faculty Name and Email.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await delegationApi.allocateSubject({
        classId,
        subjectCode: selectedSubject.code,
        subjectName: selectedSubject.name,
        facultyEmail: newFacultyEmail.trim(),
        facultyName: newFacultyName.trim(),
        department: newFacultyDept.trim(),
      });

      setModalVisible(false);
      setCredInfo(res.credentials);
      setCredModalVisible(true);
      loadData();
    } catch (err: any) {
      Alert.alert('Creation Error', err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAllocation = (assignmentId: string, subjectCode: string) => {
    Alert.alert(
      'Remove Faculty Allocation',
      `Unassign faculty from subject ${subjectCode}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unassign',
          style: 'destructive',
          onPress: async () => {
            try {
              await delegationApi.removeAllocation(assignmentId);
              loadData();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── CLASS HEADER ── */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="google-classroom" size={28} color={Palette.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Subject Allocation</Text>
            <Text style={styles.headerSubtitle}>
              Class Section: <Text style={{ fontWeight: 'bold' }}>{classId}</Text>
            </Text>
          </View>
        </View>
      </Card>

      {/* ── SUBJECT ALLOCATIONS LIST ── */}
      <Text style={styles.sectionTitle}>Curriculum Subjects & Faculty Mappings</Text>

      {loading ? (
        <ActivityIndicator size="large" color={Palette.primary} style={{ marginTop: 40 }} />
      ) : (
        subjectsList.map((subject) => {
          const currentAssignment = allocations.find((a) => a.subjectCode === subject.code);
          const hasFaculty = !!currentAssignment;

          return (
            <Card key={subject.code} style={styles.subjectCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subjectCode}>{subject.code}</Text>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                </View>
                <Badge
                  style={[
                    styles.badge,
                    {
                      backgroundColor: hasFaculty ? '#E8F5E9' : '#FFF3E0',
                      color: hasFaculty ? '#2E7D32' : '#E65100',
                    },
                  ]}
                >
                  {hasFaculty ? 'Allocated' : 'Not Allocated'}
                </Badge>
              </View>

              <Divider style={styles.divider} />

              {hasFaculty ? (
                <View style={styles.facultyRow}>
                  <Avatar.Text
                    size={38}
                    label={currentAssignment.faculty.name.substring(0, 2).toUpperCase()}
                    style={{ backgroundColor: Palette.accent }}
                  />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.facultyName}>{currentAssignment.faculty.name}</Text>
                    <Text style={styles.facultyEmail}>{currentAssignment.faculty.email}</Text>
                    <Text style={styles.facultyDept}>{currentAssignment.faculty.department}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.noFacultyBox}>
                  <Feather name="alert-circle" size={16} color="#E65100" />
                  <Text style={styles.noFacultyText}>No faculty assigned to teach this subject yet.</Text>
                </View>
              )}

              <View style={styles.cardActions}>
                <Button
                  mode="contained"
                  buttonColor={Palette.primary}
                  style={styles.actionBtn}
                  onPress={() => handleOpenAssignModal(subject)}
                >
                  {hasFaculty ? 'Reassign Teacher' : 'Assign Teacher'}
                </Button>
                {hasFaculty && (
                  <Button
                    mode="outlined"
                    textColor="#D32F2F"
                    style={styles.removeBtn}
                    onPress={() => handleRemoveAllocation(currentAssignment.id, subject.code)}
                  >
                    Unassign
                  </Button>
                )}
              </View>
            </Card>
          );
        })
      )}

      {/* ── ASSIGN FACULTY MODAL ── */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Assign Faculty</Text>
          <Text style={styles.modalSubtitle}>
            {selectedSubject?.code} - {selectedSubject?.name}
          </Text>

          {/* TAB SWITCHER */}
          <View style={styles.modalTabs}>
            <TouchableOpacity
              style={[styles.modalTab, tab === 'existing' && styles.modalTabActive]}
              onPress={() => setTab('existing')}
            >
              <Text style={[styles.modalTabText, tab === 'existing' && styles.modalTabTextActive]}>
                Existing Faculty
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalTab, tab === 'new' && styles.modalTabActive]}
              onPress={() => setTab('new')}
            >
              <Text style={[styles.modalTabText, tab === 'new' && styles.modalTabTextActive]}>
                New Faculty
              </Text>
            </TouchableOpacity>
          </View>

          {tab === 'existing' ? (
            <View>
              <TextInput
                label="Search faculty by Name or Email"
                value={searchQuery}
                onChangeText={handleSearch}
                mode="outlined"
                placeholder="Type to search..."
                style={{ backgroundColor: 'white', marginBottom: 10 }}
                right={<TextInput.Icon icon="magnify" />}
              />

              {searching && <ActivityIndicator size="small" color={Palette.primary} style={{ marginVertical: 10 }} />}

              <ScrollView style={{ maxHeight: 200 }}>
                {searchResults.map((faculty) => (
                  <TouchableOpacity
                    key={faculty.id}
                    style={styles.searchResultItem}
                    onPress={() => handleAllocateExisting(faculty)}
                  >
                    <Avatar.Text
                      size={34}
                      label={faculty.name.substring(0, 2).toUpperCase()}
                      style={{ backgroundColor: Palette.accent }}
                    />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.searchName}>{faculty.name}</Text>
                      <Text style={styles.searchEmail}>{faculty.email}</Text>
                      <Text style={styles.searchDept}>{faculty.department}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={Palette.primary} />
                  </TouchableOpacity>
                ))}
                {searchQuery.length > 0 && searchResults.length === 0 && !searching && (
                  <Text style={{ textAlign: 'center', color: '#64748B', marginVertical: 10 }}>
                    No faculty found. Switch to "New Faculty" tab to register.
                  </Text>
                )}
              </ScrollView>
            </View>
          ) : (
            <View>
              <TextInput
                label="Faculty Name *"
                value={newFacultyName}
                onChangeText={setNewFacultyName}
                mode="outlined"
                placeholder="e.g. Mrs. Anitha"
                style={styles.modalInput}
              />
              <TextInput
                label="Institutional Email *"
                value={newFacultyEmail}
                onChangeText={setNewFacultyEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="e.g. anitha.cse@jec.com"
                style={styles.modalInput}
              />
              <TextInput
                label="Department"
                value={newFacultyDept}
                onChangeText={setNewFacultyDept}
                mode="outlined"
                placeholder="e.g. Computer Science"
                style={styles.modalInput}
              />

              <Button
                mode="contained"
                onPress={handleCreateAndAllocate}
                loading={submitting}
                disabled={submitting}
                buttonColor={Palette.primary}
                style={{ marginTop: 10 }}
              >
                Create Account & Allocate
              </Button>
            </View>
          )}

          <Button mode="text" onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
            Cancel
          </Button>
        </Modal>
      </Portal>

      {/* ── CREDENTIALS MODAL ── */}
      <Portal>
        <Modal
          visible={credModalVisible}
          onDismiss={() => setCredModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <MaterialCommunityIcons name="check-circle" size={48} color="#2E7D32" />
            <Text style={styles.modalTitle}>Faculty Allocated!</Text>
          </View>

          <Card style={styles.credCard}>
            <Text style={styles.credLabel}>Teacher Account Email:</Text>
            <Text style={styles.credValue}>{credInfo?.email}</Text>

            {credInfo?.password ? (
              <>
                <Text style={[styles.credLabel, { marginTop: 10 }]}>Generated Password:</Text>
                <Text style={styles.credValue}>{credInfo.password}</Text>
              </>
            ) : (
              <Text style={{ marginTop: 8, color: Palette.textLight, fontStyle: 'italic' }}>
                {credInfo?.note || 'Linked to existing faculty account.'}
              </Text>
            )}
          </Card>

          <Button
            mode="contained"
            buttonColor={Palette.primary}
            style={{ marginTop: 16 }}
            onPress={() => setCredModalVisible(false)}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  subjectCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subjectCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Palette.primary,
  },
  subjectName: {
    fontSize: 14,
    color: '#1E293B',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  divider: {
    marginVertical: 12,
  },
  facultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  facultyName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  facultyEmail: {
    fontSize: 12,
    color: '#64748B',
  },
  facultyDept: {
    fontSize: 11,
    color: Palette.primary,
  },
  noFacultyBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    alignItems: 'center',
  },
  noFacultyText: {
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
  modalContainer: {
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
  modalTabs: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  modalTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  modalTabActive: {
    backgroundColor: '#FFFFFF',
  },
  modalTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  modalTabTextActive: {
    color: Palette.primary,
  },
  modalInput: {
    marginBottom: 10,
    backgroundColor: 'white',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  searchEmail: {
    fontSize: 12,
    color: '#64748B',
  },
  searchDept: {
    fontSize: 11,
    color: Palette.primary,
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
});
