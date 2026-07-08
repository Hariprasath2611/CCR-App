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
} from 'react-native';
import { useAuthStore, UserSession } from '../store/useAuthStore';
import { Palette } from '@theme/colors';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
      
      {/* Background Decorative Shapes */}
      <View style={styles.bgCircleTopLeft1} />
      <View style={styles.bgCircleTopLeft2} />
      <View style={styles.bgCircleBottomRight} />
      <View style={styles.bgCircleBottomLeft} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardContainer}>
          {/* Logo Section */}
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../../assets/logo.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* College and App Title */}
          <Text style={styles.collegeTitle}>JAYA ENGINEERING COLLEGE</Text>
          <Text style={styles.appTitle}>COURSE COVERAGE REPORT GENERATOR</Text>

          {/* Login Indicator Divider */}
          <View style={styles.loginDividerWrapper}>
            <View style={styles.dividerLine} />
            <View style={styles.loginLabelContainer}>
              <View style={styles.dot} />
              <Text style={styles.loginText}>LOGIN</Text>
              <View style={styles.dot} />
            </View>
            <View style={styles.dividerLine} />
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            
            {/* Email ID Field */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Feather name="mail" size={16} color="#0D2E5C" style={styles.labelIcon} />
                <Text style={styles.fieldLabel}>Email ID</Text>
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputLeftIconBox}>
                  <Feather name="mail" size={20} color="#0B5ED7" />
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
                <Feather name="lock" size={16} color="#0D2E5C" style={styles.labelIcon} />
                <Text style={styles.fieldLabel}>Password</Text>
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputLeftIconBox}>
                  <Feather name="lock" size={20} color="#0B5ED7" />
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
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Role Picker Field */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Feather name="user" size={16} color="#0D2E5C" style={styles.labelIcon} />
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
                    size={22}
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
                  size={20}
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
                  <Feather name="shield" size={16} color="#0D2E5C" style={styles.labelIcon} />
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
                      size={24}
                      color={selectedSubRole === 'TEACHER' ? '#0B5ED7' : '#64748B'}
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
                      size={24}
                      color={selectedSubRole === 'CC' ? '#0B5ED7' : '#64748B'}
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
                <Feather name="book-open" size={16} color="#0D2E5C" style={styles.labelIcon} />
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
                    color={selectedDept ? '#0B5ED7' : '#94A3B8'}
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
                  size={20}
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
                          <MaterialCommunityIcons name="office-building" size={20} color="#0B5ED7" />
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
            <MaterialCommunityIcons name="login" size={22} color="#FFFFFF" />
            <Text style={styles.loginButtonText}>ENTER</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  
  // Background abstract wave shapes
  bgCircleTopLeft1: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#E6F0FA',
    opacity: 0.8,
    zIndex: -1,
  },
  bgCircleTopLeft2: {
    position: 'absolute',
    top: -50,
    left: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#EDF5FC',
    opacity: 0.6,
    zIndex: -1,
  },
  bgCircleBottomRight: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#E1EDFC',
    opacity: 0.7,
    zIndex: -1,
  },
  bgCircleBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -120,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#EBF3FE',
    opacity: 0.8,
    zIndex: -1,
  },

  // Logo styles
  logoWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: '100%',
    height: '100%',
  },

  // Text titles
  collegeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#B31A1A',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  appTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0D2E5C',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 20,
  },

  // Divider Styles
  loginDividerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1.2,
    backgroundColor: '#94A3B8',
    opacity: 0.4,
  },
  loginLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0B5ED7',
    marginHorizontal: 8,
  },
  loginText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D2E5C',
    letterSpacing: 1,
  },

  // Form styles
  formContainer: {
    width: '100%',
    marginTop: 10,
  },
  fieldGroup: {
    marginBottom: 18,
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
    color: '#0B5ED7',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D2E5C',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#D2E0F5',
    borderRadius: 12,
    height: 54,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1.5,
  },
  inputContainerActive: {
    borderColor: '#0B5ED7',
  },
  inputLeftIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#EDF5FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1E293B',
    paddingHorizontal: 6,
  },
  passwordToggle: {
    padding: 8,
  },
  roleTextValue: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    paddingHorizontal: 6,
  },
  roleTextPlaceholder: {
    color: '#94A3B8',
  },
  chevronIcon: {
    marginRight: 8,
  },

  // Dropdown list styles
  dropdownCard: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    width: '100%',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemIconBox: {
    marginRight: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },

  // Staff sub-role styles
  subRoleContainer: {
    marginTop: 4,
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
    borderWidth: 1.2,
    borderColor: '#D2E0F5',
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1.5,
  },
  subRoleCardSelected: {
    borderColor: '#0B5ED7',
    backgroundColor: '#EDF5FD',
  },
  subRoleCardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  subRoleCardTextSelected: {
    color: '#0B5ED7',
  },

  // Button styles
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#0B5ED7',
    width: '100%',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#0B5ED7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginLeft: 8,
  },
});


