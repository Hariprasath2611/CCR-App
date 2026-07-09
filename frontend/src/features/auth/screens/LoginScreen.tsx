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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';

const { height, width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigation = useNavigation<NavigationProp>();

  // Helper to parse role from email dynamically
  const detectRole = (emailText: string) => {
    const emailLower = emailText.toLowerCase().trim();
    if (!emailLower) {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Faculty Teacher',
        dept: 'Computer Science',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#64748B',
        bgColor: '#F8FAFC',
        borderColor: '#E2E8F0',
      };
    }

    if (emailLower.includes('admin')) {
      return {
        role: 'ADMIN' as const,
        isCC: false,
        name: 'Faculty Admin',
        dept: 'Administration',
        label: 'Administrator',
        icon: 'shield-crown',
        color: '#8B5CF6',
        bgColor: '#F5F3FF',
        borderColor: '#DDD6FE',
      };
    }

    if (emailLower.includes('hod')) {
      return {
        role: 'HOD' as const,
        isCC: false,
        name: 'Faculty HOD',
        dept: 'Computer Science',
        label: 'Head of Department (CSE)',
        icon: 'account-tie',
        color: '#10B981',
        bgColor: '#ECFDF5',
        borderColor: '#A7F3D0',
      };
    }

    if (emailLower.includes('cc') || emailLower.includes('coordinator')) {
      return {
        role: 'STAFF' as const,
        isCC: true,
        name: 'Faculty CC',
        dept: 'Computer Science',
        label: 'Class Coordinator (CSE-B)',
        icon: 'shield-star',
        color: '#3B82F6',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    return {
      role: 'STAFF' as const,
      isCC: false,
      name: 'Faculty Teacher',
      dept: 'Computer Science',
      label: 'Subject Teacher (CSE)',
      icon: 'book-open-variant',
      color: '#0F52BA',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
    };
  };

  const currentRoleInfo = detectRole(email);

  const handleLogin = () => {
    if (!email) {
      alert('Please enter your email ID');
      return;
    }
    if (!password) {
      alert('Please enter your password');
      return;
    }

    const { role, isCC, name, dept } = currentRoleInfo;

    const dummyUser: UserSession = {
      id: Math.random().toString(),
      name: role === 'STAFF' 
        ? (isCC ? `${name} (CS)` : `${name} (CS)`) 
        : name,
      email: email,
      role: role,
      isClassCoordinator: isCC,
      department: dept,
      assignedClassId: 'CSE-B',
    };

    login(dummyUser, 'dummy-access-token', 'dummy-refresh-token');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mainContainer}>
          {/* College Logo and Header */}
          <View style={styles.headerContainer}>
            <View style={styles.logoFrame}>
              <Image
                source={require('../../../assets/logo.jpeg')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.collegeTitle}>JAYA ENGINEERING COLLEGE</Text>
            <Text style={styles.appTitle}>CCR Generator</Text>
            <Text style={styles.appSubtitle}>Course Coverage Report Management System</Text>
          </View>

          {/* Sleek Floating Glassmorphic Login Card */}
          <View style={styles.loginCard}>
            <Text style={styles.cardHeader}>Welcome Back</Text>
            <Text style={styles.cardSubHeader}>Sign in to your account to continue</Text>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  isEmailFocused && styles.inputWrapperFocused,
                ]}
              >
                <View style={[styles.inputIconBox, isEmailFocused && styles.inputIconBoxFocused]}>
                  <Feather
                    name="mail"
                    size={18}
                    color={isEmailFocused ? Palette.primary : Palette.textLight}
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter email id"
                  placeholderTextColor={Palette.textLight}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  isPasswordFocused && styles.inputWrapperFocused,
                ]}
              >
                <View style={[styles.inputIconBox, isPasswordFocused && styles.inputIconBoxFocused]}>
                  <Feather
                    name="lock"
                    size={18}
                    color={isPasswordFocused ? Palette.primary : Palette.textLight}
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter password"
                  placeholderTextColor={Palette.textLight}
                  secureTextEntry={secureText}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setSecureText(!secureText)}
                  style={styles.passwordToggle}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={secureText ? 'eye-off' : 'eye'}
                    size={18}
                    color={Palette.textLight}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Smart Role Resolver Indicator */}
            {email.trim().length > 0 && (
              <View
                style={[
                  styles.roleDetectorContainer,
                  {
                    backgroundColor: currentRoleInfo.bgColor,
                    borderColor: currentRoleInfo.borderColor,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={currentRoleInfo.icon as any}
                  size={20}
                  color={currentRoleInfo.color}
                  style={styles.roleDetectorIcon}
                />
                <View style={styles.roleDetectorTextContainer}>
                  <Text style={styles.roleDetectorLabel}>Signing in as:</Text>
                  <Text style={[styles.roleDetectorValue, { color: currentRoleInfo.color }]}>
                    {currentRoleInfo.label}
                  </Text>
                </View>
              </View>
            )}

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPasswordContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Modern Sign In Button */}
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
              <View style={styles.signInButtonIconBox}>
                <Feather name="arrow-right" size={16} color={Palette.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Bottom subtle guidance for tester */}
          <Text style={styles.guidanceText}>
            Tip: Type "admin", "hod", or "cc" in email to test different portal roles.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  mainContainer: {
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
  },
  
  // Header styles
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoFrame: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(15, 82, 186, 0.08)',
    marginBottom: 16,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 10,
  },
  collegeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.textLight,
    textAlign: 'center',
    letterSpacing: 1.8,
    marginBottom: 6,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Palette.textDark,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Palette.textLight,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },

  // Trendy Login Card
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#0F52BA',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(15, 82, 186, 0.05)',
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.textDark,
    marginBottom: 4,
  },
  cardSubHeader: {
    fontSize: 13,
    color: Palette.textLight,
    marginBottom: 24,
  },

  // Form Fields
  inputGroup: {
    marginBottom: 18,
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textDark,
    marginBottom: 8,
    paddingLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 54,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
  },
  inputWrapperFocused: {
    borderColor: Palette.primary,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputIconBoxFocused: {
    backgroundColor: 'rgba(15, 82, 186, 0.04)',
    borderColor: 'rgba(15, 82, 186, 0.1)',
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14.5,
    color: Palette.textDark,
    paddingHorizontal: 4,
    fontWeight: '500',
  },
  passwordToggle: {
    padding: 10,
    marginRight: 4,
  },

  // Smart Role Detector Badge
  roleDetectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginTop: 4,
    marginBottom: 16,
    width: '100%',
  },
  roleDetectorIcon: {
    marginRight: 12,
  },
  roleDetectorTextContainer: {
    flex: 1,
  },
  roleDetectorLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Palette.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleDetectorValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 1,
  },

  // Forgot password
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: Palette.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  // Buttons
  signInButton: {
    flexDirection: 'row',
    backgroundColor: Palette.primary,
    width: '100%',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  signInButtonIconBox: {
    position: 'absolute',
    right: 8,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.textLight,
    textAlign: 'center',
    marginTop: 12,
  },
});
