import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useAuthStore, UserSession } from '../store/useAuthStore';
import { Palette } from '@theme/colors';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

type RoleType = 'STAFF' | 'HOD' | 'ADMIN';
type SubRoleType = 'TEACHER' | 'CC';

const DEPARTMENTS = [
  { label: '1st Year', value: 'Ist yer' },
  { label: 'CSE', value: 'CSE' },
  { label: 'IT', value: 'IT' },
  { label: 'AIML', value: 'AIML' },
  { label: 'CSBS', value: 'CSBS' },
  { label: 'MECH', value: 'MECH' },
  { label: 'Aeronautical', value: 'aeronatical' },
  { label: 'Civil', value: 'Civil' },
  { label: 'ECE', value: 'ECE' },
  { label: 'EEE', value: 'EEE' },
  { label: 'E&I', value: 'E&I' },
  { label: 'Textile', value: 'textil' },
];

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [selectedSubRole, setSelectedSubRole] = useState<SubRoleType | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const login = useAuthStore((state) => state.login);

  const handleLogin = () => {
    if (!selectedRole) {
      alert('Please select a role to enter');
      return;
    }

    if (selectedRole === 'STAFF' && !selectedSubRole) {
      alert('Please select a Staff function (Subject Teacher or CC) to enter');
      return;
    }

    if (!selectedDept) {
      alert('Please select a department to enter');
      return;
    }

    // Determine if the email indicates a Class Coordinator (CC) role for Staff
    const isCC = selectedRole === 'STAFF' && selectedSubRole === 'CC';

    const dummyUser: UserSession = {
      id: Math.random().toString(),
      name: selectedRole === 'STAFF' 
        ? (isCC ? 'Faculty CC (CS)' : 'Faculty Teacher (CS)') 
        : `Faculty ${selectedRole}`,
      email: email || `${selectedRole.toLowerCase()}@college.edu`,
      role: selectedRole,
      isClassCoordinator: isCC,
      department: DEPARTMENTS.find(d => d.value === selectedDept)?.label || 'Computer Science',
      assignedClassId: 'CSE-B',
    };
    login(dummyUser, 'dummy-access-token', 'dummy-refresh-token');
  };

  const getRoleLabel = (role: RoleType | null) => {
    if (!role) return 'Select Role';
    if (role === 'STAFF') return 'Staff';
    if (role === 'HOD') return 'HOD (Head of Department)';
    if (role === 'ADMIN') return 'Admin';
    return 'Select Role';
  };

  const getRoleIcon = (role: RoleType | null) => {
    if (role === 'STAFF') {
      if (selectedSubRole === 'CC') return { name: 'shield-star', color: '#1E60D4' };
      return { name: 'account', color: '#1E60D4' };
    }
    if (role === 'HOD') return { name: 'account-tie', color: '#2CA85F' };
    if (role === 'ADMIN') return { name: 'shield-account', color: '#7C5EC2' };
    return { name: 'account-outline', color: '#94A3B8' };
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Abstract Background Designs & Orbs */}
      <View style={styles.topOrb} />
      <View style={styles.centerLeftOrb} />
      <View style={styles.bottomRightOrb} />
      <View style={styles.bottomLeftOrb} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardContainer}>
          {/* Premium Rounded Logo Frame */}
          <View style={styles.logoFrame}>
            <Image
              source={require('../../../assets/logo.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* College and App Title */}
          <Text style={styles.collegeTitle}>JAYA ENGINEERING COLLEGE</Text>
          <Text style={styles.appTitle}>CCR Generator</Text>
          <Text style={styles.appSubtitle}>Course Coverage Report Management System</Text>

          {/* Login Indicator Divider */}
          <View style={styles.loginDividerWrapper}>
            <View style={styles.dividerLine} />
            <View style={styles.loginLabelContainer}>
              <View style={styles.dot} />
              <Text style={styles.loginText}>SECURE LOGIN</Text>
              <View style={styles.dot} />
            </View>
            <View style={styles.dividerLine} />
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            
            {/* Email ID Field */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Feather name="mail" size={14} color="#0F52BA" style={styles.labelIcon} />
                <Text style={styles.fieldLabel}>Email ID</Text>
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputLeftIconBox}>
                  <Feather name="mail" size={18} color="#0F52BA" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter email id"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Feather name="lock" size={14} color="#0F52BA" style={styles.labelIcon} />
                <Text style={styles.fieldLabel}>Password</Text>
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputLeftIconBox}>
                  <Feather name="lock" size={18} color="#0F52BA" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={secureText}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setSecureText(!secureText)}
                  style={styles.passwordToggle}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={secureText ? 'eye-off' : 'eye'}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Role Picker Field */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Feather name="user" size={14} color="#0F52BA" style={styles.labelIcon} />
                <Text style={styles.fieldLabel}>Role</Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  showDropdown && styles.inputContainerActive,
                ]}
                onPress={() => setShowDropdown(!showDropdown)}
                activeOpacity={0.9}
              >
                <View style={styles.inputLeftIconBox}>
                  <MaterialCommunityIcons
                    name={getRoleIcon(selectedRole).name as any}
                    size={20}
                    color={getRoleIcon(selectedRole).color}
                  />
                </View>
                <Text
                  style={[
                    styles.roleTextValue,
                    !selectedRole && styles.roleTextPlaceholder,
                  ]}
                >
                  {getRoleLabel(selectedRole)}
                </Text>
                <Feather
                  name={showDropdown ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#64748B"
                  style={styles.chevronIcon}
                />
              </TouchableOpacity>

              {/* Inline Custom Dropdown List */}
              {showDropdown && (
                <View style={styles.dropdownCard}>
                  {/* Staff Option */}
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedRole('STAFF');
                      setSelectedSubRole(null);
                      setShowDropdown(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dropdownItemIconBox}>
                      <MaterialCommunityIcons name="account" size={20} color="#1E60D4" />
                    </View>
                    <Text style={styles.dropdownItemText}>Staff</Text>
                  </TouchableOpacity>

                  {/* HOD Option */}
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedRole('HOD');
                      setSelectedSubRole(null);
                      setShowDropdown(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dropdownItemIconBox}>
                      <MaterialCommunityIcons name="account-tie" size={20} color="#2CA85F" />
                    </View>
                    <Text style={styles.dropdownItemText}>HOD (Head of Department)</Text>
                  </TouchableOpacity>

                  {/* Admin Option */}
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedRole('ADMIN');
                      setSelectedSubRole(null);
                      setShowDropdown(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dropdownItemIconBox}>
                      <MaterialCommunityIcons name="shield-account" size={20} color="#7C5EC2" />
                    </View>
                    <Text style={styles.dropdownItemText}>Admin</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Sub-Role Selector for Staff */}
            {selectedRole === 'STAFF' && (
              <View style={styles.subRoleContainer}>
                <View style={styles.fieldLabelRow}>
                  <Feather name="shield" size={14} color="#0F52BA" style={styles.labelIcon} />
                  <Text style={styles.fieldLabel}>Staff Function</Text>
                </View>
                <View style={styles.subRoleCardRow}>
                  {/* Subject Teacher Option */}
                  <TouchableOpacity
                    style={[
                      styles.subRoleCard,
                      selectedSubRole === 'TEACHER' && styles.subRoleCardSelected,
                    ]}
                    onPress={() => setSelectedSubRole('TEACHER')}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="book-open-page-variant"
                      size={22}
                      color={selectedSubRole === 'TEACHER' ? '#0F52BA' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.subRoleCardText,
                        selectedSubRole === 'TEACHER' && styles.subRoleCardTextSelected,
                      ]}
                    >
                      Subject Teacher
                    </Text>
                  </TouchableOpacity>

                  {/* CC Option */}
                  <TouchableOpacity
                    style={[
                      styles.subRoleCard,
                      selectedSubRole === 'CC' && styles.subRoleCardSelected,
                    ]}
                    onPress={() => setSelectedSubRole('CC')}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="shield-star"
                      size={22}
                      color={selectedSubRole === 'CC' ? '#0F52BA' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.subRoleCardText,
                        selectedSubRole === 'CC' && styles.subRoleCardTextSelected,
                      ]}
                    >
                      Class Coordinator
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Department Picker Field */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Feather name="book-open" size={14} color="#0F52BA" style={styles.labelIcon} />
                <Text style={styles.fieldLabel}>Department</Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  showDeptDropdown && styles.inputContainerActive,
                ]}
                onPress={() => setShowDeptDropdown(!showDeptDropdown)}
                activeOpacity={0.9}
              >
                <View style={styles.inputLeftIconBox}>
                  <MaterialCommunityIcons
                    name="domain"
                    size={22}
                    color={selectedDept ? '#0F52BA' : '#94A3B8'}
                  />
                </View>
                <Text
                  style={[
                    styles.roleTextValue,
                    !selectedDept && styles.roleTextPlaceholder,
                  ]}
                >
                  {selectedDept ? DEPARTMENTS.find(d => d.value === selectedDept)?.label : 'Select Department'}
                </Text>
                <Feather
                  name={showDeptDropdown ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#64748B"
                  style={styles.chevronIcon}
                />
              </TouchableOpacity>

              {/* Scrollable Custom Dropdown List */}
              {showDeptDropdown && (
                <View style={[styles.dropdownCard, { maxHeight: 220 }]}>
                  <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                    {DEPARTMENTS.map((dept) => (
                      <TouchableOpacity
                        key={dept.value}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedDept(dept.value);
                          setShowDeptDropdown(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.dropdownItemIconBox}>
                          <MaterialCommunityIcons name="office-building" size={20} color="#0F52BA" />
                        </View>
                        <Text style={styles.dropdownItemText}>{dept.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

          </View>

          {/* Login Enter Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="login" size={20} color="#FFFFFF" />
            <Text style={styles.loginButtonText}>SECURE SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Off-white premium workspace canvas
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  
  // Abstract Background Orbs
  topOrb: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E0E7FF',
    opacity: 0.6,
    zIndex: -1,
  },
  centerLeftOrb: {
    position: 'absolute',
    top: height * 0.35,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#EFF6FF',
    opacity: 0.7,
    zIndex: -1,
  },
  bottomRightOrb: {
    position: 'absolute',
    bottom: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#EEF2FF',
    opacity: 0.8,
    zIndex: -1,
  },
  bottomLeftOrb: {
    position: 'absolute',
    bottom: height * 0.15,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECFDF5',
    opacity: 0.5,
    zIndex: -1,
  },

  // Logo styles
  logoFrame: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  // Text titles
  collegeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },

  // Divider Styles
  loginDividerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  loginLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0F52BA',
    marginHorizontal: 6,
  },
  loginText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 1.5,
  },

  // Form styles
  formContainer: {
    width: '100%',
    marginTop: 8,
  },
  fieldGroup: {
    marginBottom: 16,
    width: '100%',
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 2,
  },
  labelIcon: {
    marginRight: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 52,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  inputContainerActive: {
    borderColor: '#0F52BA',
  },
  inputLeftIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#1E293B',
    paddingHorizontal: 4,
  },
  passwordToggle: {
    padding: 8,
  },
  roleTextValue: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    paddingHorizontal: 4,
  },
  roleTextPlaceholder: {
    color: '#94A3B8',
  },
  chevronIcon: {
    marginRight: 8,
  },

  // Dropdown list styles
  dropdownCard: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    width: '100%',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemIconBox: {
    marginRight: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },

  // Staff sub-role styles
  subRoleContainer: {
    marginTop: 2,
    marginBottom: 8,
    width: '100%',
  },
  subRoleCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
    gap: 12,
  },
  subRoleCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  subRoleCardSelected: {
    borderColor: '#0F52BA',
    backgroundColor: '#EFF6FF',
  },
  subRoleCardText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  subRoleCardTextSelected: {
    color: '#0F52BA',
  },

  // Button styles
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#0F52BA',
    width: '100%',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    shadowColor: '#0F52BA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginLeft: 6,
  },
});


