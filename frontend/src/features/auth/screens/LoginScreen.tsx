import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore, UserSession } from '../store/useAuthStore';
import { Palette } from '@theme/colors';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing, EditorialType } from '@theme/editorial';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { apiClient } from '@services/api/apiClient';

import { ms } from '@theme/responsive';

const { height, width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const login = useAuthStore((state) => state.login);
  const navigation = useNavigation<NavigationProp>();

  // Load saved credentials on screen mount if Remember Me was enabled
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('ccr_remembered_email');
        const savedPref = await AsyncStorage.getItem('ccr_remember_me_preference');
        if (savedEmail) {
          setEmail(savedEmail);
        }
        if (savedPref !== null) {
          setRememberMe(savedPref === 'true');
        }
      } catch (e) {
        console.error('Failed to load remembered login credentials:', e);
      }
    };
    loadSavedCredentials();
  }, []);

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

    // Explicit mapping for seeded users to match database exactly

    if (emailLower === 'drkaruppaiya@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: true,
        assignedClassId: '1st Year SEC-A',
        name: 'Dr. Karuppaiya',
        dept: 'Mathematics',
        label: 'Class Coordinator (1st Year SEC-A)',
        icon: 'shield-star',
        color: '#3B82F6',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsgopikha@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: true,
        assignedClassId: '1st Year SEC-C',
        name: 'Mrs. Gopikha',
        dept: 'English',
        label: 'Class Coordinator (1st Year SEC-C)',
        icon: 'shield-star',
        color: '#3B82F6',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'drjosphin@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: true,
        assignedClassId: '1st Year SEC-E',
        name: 'Dr. Josphin',
        dept: 'Tamil',
        label: 'Class Coordinator (1st Year SEC-E)',
        icon: 'shield-star',
        color: '#3B82F6',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'drsaravanan@ccr.edu') {
      return {
        role: 'HOD' as const,
        isCC: false,
        name: 'Dr. SARAVANAN',
        dept: 'Engineering Science (1st Year)',
        label: 'Head of Department (1st Year HOD)',
        icon: 'account-tie',
        color: '#10B981',
        bgColor: '#ECFDF5',
        borderColor: '#A7F3D0',
      };
    }

    if (emailLower === 'drbhuvaneshwari@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: true,
        assignedClassId: '1st Year SEC-D',
        name: 'Dr. Bhuvaneshwari',
        dept: 'Chemistry',
        label: 'Class Coordinator (1st Year SEC-D)',
        icon: 'shield-star',
        color: '#3B82F6',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsagnus@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mrs. Agnus',
        dept: 'CSE',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsarchana@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mrs. Archana',
        dept: 'CSE',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrdsivakumar@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mr. D.Sivakumar',
        dept: 'MECH',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsbhakyalakshmi@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mrs. Bhakyalakshmi',
        dept: 'ECE',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mssabishna@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Ms. Sabishna',
        dept: 'PD',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsavaniberlina@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mrs. A.Vani Berlina',
        dept: 'ENG',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsrevathy@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mrs. Revathy',
        dept: 'PHY',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'drcmurugesan@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Dr. C.Murugesan',
        dept: 'CHEM',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'drgopikumar@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Dr. Gopikumar',
        dept: 'CIVIL',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrskanagavalli@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mrs. Kanagavalli',
        dept: 'EEE',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'drthirugnanam@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Dr. Thirugnanam',
        dept: 'PHY',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsrinivasan@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mr. Srinivasan',
        dept: 'MATHS',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsgophika@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mrs. Gophika',
        dept: 'ENG',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsjasline@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: true,
        assignedClassId: '1st Year SEC-F',
        name: 'Mrs. Jasline',
        dept: 'Physics',
        label: 'Class Coordinator (1st Year SEC-F)',
        icon: 'shield-star',
        color: '#3B82F6',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'drayoganath@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Dr. A.Yoganath',
        dept: 'CHEM',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'drkalaimani@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Dr. Kalaimani',
        dept: 'MECH',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrskavitha@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mrs. Kavitha',
        dept: 'MATHS',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsavaniberlin@ccr.edu' || emailLower === 'mrsavaniberlina@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mrs. A.Vani Berlina',
        dept: 'ENG',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrkumarasamy@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mr. Kumarasamy',
        dept: 'EEE',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsvyshnavai@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mrs. Vyshnavai',
        dept: 'CIVIL',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mraravind@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mr. Aravind',
        dept: 'ENG',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrvijayakumar@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mr. Vijayakumar',
        dept: 'MECH',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsamudha@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mrs. Amudha',
        dept: 'ECE',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'msgophika@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Ms. Gophika',
        dept: 'TEX',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrkumaraswamy@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mr. Kumaraswamy',
        dept: 'EEE',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsrsumathy@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: true,
        assignedClassId: '1st Year SEC-G',
        name: 'Mrs. R.Sumathi',
        dept: 'Mathematics',
        label: 'Class Coordinator (1st Year SEC-G)',
        icon: 'shield-star',
        color: '#3B82F6',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsgrevathy@ccr.edu' || emailLower === 'mrsrevathy@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: true,
        assignedClassId: '1st Year SEC-B',
        name: 'Mrs. G.Revathi',
        dept: 'Physics',
        label: 'Class Coordinator (1st Year SEC-B)',
        icon: 'shield-star',
        color: '#3B82F6',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsashwini@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mrs. Ashwini',
        dept: 'ECE',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }
    if (emailLower === 'punitha@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: true,
        name: 'Ms.Punitha EM',
        dept: 'Computer Science',
        label: 'Class Coordinator (3rd Year CSE-A)',
        icon: 'shield-star',
        color: '#3B82F6',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }
    if (emailLower === 'linebychandra@ccr.edu') {
      return {
        role: 'HOD' as const,
        isCC: false,
        name: 'Mr.J Lin Eby Chandra',
        dept: 'Computer Science',
        label: 'Head of Department (CSE)',
        icon: 'account-tie',
        color: '#10B981',
        bgColor: '#ECFDF5',
        borderColor: '#A7F3D0',
      };
    }
    if (emailLower === 'uvashakthi@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Ms.E Uva Shakthi',
        dept: 'Computer Science',
        label: 'Subject Teacher (CSE)',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }
    if (emailLower === 'faizal@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mr.S Faizal Mukthar Hussain',
        dept: 'Computer Science',
        label: 'Subject Teacher (CSE)',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }
    if (emailLower === 'rajalakshmi@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Ms.R Rajalakshmi',
        dept: 'Computer Science',
        label: 'Subject Teacher (CSE)',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }
    if (emailLower === 'divya@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Ms.P Divya',
        dept: 'Computer Science',
        label: 'Subject Teacher (CSE)',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }
    if (emailLower === 'arunkamala@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Ms.Arun Kamala',
        dept: 'Computer Science',
        label: 'Subject Teacher (CSE)',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }
    if (emailLower === 'principal@ccr.edu') {
      return {
        role: 'ADMIN' as const,
        isCC: false,
        name: 'Dr. Ramesh',
        dept: 'Administration',
        label: 'Principal',
        icon: 'shield-crown',
        color: '#8B5CF6',
        bgColor: '#F5F3FF',
        borderColor: '#DDD6FE',
      };
    }

    // General fallback: only analyze the username prefix, NOT the domain name (to avoid matching 'cc' in '@ccr.edu')
    const username = emailLower.split('@')[0];

    if (
      username.includes('admin') ||
      username.includes('principal') ||
      username.includes('principel') ||
      username.includes('principle')
    ) {
      return {
        role: 'ADMIN' as const,
        isCC: false,
        name: 'Dr. Ramesh',
        dept: 'Administration',
        label: 'Principal',
        icon: 'shield-crown',
        color: '#8B5CF6',
        bgColor: '#F5F3FF',
        borderColor: '#DDD6FE',
      };
    }

    if (username.includes('hod')) {
      return {
        role: 'HOD' as const,
        isCC: false,
        name: 'Dr. Suresh Babu',
        dept: 'Computer Science',
        label: 'Head of Department (CSE)',
        icon: 'account-tie',
        color: '#10B981',
        bgColor: '#ECFDF5',
        borderColor: '#A7F3D0',
      };
    }

    if (username.includes('cc') || username.includes('coordinator')) {
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

  const [isLoading, setIsLoading] = useState(false);

  const currentRoleInfo = detectRole(email);

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Validation', 'Please enter your email ID');
      return;
    }
    if (!password) {
      Alert.alert('Validation', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('ccr_remembered_email', email.trim());
        await AsyncStorage.setItem('ccr_remember_me_preference', 'true');
      } else {
        await AsyncStorage.removeItem('ccr_remembered_email');
        await AsyncStorage.setItem('ccr_remember_me_preference', 'false');
      }

      const response = await apiClient.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password,
      });

      const { user: userSession, accessToken, refreshToken } = response.data;
      if (userSession) {
        if (!userSession.assignedClassId && currentRoleInfo.assignedClassId) {
          userSession.assignedClassId = currentRoleInfo.assignedClassId;
        }
        if (currentRoleInfo.isCC) {
          userSession.isClassCoordinator = true;
        }
      }
      login(userSession, accessToken, refreshToken, rememberMe);
    } catch (error: any) {
      const errMsg = error.response?.data?.error || error.message || 'Could not authenticate with the server. Please check your credentials and connection.';
      Alert.alert('Login Failed', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={EditorialColors.bg} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mainContainer}>
          {/* Top Logo slot top-left */}
          <View style={styles.topLogoRow}>
            <View style={styles.logoFrame}>
              <Image
                source={require('../../../assets/logo-removebg-preview.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.collegeHeaderBox}>
              <Text style={styles.collegeLabel}>JAYA ENGINEERING COLLEGE</Text>
              <Text style={styles.appSystemLabel}>CCR ERP • COURSE COVERAGE SYSTEM</Text>
            </View>
          </View>

          {/* Big display-font headline ending in vermilion full stop */}
          <View style={styles.headlineRow}>
            <Text style={styles.displayHeadline}>
              SIGN IN
              <Text style={styles.accentDot}>.</Text>
            </Text>
          </View>

          {/* 4px ink rule divider */}
          <View style={styles.heavyRule} />

          {/* Labelled underline Email Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>INSTITUTIONAL EMAIL</Text>
            <View style={[styles.underlineInputWrapper, isEmailFocused && styles.underlineInputFocused]}>
              <TextInput
                ref={emailRef}
                style={styles.underlineInput}
                placeholder="faculty@jec.ac.in"
                placeholderTextColor={EditorialColors.muted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                autoComplete="email"
                selectionColor={EditorialColors.ink}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
              />
            </View>
          </View>

          {/* Labelled underline Password Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <View style={[styles.underlineInputWrapper, isPasswordFocused && styles.underlineInputFocused]}>
              <TextInput
                ref={passwordRef}
                style={styles.underlineInput}
                placeholder="Enter password"
                placeholderTextColor={EditorialColors.muted}
                secureTextEntry={secureText}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                selectionColor={EditorialColors.ink}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setSecureText(!secureText)}
                style={styles.passwordToggle}
                activeOpacity={0.7}
                accessibilityLabel="Toggle password visibility"
              >
                <Feather
                  name={secureText ? 'eye-off' : 'eye'}
                  size={18}
                  color={EditorialColors.ink}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me and Forgot Password Row */}
          <View style={styles.rememberForgotRow}>
            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}
            >
              <View style={[styles.squareCheckbox, rememberMe && styles.squareCheckboxChecked]}>
                {rememberMe ? <View style={styles.squareCheckboxInner} /> : null}
              </View>
              <Text style={styles.rememberMeLabel}>REMEMBER ME</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordLink}>FORGOT PASSWORD?</Text>
            </TouchableOpacity>
          </View>

          {/* Full width primary button: Height 54, square, ink fill + white uppercase text */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={isLoading}
            accessibilityRole="button"
          >
            {isLoading ? (
              <ActivityIndicator color={EditorialColors.white} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>SIGN IN</Text>
            )}
          </TouchableOpacity>

          {/* Small muted help text */}
          <Text style={styles.helpText}>
            AUTHORIZED FACULTY & CENTRAL ADMINISTRATION AUDIT ACCESS ONLY
          </Text>

          {/* 1px ink rule divider */}
          <View style={styles.hairlineRule} />

          {/* Quick Preset Selector */}
          <View style={styles.presetsBlock}>
            <Text style={styles.presetsLabel}>TEST CREDENTIAL PRESETS</Text>
            <View style={styles.presetsGrid}>
              {[
                { label: 'STAFF (REVATHI)', email: 'revathi@gmail.com', pass: 'revathi123' },
                { label: 'CC (KARUPPAIYA)', email: 'karuppaiya@gmail.com', pass: 'karuppaiya123' },
                { label: 'HOD (SELVA LAKSHMI)', email: 'selvalakshmi@jec.ac.in', pass: 'selva123' },
                { label: 'PRINCIPAL', email: 'principal@jec.ac.in', pass: 'admin123' },
              ].map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.presetChip}
                  onPress={() => {
                    setEmail(p.email);
                    setPassword(p.pass);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: EditorialSpacing.screenPaddingHorizontal,
    paddingTop: 48,
    paddingBottom: 40,
  },
  mainContainer: {
    width: '100%',
  },
  topLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoFrame: {
    width: 48,
    height: 48,
    borderWidth: EditorialRules.borderWidth,
    borderColor: EditorialColors.ink,
    borderRadius: 0,
    backgroundColor: EditorialColors.white,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  logo: {
    width: 36,
    height: 36,
  },
  collegeHeaderBox: {
    flex: 1,
  },
  collegeLabel: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 2,
    color: EditorialColors.ink,
  },
  appSystemLabel: {
    fontFamily: EditorialFonts.bold,
    fontSize: 10,
    letterSpacing: 1,
    color: EditorialColors.muted,
    marginTop: 2,
  },
  headlineRow: {
    marginBottom: 14,
  },
  displayHeadline: {
    fontFamily: EditorialFonts.display,
    fontSize: 44,
    lineHeight: 46,
    color: EditorialColors.ink,
    letterSpacing: -1,
  },
  accentDot: {
    color: EditorialColors.accent,
  },
  heavyRule: {
    width: '100%',
    height: EditorialRules.heavy, // 4px ink rule
    backgroundColor: EditorialColors.ink,
    marginBottom: 28,
  },
  fieldGroup: {
    marginBottom: 24,
    width: '100%',
  },
  fieldLabel: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  underlineInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: EditorialColors.ink,
    paddingBottom: 6,
    paddingTop: 4,
  },
  underlineInputFocused: {
    borderBottomColor: EditorialColors.accent,
  },
  underlineInput: {
    flex: 1,
    fontFamily: EditorialFonts.semibold,
    fontSize: 16,
    color: EditorialColors.ink,
    paddingVertical: 0,
  },
  passwordToggle: {
    padding: 6,
  },
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 4,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  squareCheckbox: {
    width: 18,
    height: 18,
    borderWidth: EditorialRules.borderWidth,
    borderColor: EditorialColors.ink,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  squareCheckboxChecked: {
    backgroundColor: EditorialColors.ink,
  },
  squareCheckboxInner: {
    width: 6,
    height: 6,
    backgroundColor: EditorialColors.white,
  },
  rememberMeLabel: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
  },
  forgotPasswordLink: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
  },
  primaryButton: {
    height: 54, // strict 54 height
    width: '100%',
    backgroundColor: EditorialColors.ink, // ink fill
    borderRadius: 0, // square
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.white, // white text
    textTransform: 'uppercase',
  },
  helpText: {
    fontFamily: EditorialFonts.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.muted,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 24,
  },
  hairlineRule: {
    width: '100%',
    height: EditorialRules.hairline,
    backgroundColor: EditorialColors.ink,
    marginBottom: 20,
  },
  presetsBlock: {
    width: '100%',
  },
  presetsLabel: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
    marginBottom: 10,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    borderWidth: EditorialRules.hairline,
    borderColor: EditorialColors.ink,
    borderRadius: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  presetChipText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1,
    color: EditorialColors.ink,
  },
});

