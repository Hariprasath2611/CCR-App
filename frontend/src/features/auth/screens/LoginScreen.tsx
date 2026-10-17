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
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing, EditorialType } from '@theme/editorial';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { apiClient } from '@services/api/apiClient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ms } from '@theme/responsive';

const { height, width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const HangingRibbon = ({
  width = 26,
  height = 140,
  color = '#FFA51E',
  cutout = 14,
}: {
  width?: number;
  height?: number;
  color?: string;
  cutout?: number;
}) => {
  return (
    <View style={{ width, height, marginRight: 6 }}>
      <View style={{ width, height: height - cutout, backgroundColor: color }} />
      <View style={{ width, height: cutout, flexDirection: 'row' }}>
        <View
          style={{
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderLeftWidth: width / 2,
            borderRightWidth: 0,
            borderBottomWidth: cutout,
            borderLeftColor: color,
            borderBottomColor: 'transparent',
          }}
        />
        <View
          style={{
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderLeftWidth: 0,
            borderRightWidth: width / 2,
            borderBottomWidth: cutout,
            borderRightColor: color,
            borderBottomColor: 'transparent',
          }}
        />
      </View>
    </View>
  );
};

const RoleBookmarkRibbon = ({ color = '#10B981' }: { color?: string }) => {
  return (
    <View style={{ width: 14, height: 32, marginRight: 12 }}>
      <View style={{ width: 14, height: 24, backgroundColor: color }} />
      <View style={{ width: 14, height: 8, flexDirection: 'row' }}>
        <View
          style={{
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderLeftWidth: 7,
            borderRightWidth: 0,
            borderBottomWidth: 8,
            borderLeftColor: color,
            borderBottomColor: 'transparent',
          }}
        />
        <View
          style={{
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderLeftWidth: 0,
            borderRightWidth: 7,
            borderBottomWidth: 8,
            borderRightColor: color,
            borderBottomColor: 'transparent',
          }}
        />
      </View>
    </View>
  );
};

export const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('punitha@ccms.edu');
  const [password, setPassword] = useState('password123');
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
          setPassword('password123');
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

    if (emailLower === 'punitha@ccms.edu' || emailLower === 'punitha@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: true,
        assignedClassId: '3rd Year CSE-A',
        name: 'Ms. Punitha EM',
        dept: 'Computer Science',
        label: 'Class Coordinator (3rd Year CSE-A)',
        icon: 'shield-star',
        color: '#3B82F6',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'linebychandra@ccms.edu' || emailLower === 'linebychandra@ccr.edu') {
      return {
        role: 'HOD' as const,
        isCC: false,
        name: 'Mr. J Lin Eby Chandra',
        dept: 'Computer Science',
        label: 'Head of Department (CSE)',
        icon: 'account-tie',
        color: '#10B981',
        bgColor: '#ECFDF5',
        borderColor: '#A7F3D0',
      };
    }

    if (emailLower === 'uvashakthi@ccms.edu' || emailLower === 'uvashakthi@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Ms. E Uva Shakthi',
        dept: 'Computer Science',
        label: 'Subject Teacher (CSE)',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'faizal@ccms.edu' || emailLower === 'faizal@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Mr. S Faizal Mukthar Hussain',
        dept: 'Computer Science',
        label: 'Subject Teacher (CSE)',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'rajalakshmi@ccms.edu' || emailLower === 'rajalakshmi@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Ms. R Rajalakshmi',
        dept: 'Computer Science',
        label: 'Subject Teacher (CSE)',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'divya@ccms.edu' || emailLower === 'divya@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Ms. P Divya',
        dept: 'Computer Science',
        label: 'Subject Teacher (CSE)',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'arunkamala@ccms.edu' || emailLower === 'arunkamala@ccr.edu') {
      return {
        role: 'STAFF' as const,
        isCC: false,
        name: 'Ms. Arun Kamala',
        dept: 'Computer Science',
        label: 'Subject Teacher (CSE)',
        icon: 'book-open-variant',
        color: '#0F52BA',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    if (emailLower === 'principal@ccms.edu' || emailLower === 'principal@ccr.edu' || emailLower === 'principal@jec.ac.in') {
      return {
        role: 'ADMIN' as const,
        isCC: false,
        name: 'Dr. Ramesh',
        dept: 'Administration',
        label: 'Principal / Administration',
        icon: 'shield-account',
        color: '#8B5CF6',
        bgColor: '#F5F3FF',
        borderColor: '#DDD6FE',
      };
    }

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

  const getRoleBookmarkData = () => {
    if (currentRoleInfo.isCC) {
      return {
        title: 'Class Coordinator',
        subtitle: currentRoleInfo.assignedClassId
          ? `${currentRoleInfo.assignedClassId.includes('3rd') ? '3rd Year · ' : ''}${currentRoleInfo.assignedClassId.replace('3rd Year ', '')}`
          : '3rd Year · CSE-A',
        color: '#10B981',
      };
    }
    if (currentRoleInfo.role === 'HOD') {
      return {
        title: 'Head of Department',
        subtitle: 'HOD · Computer Science Engineering',
        color: '#059669',
      };
    }
    if (currentRoleInfo.role === 'ADMIN') {
      return {
        title: 'Principal',
        subtitle: 'Executive Administration',
        color: '#FFA51E',
      };
    }
    if (email.trim().length > 0) {
      return {
        title: 'Subject Teacher',
        subtitle: `${currentRoleInfo.name ? currentRoleInfo.name + ' · ' : ''}CSE Department`,
        color: '#1E38E8',
      };
    }
    return {
      title: 'Institutional Account',
      subtitle: 'Enter institutional email to verify credentials',
      color: '#94A3B8',
    };
  };

  const roleBookmark = getRoleBookmarkData();

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
      let cleanEmail = email.toLowerCase().trim();

      if (rememberMe) {
        await AsyncStorage.setItem('ccr_remembered_email', cleanEmail);
        await AsyncStorage.setItem('ccr_remember_me_preference', 'true');
      } else {
        await AsyncStorage.removeItem('ccr_remembered_email');
        await AsyncStorage.setItem('ccr_remember_me_preference', 'false');
      }

      let cleanPassword = password.trim();

      let response;
      try {
        response = await apiClient.post('/auth/login', {
          email: cleanEmail,
          password: cleanPassword,
        });
      } catch (authErr: any) {
        // Fallback domain swap if user entered @ccr.edu instead of @ccms.edu or vice versa
        let fallbackEmail = '';
        if (cleanEmail.endsWith('@ccr.edu')) {
          fallbackEmail = cleanEmail.replace('@ccr.edu', '@ccms.edu');
        } else if (cleanEmail.endsWith('@ccms.edu')) {
          fallbackEmail = cleanEmail.replace('@ccms.edu', '@ccr.edu');
        }

        if (fallbackEmail) {
          response = await apiClient.post('/auth/login', {
            email: fallbackEmail,
            password: cleanPassword,
          });
          cleanEmail = fallbackEmail;
        } else {
          throw authErr;
        }
      }

      const { user: userSession, accessToken, refreshToken } = response.data;
      if (userSession) {
        const detected = detectRole(cleanEmail);
        if (!userSession.assignedClassId && detected.assignedClassId) {
          userSession.assignedClassId = detected.assignedClassId;
        }
        if (detected.isCC) {
          userSession.isClassCoordinator = true;
        }
      }
      login(userSession, accessToken, refreshToken, rememberMe);
    } catch (error: any) {
      const errMsg = error.response?.data?.error || error.message || 'Could not authenticate with the server.';
      Alert.alert('Login Failed', `${errMsg}\n\nNote: Default password for seeded accounts is 'password123'.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1E38E8" />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Top Royal Blue Section */}
        <View style={[styles.topBlueSection, { paddingTop: Math.max(insets.top + 16, 44) }]}>
          {/* Top Hanging Ribbons */}
          <View style={styles.ribbonsCluster} pointerEvents="none">
            <HangingRibbon width={26} height={185} color="#FFA51E" cutout={14} />
            <HangingRibbon width={26} height={125} color="#FF4B72" cutout={14} />
            <HangingRibbon width={26} height={155} color="#2CD4A0" cutout={14} />
            <HangingRibbon width={26} height={105} color="#FFFFFF" cutout={14} />
          </View>

          {/* Logo & College Name */}
          <View style={styles.topLogoRow}>
            <View style={styles.logoFrame}>
              <Text style={styles.crestTextTop}>JEC</Text>
              <Text style={styles.crestTextBottom}>CREST</Text>
            </View>
            <View style={styles.collegeNameWrap}>
              <Text style={styles.collegeNameTop}>JAYA ENGINEERING</Text>
              <Text style={styles.collegeNameBottom}>COLLEGE</Text>
            </View>
          </View>

          {/* System Subtitle & Headline */}
          <View style={styles.headlineBlock}>
            <Text style={styles.systemSubtitle}>CCR ERP · COURSE COVERAGE SYSTEM</Text>
            <Text style={styles.displayHeadline}>Sign In</Text>
            <Text style={styles.headlineSubtitle}>Enter your institutional credentials to continue</Text>
          </View>
        </View>

        {/* Bottom White Card Sheet */}
        <View style={styles.bottomWhiteCard}>
          {/* Email Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>INSTITUTIONAL EMAIL</Text>
            <View style={[styles.underlineInputRow, isEmailFocused && styles.underlineInputRowFocused]}>
              <Feather name="mail" size={19} color="#1E293B" />
              <TextInput
                ref={emailRef}
                style={styles.underlineInput}
                placeholder="punitha@ccms.edu"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                autoComplete="email"
                selectionColor="#1E38E8"
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
              />
            </View>
          </View>

          {/* Detected Role Bookmark Card */}
          <View style={styles.roleBookmarkCard}>
            <RoleBookmarkRibbon color={roleBookmark.color} />
            <View style={styles.roleBookmarkTextWrap}>
              <Text style={styles.roleBookmarkTitle}>{roleBookmark.title}</Text>
              <Text style={styles.roleBookmarkSubtitle}>{roleBookmark.subtitle}</Text>
            </View>
          </View>

          {/* Password Field */}
          <View style={[styles.fieldGroup, { marginTop: 20 }]}>
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <View style={[styles.underlineInputRow, isPasswordFocused && styles.underlineInputRowFocused]}>
              <Feather name="lock" size={19} color="#1E293B" />
              <TextInput
                ref={passwordRef}
                style={styles.underlineInput}
                placeholder="•••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={secureText}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                selectionColor="#1E38E8"
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
                  name={secureText ? 'eye' : 'eye-off'}
                  size={19}
                  color="#1E293B"
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
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe ? <Feather name="check" size={13} color="#FFFFFF" /> : null}
              </View>
              <Text style={styles.rememberMeLabel}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordLink}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Pill Button with Golden Circular Arrow */}
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={isLoading}
            accessibilityRole="button"
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" style={{ marginLeft: 24 }} />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
            <View style={styles.arrowCircle}>
              <Feather name="arrow-right" size={20} color="#0D1126" />
            </View>
          </TouchableOpacity>

          {/* Small muted help text */}
          <Text style={styles.helpText}>
            Authorized faculty & central administration audit access only
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#1E38E8',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#1E38E8',
  },
  topBlueSection: {
    backgroundColor: '#1E38E8',
    paddingHorizontal: 24,
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  ribbonsCluster: {
    position: 'absolute',
    top: 0,
    right: 18,
    flexDirection: 'row',
    zIndex: 1,
  },
  topLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 2,
  },
  logoFrame: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  crestTextTop: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 10.5,
    letterSpacing: 0.6,
    color: '#0E1330',
    lineHeight: 12,
  },
  crestTextBottom: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 9,
    letterSpacing: 0.6,
    color: '#0E1330',
    lineHeight: 11,
  },
  collegeNameWrap: {
    flex: 1,
  },
  collegeNameTop: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    letterSpacing: 0.6,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  collegeNameBottom: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    letterSpacing: 0.6,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  headlineBlock: {
    zIndex: 2,
    marginTop: 12,
  },
  systemSubtitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    letterSpacing: 0.8,
    color: 'rgba(255, 255, 255, 0.78)',
  },
  displayHeadline: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 42,
    lineHeight: 48,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 4,
    marginBottom: 6,
  },
  headlineSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 20,
    maxWidth: '85%',
  },
  bottomWhiteCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    flex: 1,
    minHeight: height * 0.6,
  },
  fieldGroup: {
    width: '100%',
  },
  fieldLabel: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#4B5565',
    marginBottom: 4,
  },
  underlineInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
    paddingTop: 6,
  },
  underlineInputRowFocused: {
    borderBottomColor: '#1E38E8',
  },
  underlineInput: {
    flex: 1,
    fontFamily: DayRibbonFonts.body500,
    fontSize: 15,
    color: '#0E1330',
    marginLeft: 12,
    paddingVertical: 4,
  },
  roleBookmarkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
    paddingVertical: 2,
  },
  roleBookmarkTextWrap: {
    flex: 1,
  },
  roleBookmarkTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    color: '#0E1330',
  },
  roleBookmarkSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12.5,
    color: '#4B5565',
    marginTop: 2,
  },
  passwordToggle: {
    padding: 6,
  },
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 4,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#1E38E8',
    borderColor: '#1E38E8',
  },
  rememberMeLabel: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 14,
    color: '#1E293B',
    marginLeft: 10,
  },
  forgotPasswordLink: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: '#1E38E8',
  },
  signInButton: {
    marginTop: 28,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0D1126',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 28,
    paddingRight: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 17,
    letterSpacing: 0.3,
    color: '#FFFFFF',
  },
  arrowCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFA726',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 11.5,
    color: '#4B5565',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});


