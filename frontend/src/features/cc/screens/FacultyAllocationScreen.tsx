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
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { delegationApi, SubjectAllocationItem } from '@services/api/delegationApi';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { EditorialChip } from '@components/editorial/EditorialChip';

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
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
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
      Alert.alert('Required Fields', 'Please enter both Faculty Name and Institutional Email.');
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
        department: newFacultyDept,
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

  const handleDeallocate = (assignment: SubjectAllocationItem) => {
    Alert.alert(
      'Deallocate Subject Teacher',
      `Remove ${assignment.faculty?.name || 'Faculty'} from teaching ${assignment.subjectCode}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deallocate',
          style: 'destructive',
          onPress: async () => {
            try {
              await delegationApi.removeAllocation(assignment.id);
              Alert.alert('Success', 'Teacher assignment removed.');
              loadData();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to remove assignment.');
            }
          },
        },
      ]
    );
  };

  const allocationMap: Record<string, SubjectAllocationItem> = {};
  allocations.forEach((a) => {
    allocationMap[a.subjectCode] = a;
  });

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
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={20} color={EditorialColors.ink} />
          </TouchableOpacity>
          <Label text={`SECTION ROSTER • ${classId.toUpperCase()}`} />
        </View>

        {/* Title heavy 24 */}
        <Text style={styles.screenTitle}>FACULTY ALLOCATION</Text>
        <Text style={styles.screenSubtitle}>
          Assign designated subject professors to curriculum courses for {classId}.
        </Text>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>CURRICULUM SUBJECTS</Text>
          <Label text={`${subjectsList.length} COURSES`} />
        </View>

        {/* Subjects Allocation List */}
        {loading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonBlock} />
          </View>
        ) : (
          <View style={styles.subjectList}>
            {subjectsList.map((subject) => {
              const currentAssignment = allocationMap[subject.code];
              const isAssigned = !!currentAssignment;

              return (
                <View key={subject.code} style={styles.subjectRow}>
                  <View style={styles.rowTop}>
                    <View style={styles.infoCol}>
                      <View style={styles.codeRow}>
                        <Text style={styles.subjectCode}>{subject.code}</Text>
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

                      <Text style={styles.subjectName}>{subject.name}</Text>

                      {isAssigned ? (
                        <>
                          <Text style={styles.facultyName}>{currentAssignment.faculty?.name}</Text>
                          <Label
                            text={`EMAIL: ${currentAssignment.faculty?.email}`}
                            style={styles.emailMeta}
                          />
                        </>
                      ) : (
                        <Text style={styles.unassignedText}>
                          No faculty teacher currently assigned to this subject.
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.rowActions}>
                    {isAssigned && (
                      <TouchableOpacity
                        style={styles.dangerOutlineBtn}
                        onPress={() => handleDeallocate(currentAssignment)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dangerOutlineBtnText}>DEALLOCATE</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.primaryActionBtn}
                      onPress={() => handleOpenAssignModal(subject)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.primaryActionBtnText}>
                        {isAssigned ? 'RE-ALLOCATE' : 'ALLOCATE TEACHER'}
                      </Text>
                      <Feather name="arrow-right" size={14} color={EditorialColors.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Modal: Allocate Faculty */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  ALLOCATE TEACHER<Text style={styles.accentDot}>.</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}
                  accessibilityLabel="Close modal"
                >
                  <Feather name="x" size={20} color={EditorialColors.ink} />
                </TouchableOpacity>
              </View>

              <Rule thickness="hairline" style={{ marginBottom: 14 }} />

              <Label
                text={`${selectedSubject?.code} • ${selectedSubject?.name?.toUpperCase()}`}
                style={{ marginBottom: 14 }}
              />

              {/* Tab Selector */}
              <View style={styles.tabToggleRow}>
                <EditorialChip
                  label="SEARCH DIRECTORY"
                  selected={tab === 'existing'}
                  onPress={() => setTab('existing')}
                />
                <EditorialChip
                  label="ADD NEW FACULTY"
                  selected={tab === 'new'}
                  onPress={() => setTab('new')}
                />
              </View>

              {tab === 'existing' ? (
                <View style={styles.tabContentBlock}>
                  <Text style={styles.inputLabel}>SEARCH BY NAME OR EMAIL</Text>
                  <TextInput
                    style={styles.underlineInput}
                    value={searchQuery}
                    onChangeText={handleSearch}
                    placeholder="e.g. Ramesh or cs.teacher@jec.ac.in"
                    placeholderTextColor={EditorialColors.muted}
                    autoCapitalize="none"
                  />

                  {searching && (
                    <ActivityIndicator size="small" color={EditorialColors.ink} style={{ marginTop: 10 }} />
                  )}

                  <ScrollView style={{ maxHeight: 180, marginTop: 10 }} showsVerticalScrollIndicator={false}>
                    {searchResults.map((faculty) => (
                      <TouchableOpacity
                        key={faculty.email}
                        style={styles.facultySearchResult}
                        onPress={() => handleAllocateExisting(faculty)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.searchResultName}>{faculty.name}</Text>
                        <Label text={`${faculty.department || 'CSE'} • ${faculty.email}`} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <View style={styles.tabContentBlock}>
                  <View style={styles.inputBlock}>
                    <Text style={styles.inputLabel}>FULL NAME</Text>
                    <TextInput
                      style={styles.underlineInput}
                      value={newFacultyName}
                      onChangeText={setNewFacultyName}
                      placeholder="e.g. Dr. John Doe"
                      placeholderTextColor={EditorialColors.muted}
                    />
                  </View>

                  <View style={styles.inputBlock}>
                    <Text style={styles.inputLabel}>INSTITUTIONAL EMAIL</Text>
                    <TextInput
                      style={styles.underlineInput}
                      value={newFacultyEmail}
                      onChangeText={setNewFacultyEmail}
                      placeholder="e.g. johndoe@jec.ac.in"
                      placeholderTextColor={EditorialColors.muted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.modalSubmitBtn}
                    onPress={handleCreateAndAllocate}
                    disabled={submitting}
                    activeOpacity={0.85}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color={EditorialColors.white} />
                    ) : (
                      <Text style={styles.modalSubmitBtnText}>REGISTER & ALLOCATE</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Modal: Credentials Ready */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={credModalVisible}
          onRequestClose={() => setCredModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  CREDENTIALS READY<Text style={styles.accentDot}>.</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setCredModalVisible(false)}
                  style={styles.modalCloseButton}
                  accessibilityLabel="Close modal"
                >
                  <Feather name="x" size={20} color={EditorialColors.ink} />
                </TouchableOpacity>
              </View>

              <Rule thickness="hairline" style={{ marginBottom: 16 }} />

              <Text style={styles.credSuccessNote}>
                Faculty member assigned. Login credentials dispatched to institutional inbox.
              </Text>

              <View style={styles.credDetailsBox}>
                <View style={styles.credRow}>
                  <Text style={styles.credKey}>EMAIL</Text>
                  <Text style={styles.credVal}>{credInfo?.email}</Text>
                </View>
                {credInfo?.password && (
                  <View style={styles.credRow}>
                    <Text style={styles.credKey}>TEMPORARY ACCESS KEY</Text>
                    <Text style={styles.credVal}>{credInfo?.password}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => setCredModalVisible(false)}
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    backgroundColor: EditorialColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 24,
    lineHeight: 28,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  accentDot: {
    color: EditorialColors.accent,
  },
  screenSubtitle: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    color: EditorialColors.muted,
    lineHeight: 18,
    marginBottom: 12,
  },
  heavySpacer: {
    marginVertical: 18,
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
  subjectList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
  },
  subjectRow: {
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
  subjectCode: {
    fontFamily: EditorialFonts.bold,
    fontSize: 13,
    letterSpacing: 1,
    color: EditorialColors.muted,
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
  subjectName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 17,
    lineHeight: 22,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  facultyName: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 14,
    color: EditorialColors.ink,
    marginBottom: 2,
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
  tabToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tabContentBlock: {
    marginTop: 4,
  },
  inputBlock: {
    marginBottom: 14,
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
  facultySearchResult: {
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.track,
    paddingVertical: 10,
  },
  searchResultName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 14,
    color: EditorialColors.ink,
    marginBottom: 2,
  },
  modalSubmitBtn: {
    height: 48,
    width: '100%',
    backgroundColor: EditorialColors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalSubmitBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 1.5,
    color: EditorialColors.white,
  },
  credSuccessNote: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    color: EditorialColors.ink,
    lineHeight: 18,
    marginBottom: 16,
  },
  credDetailsBox: {
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
