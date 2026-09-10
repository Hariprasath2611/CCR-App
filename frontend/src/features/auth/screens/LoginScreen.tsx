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
        isCC: false,
        name: 'Dr. Karuppaiya',
        dept: 'MATHS',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsgopikha@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mrs. Gopikha',
        dept: 'ENG',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'drjosphin@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Dr. Josphin',
        dept: 'TAMIL',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'drsaravanan@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Dr. Saravanan',
        dept: 'PHY',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'drbhuvaneshwari@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Dr. Bhuvaneshwari',
        dept: 'CHEM',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
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
        isCC: false,
        name: 'Mrs. Jasline',
        dept: 'PHY',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
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

    if (emailLower === 'mrsavaniberlin@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mrs. A.Vani Berlin',
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
        isCC: false,
        name: 'Mrs. R.Sumathy',
        dept: 'MATHS',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'mrsgrevathy@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mrs. G.Revathy',
        dept: 'PHY',
        label: 'Subject Teacher',
        icon: 'book-open-variant',
        color: '#0F52BA',
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
      login(userSession, accessToken, refreshToken, rememberMe);
    } catch (error: any) {
      console.error('Login error details:', error);
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
                source={require('../../../assets/logo-removebg-preview.png')}
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
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => emailRef.current?.focus()}
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
                  ref={emailRef}
                  style={styles.textInput}
                  placeholder="Enter email id"
                  placeholderTextColor={Palette.textLight}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </TouchableOpacity>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => passwordRef.current?.focus()}
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
                  ref={passwordRef}
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
              </TouchableOpacity>
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

            {/* Remember Me and Forgot Password Container */}
            <View style={styles.rememberForgotRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={rememberMe ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={20}
                  color={rememberMe ? Palette.primary : Palette.textLight}
                />
                <Text style={[styles.rememberMeText, rememberMe && styles.rememberMeTextActive]}>
                  Remember Me
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotPasswordContainer}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Modern Sign In Button */}
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" style={{ alignSelf: 'center', flex: 1 }} />
              ) : (
                <>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                  <View style={styles.signInButtonIconBox}>
                    <Feather name="arrow-right" size={16} color={Palette.primary} />
                  </View>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom subtle guidance for tester */}
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
    paddingHorizontal: ms(24),
    paddingVertical: ms(40),
  },
  mainContainer: {
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
  },
  
  // Header styles
  headerContainer: {
    alignItems: 'center',
    marginBottom: ms(28),
  },
  logoFrame: {
    width: ms(60),
    height: ms(60),
    borderRadius: ms(12),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: ms(0), height: ms(6) },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(15, 82, 186, 0.06)',
    marginBottom: ms(12),
  },
  logo: {
    width: ms(48),
    height: ms(48),
    borderRadius: ms(8),
  },
  collegeTitle: {
    fontSize: ms(11),
    fontWeight: '800',
    color: Palette.textLight,
    textAlign: 'center',
    letterSpacing: 1.8,
    marginBottom: ms(6),
  },
  appTitle: {
    fontSize: ms(28),
    fontWeight: '900',
    color: Palette.textDark,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: ms(11),
    fontWeight: '500',
    color: Palette.textLight,
    textAlign: 'center',
    marginTop: ms(4),
    paddingHorizontal: ms(20),
  },

  // Trendy Login Card
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(24),
    padding: ms(24),
    width: '100%',
    shadowColor: '#0F52BA',
    shadowOffset: { width: ms(0), height: ms(16) },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(15, 82, 186, 0.05)',
    marginBottom: ms(20),
  },
  cardHeader: {
    fontSize: ms(20),
    fontWeight: '800',
    color: Palette.textDark,
    marginBottom: ms(4),
  },
  cardSubHeader: {
    fontSize: ms(13),
    color: Palette.textLight,
    marginBottom: ms(24),
  },

  // Form Fields
  inputGroup: {
    marginBottom: ms(18),
    width: '100%',
  },
  inputLabel: {
    fontSize: ms(13),
    fontWeight: '700',
    color: Palette.textDark,
    marginBottom: ms(8),
    paddingLeft: ms(2),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: ms(16),
    height: ms(54),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: ms(6),
  },
  inputWrapperFocused: {
    borderColor: Palette.primary,
    shadowColor: Palette.primary,
    shadowOffset: { width: ms(0), height: ms(4) },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputIconBox: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(12),
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(10),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputIconBoxFocused: {
    backgroundColor: 'rgba(15, 82, 186, 0.04)',
    borderColor: 'rgba(15, 82, 186, 0.1)',
  },
  textInput: {
    flex: 1,
    alignSelf: 'stretch',
    fontSize: ms(14.5),
    color: Palette.textDark,
    paddingHorizontal: ms(4),
    fontWeight: '500',
  },
  passwordToggle: {
    padding: ms(10),
    marginRight: ms(4),
  },

  // Smart Role Detector Badge
  roleDetectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: ms(16),
    padding: ms(12),
    marginTop: ms(4),
    marginBottom: ms(16),
    width: '100%',
  },
  roleDetectorIcon: {
    marginRight: ms(12),
  },
  roleDetectorTextContainer: {
    flex: 1,
  },
  roleDetectorLabel: {
    fontSize: ms(10),
    fontWeight: '600',
    color: Palette.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleDetectorValue: {
    fontSize: ms(14),
    fontWeight: '800',
    marginTop: ms(1),
  },

  // Remember Me & Forgot Password Row
  rememberForgotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: ms(4),
    marginBottom: ms(20),
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ms(4),
  },
  rememberMeText: {
    fontSize: ms(13),
    fontWeight: '600',
    color: Palette.textLight,
    marginLeft: ms(6),
  },
  rememberMeTextActive: {
    color: Palette.textDark,
    fontWeight: '700',
  },
  forgotPasswordContainer: {
    alignSelf: 'center',
  },
  forgotPasswordText: {
    color: Palette.primary,
    fontSize: ms(13),
    fontWeight: '700',
  },

  // Buttons
  signInButton: {
    flexDirection: 'row',
    backgroundColor: Palette.primary,
    width: '100%',
    height: ms(54),
    borderRadius: ms(16),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Palette.primary,
    shadowOffset: { width: ms(0), height: ms(6) },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: ms(15),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  signInButtonIconBox: {
    position: 'absolute',
    right: ms(8),
    width: ms(38),
    height: ms(38),
    borderRadius: ms(12),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidanceText: {
    fontSize: ms(11),
    fontWeight: '600',
    color: Palette.textLight,
    textAlign: 'center',
    marginTop: ms(12),
  },
});
