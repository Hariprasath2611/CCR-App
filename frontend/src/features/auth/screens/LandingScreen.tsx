import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  StatusBar,
  ScrollView,
  AppState,
  Image,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '@config/env';
import { DayRibbonColors, DayRibbonFonts } from '@theme/dayRibbon';
import { useAuthStore } from '@features/auth/store/useAuthStore';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Landing'>;

export const LandingScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const { user, accessToken } = useAuthStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [serverUrl, setServerUrl] = useState('');

  // Auto-skip Landing screen if a valid session exists
  useEffect(() => {
    if (accessToken && user) {
      // The RootNavigator will automatically route to the appropriate role dashboard
    }
  }, [accessToken, user]);

  useEffect(() => {
    const loadSettings = async () => {
      const customUrl = await AsyncStorage.getItem('CUSTOM_API_URL');
      setServerUrl(customUrl || ENV.API_URL);
    };
    loadSettings();
  }, [modalVisible]);

  const handleSave = async () => {
    let trimmed = serverUrl.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      Alert.alert('Error', 'URL must start with http:// or https://');
      return;
    }

    if (trimmed.endsWith('/')) {
      trimmed = trimmed.substring(0, trimmed.length - 1);
    }

    try {
      await AsyncStorage.setItem('CUSTOM_API_URL', trimmed);
      Alert.alert('Success', 'Server URL updated successfully!\n\nEndpoint: ' + trimmed);
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleReset = async () => {
    try {
      await AsyncStorage.removeItem('CUSTOM_API_URL');
      setServerUrl(ENV.API_URL);
      Alert.alert('Success', 'Reset to default Server URL.');
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to reset settings');
    }
  };

  // Compute dynamic formatted date string: "TODAY - Monday 17 Oct"
  const formatToday = (d: Date) => {
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    return `TODAY — ${dayName} ${dayNum} ${monthName}`;
  };

  const [todayString, setTodayString] = useState(() => formatToday(new Date()));

  useEffect(() => {
    const refreshDate = () => {
      setTodayString(formatToday(new Date()));
    };

    refreshDate();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshDate();
      }
    });

    const interval = setInterval(refreshDate, 30000);

    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isFocused) {
      setTodayString(formatToday(new Date()));
    }
  }, [isFocused]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 12) }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Row: "JEC ACADEMICS" (blue, tracked) + Settings Button (44x44) */}
        <View style={styles.topRow}>
          <Text style={styles.topRowBrand}>JEC ACADEMICS</Text>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
            accessibilityLabel="Server settings"
            accessibilityRole="button"
          >
            <Feather name="settings" size={20} color={DayRibbonColors.ink} />
          </TouchableOpacity>
        </View>

        {/* Date Pill: White outlined pill showing "TODAY — <real current weekday, date, month>" */}
        <View style={styles.todayPillWrapper}>
          <View style={styles.todayPill}>
            <Text style={styles.todayPillText}>{todayString}</Text>
          </View>
        </View>

        {/* Four Tilted Ribbons (-12deg, overflow hidden, bleeding off edges) */}
        <View style={styles.ribbonsContainer} pointerEvents="none">
          <View style={styles.ribbonsSlantedStack}>
            {/* Ribbon 1: Blue */}
            <View style={[styles.ribbonStrip, { backgroundColor: DayRibbonColors.blue }]}>
              <View style={styles.ribbonWordsRow}>
                <Text style={styles.ribbonWordLight}>SYLLABUS</Text>
                <Text style={styles.ribbonWordLight}>TOPICS</Text>
                <Text style={styles.ribbonWordLight}>LESSONS</Text>
              </View>
            </View>

            {/* Ribbon 2: Amber */}
            <View style={[styles.ribbonStrip, { backgroundColor: DayRibbonColors.amber }]}>
              <View style={styles.ribbonWordsRow}>
                <Text style={styles.ribbonWordDark}>PLANNED</Text>
                <Text style={styles.ribbonWordDark}>TAUGHT</Text>
                <Text style={styles.ribbonWordDark}>COVERED</Text>
              </View>
            </View>

            {/* Ribbon 3: Coral */}
            <View style={[styles.ribbonStrip, { backgroundColor: DayRibbonColors.coral }]}>
              <View style={styles.ribbonWordsRow}>
                <Text style={styles.ribbonWordDark}>TRACK</Text>
                <Text style={styles.ribbonWordDark}>REVIEW</Text>
                <Text style={styles.ribbonWordDark}>IMPROVE</Text>
              </View>
            </View>

            {/* Ribbon 4: Mint */}
            <View style={[styles.ribbonStrip, { backgroundColor: DayRibbonColors.mint }]}>
              <View style={styles.ribbonWordsRow}>
                <Text style={styles.ribbonWordDark}>FACULTY</Text>
                <Text style={styles.ribbonWordDark}>COURSES</Text>
                <Text style={styles.ribbonWordDark}>REPORTS</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Hero Branding: Crest + College Name + Heading + Sub-line */}
        <View style={styles.heroSection}>
          <View style={styles.crestRow}>
            <Image
              source={require('../../../assets/logo-removebg-preview.png')}
              style={styles.crestImage}
              resizeMode="contain"
            />
            <View style={styles.collegeNameWrap}>
              <Text style={styles.collegeNameText}>JAYA ENGINEERING COLLEGE</Text>
              <Text style={styles.collegeSubText}>CHENNAI · ANNA UNIVERSITY AFFILIATED</Text>
            </View>
          </View>

          <View style={styles.headingBlock}>
            <Text style={styles.headingLine}>Course</Text>
            <Text style={styles.headingLineBlue}>Coverage</Text>
            <Text style={styles.headingLine}>Report</Text>
          </View>

          <Text style={styles.sublineText}>
            Continuous syllabus tracking and curriculum monitoring, one day at a time.
          </Text>
        </View>

        {/* Full-width Amber Notched Ribbon Button "Get Started" + Arrow */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.notchedRibbonButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Get Started"
          >
            {/* Left Notch Triangle Cutout */}
            <View style={styles.notchCutoutLeft} />

            <View style={styles.buttonContentRow}>
              <Text style={styles.notchedButtonText}>Get Started</Text>
              <Feather name="arrow-right" size={20} color={DayRibbonColors.ink} />
            </View>

            {/* Right Notch Triangle Cutout */}
            <View style={styles.notchCutoutRight} />
          </TouchableOpacity>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            Official Institutional Platform — Anna University Affiliated
          </Text>
        </View>
      </ScrollView>

      {/* Server Settings Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Server Configuration</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseBtn}
                accessibilityLabel="Close"
              >
                <Feather name="x" size={20} color={DayRibbonColors.ink} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Enter your backend endpoint (e.g., http://192.168.1.100:5000)
            </Text>

            <TextInput
              style={styles.modalInput}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://10.0.2.2:5000"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalResetBtn}
                onPress={handleReset}
                activeOpacity={0.7}
              >
                <Text style={styles.modalResetBtnText}>Reset Default</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSave}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DayRibbonColors.pageBg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },

  // Top Row: "JEC ACADEMICS" (blue, tracked) + settings button (44x44)
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },
  topRowBrand: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    letterSpacing: 1.5,
    color: DayRibbonColors.blue,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Outlined Date Pill
  todayPillWrapper: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  todayPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: DayRibbonColors.border,
    backgroundColor: '#FFFFFF',
  },
  todayPillText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11.5,
    letterSpacing: 0.6,
    color: DayRibbonColors.muted,
    textTransform: 'uppercase',
  },

  // Four Tilted Ribbons (-12deg, overflow hidden, bleeding off edges)
  ribbonsContainer: {
    height: 140,
    overflow: 'hidden',
    marginHorizontal: -24,
    marginVertical: 10,
    justifyContent: 'center',
  },
  ribbonsSlantedStack: {
    transform: [{ rotate: '-12deg' }, { scale: 1.25 }],
    width: '130%',
    alignSelf: 'center',
  },
  ribbonStrip: {
    height: 27,
    justifyContent: 'center',
    marginVertical: 1.5,
  },
  ribbonWordsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  ribbonWordLight: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#FFFFFF',
  },
  ribbonWordDark: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    letterSpacing: 1.2,
    color: DayRibbonColors.ink,
  },

  // Hero Section
  heroSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  crestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  crestImage: {
    width: 44,
    height: 44,
    marginRight: 12,
  },
  collegeNameWrap: {
    flex: 1,
  },
  collegeNameText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    letterSpacing: 0.8,
    color: DayRibbonColors.ink,
  },
  collegeSubText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 11,
    color: DayRibbonColors.muted,
    marginTop: 1,
  },
  headingBlock: {
    marginBottom: 12,
  },
  headingLine: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -0.5,
    color: DayRibbonColors.ink,
  },
  headingLineBlue: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -0.5,
    color: DayRibbonColors.blue,
  },
  sublineText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 14.5,
    lineHeight: 21,
    color: DayRibbonColors.muted,
    maxWidth: '92%',
  },

  // Bottom CTA: Full-width Amber Notched Ribbon Button
  ctaSection: {
    width: '100%',
    marginTop: 8,
  },
  notchedRibbonButton: {
    position: 'relative',
    height: 52,
    backgroundColor: DayRibbonColors.amber, // #FFB020
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    overflow: 'hidden',
  },
  notchCutoutLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 26,
    borderBottomWidth: 26,
    borderLeftWidth: 18,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: DayRibbonColors.pageBg, // swallowtail cutout matching page-bg
  },
  notchCutoutRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 26,
    borderBottomWidth: 26,
    borderRightWidth: 18,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: DayRibbonColors.pageBg, // swallowtail cutout matching page-bg
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  notchedButtonText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    letterSpacing: 0.3,
    color: DayRibbonColors.ink,
  },
  footerText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 11,
    color: DayRibbonColors.muted,
    textAlign: 'center',
    marginTop: 14,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 16, 48, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    color: DayRibbonColors.ink,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalDesc: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalInput: {
    fontFamily: DayRibbonFonts.body500,
    height: 48,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: DayRibbonColors.ink,
    backgroundColor: DayRibbonColors.fieldBg,
    marginBottom: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalResetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DayRibbonColors.border,
  },
  modalResetBtnText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 13,
    color: DayRibbonColors.muted,
  },
  modalSaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: DayRibbonColors.blue,
  },
  modalSaveBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    color: '#FFFFFF',
  },
});

export default LandingScreen;
