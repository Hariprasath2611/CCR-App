import React, { useState, useEffect } from 'react';
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
  LayoutChangeEvent,
} from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '@config/env';
import { DayRibbonColors, DayRibbonFonts } from '@theme/dayRibbon';
import { useAuthStore } from '@features/auth/store/useAuthStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Landing'>;

export const LandingScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const { user, accessToken } = useAuthStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [buttonWidth, setButtonWidth] = useState(SCREEN_WIDTH - 40);

  // Auto-skip Landing screen if a valid session exists
  useEffect(() => {
    if (accessToken && user) {
      // The RootNavigator handles rendering the role dashboard automatically
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

  // Format real current date matching Photo 2: "TODAY · FRI 16 OCT"
  const formatToday = (d: Date) => {
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return `TODAY · ${dayName} ${dayNum} ${monthName}`;
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

  const handleButtonLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - buttonWidth) > 1) {
      setButtonWidth(w);
    }
  };

  const btnH = 54;
  const notchDepth = 18;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 12) }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── TOP ROW: "JEC ACADEMICS" + SETTINGS BUTTON ── */}
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

        {/* ── DATE PILL: "TODAY · FRI 16 OCT" ── */}
        <View style={styles.todayPillWrapper}>
          <View style={styles.todayPill}>
            <Text style={styles.todayPillText}>{todayString}</Text>
          </View>
        </View>

        {/* ── FOUR TILTED RIBBONS (-11.5deg) WITH ALL 3 WORDS PER RIBBON VISIBLE ── */}
        <View style={styles.ribbonsContainer} pointerEvents="none">
          <View style={styles.ribbonsSlantedStack}>
            {/* Ribbon 1: Royal Blue with SYLLABUS · TOPICS · LESSONS */}
            <View style={[styles.ribbonStrip, { backgroundColor: DayRibbonColors.blue }]}>
              <View style={styles.ribbonWordsRow}>
                <Text style={styles.ribbonWordLight}>SYLLABUS</Text>
                <Text style={styles.ribbonWordLight}>TOPICS</Text>
                <Text style={styles.ribbonWordLight}>LESSONS</Text>
              </View>
            </View>

            {/* Ribbon 2: Amber with PLANNED · TAUGHT · COVERED */}
            <View style={[styles.ribbonStrip, { backgroundColor: DayRibbonColors.amber }]}>
              <View style={styles.ribbonWordsRow}>
                <Text style={styles.ribbonWordDark}>PLANNED</Text>
                <Text style={styles.ribbonWordDark}>TAUGHT</Text>
                <Text style={styles.ribbonWordDark}>COVERED</Text>
              </View>
            </View>

            {/* Ribbon 3: Coral with TRACK · REVIEW · IMPROVE */}
            <View style={[styles.ribbonStrip, { backgroundColor: DayRibbonColors.coral }]}>
              <View style={styles.ribbonWordsRow}>
                <Text style={styles.ribbonWordDark}>TRACK</Text>
                <Text style={styles.ribbonWordDark}>REVIEW</Text>
                <Text style={styles.ribbonWordDark}>IMPROVE</Text>
              </View>
            </View>

            {/* Ribbon 4: Mint with FACULTY · COURSES · REPORTS */}
            <View style={[styles.ribbonStrip, { backgroundColor: DayRibbonColors.mint }]}>
              <View style={styles.ribbonWordsRow}>
                <Text style={styles.ribbonWordDark}>FACULTY</Text>
                <Text style={styles.ribbonWordDark}>COURSES</Text>
                <Text style={styles.ribbonWordDark}>REPORTS</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── HERO TEXT: COLLEGE EYEBROW + MASSIVE HEADLINE + SUBLINE ── */}
        <View style={styles.heroSection}>
          <Text style={styles.collegeEyebrow}>JAYA ENGINEERING COLLEGE</Text>

          <View style={styles.headingBlock}>
            <Text style={styles.headingLineDark}>Course</Text>
            <Text style={styles.headingLineBlue}>Coverage</Text>
            <Text style={styles.headingLineDark}>Report</Text>
          </View>

          <Text style={styles.sublineText}>
            Continuous syllabus tracking and{'\n'}curriculum monitoring, one day at a time.
          </Text>
        </View>

        {/* ── NOTCHED RIBBON BUTTON "GET STARTED" WITH SWALLOWTAIL ENDS ── */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.notchedButtonContainer}
            onPress={() => navigation.navigate('Login')}
            onLayout={handleButtonLayout}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Get Started"
          >
            {/* SVG Polygon Ribbon with Swallowtail Notches on Left and Right */}
            <Svg width={buttonWidth} height={btnH} viewBox={`0 0 ${buttonWidth} ${btnH}`}>
              <Polygon
                points={`0,0 ${buttonWidth},0 ${buttonWidth - notchDepth},${btnH / 2} ${buttonWidth},${btnH} 0,${btnH} ${notchDepth},${btnH / 2}`}
                fill={DayRibbonColors.amber}
              />
            </Svg>

            {/* Centered Button Content */}
            <View style={styles.notchedButtonContent} pointerEvents="none">
              <Text style={styles.notchedButtonText}>Get Started</Text>
              <Feather name="arrow-right" size={20} color={DayRibbonColors.ink} style={{ marginLeft: 8 }} />
            </View>
          </TouchableOpacity>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            Official Institutional Platform · Anna University Affiliated
          </Text>
        </View>
      </ScrollView>

      {/* ── SERVER CONFIGURATION MODAL ── */}
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

  // Top Row: "JEC ACADEMICS" + Settings button
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },
  topRowBrand: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12.5,
    letterSpacing: 1.4,
    color: DayRibbonColors.blue,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Date Pill: "TODAY · FRI 16 OCT"
  todayPillWrapper: {
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  todayPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: DayRibbonColors.ink,
    backgroundColor: '#FFFFFF',
  },
  todayPillText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11.5,
    letterSpacing: 0.8,
    color: DayRibbonColors.ink,
    textTransform: 'uppercase',
  },

  // Four Tilted Ribbons (-11.5deg)
  ribbonsContainer: {
    height: 160,
    overflow: 'hidden',
    marginHorizontal: -24,
    marginVertical: 4,
    justifyContent: 'center',
  },
  ribbonsSlantedStack: {
    transform: [{ rotate: '-11.5deg' }],
    width: SCREEN_WIDTH * 1.35,
    alignSelf: 'center',
  },
  ribbonStrip: {
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 0.5,
  },
  ribbonWordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: SCREEN_WIDTH * 0.96, // Keeps all three words fully inside the visible screen bounds!
  },
  ribbonWordLight: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 18.5,
    letterSpacing: 1,
    color: '#FFFFFF',
  },
  ribbonWordDark: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 18.5,
    letterSpacing: 1,
    color: DayRibbonColors.ink,
  },

  // Hero Section
  heroSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  collegeEyebrow: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12.5,
    letterSpacing: 1.2,
    color: DayRibbonColors.muted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  headingBlock: {
    marginBottom: 12,
  },
  headingLineDark: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 54,
    lineHeight: 54,
    letterSpacing: -1,
    color: DayRibbonColors.ink,
  },
  headingLineBlue: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 54,
    lineHeight: 54,
    letterSpacing: -1,
    color: DayRibbonColors.blue,
  },
  sublineText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 14.5,
    lineHeight: 22,
    color: DayRibbonColors.muted,
  },

  // Bottom CTA: Notched Ribbon Button with Swallowtail Ends
  ctaSection: {
    width: '100%',
    marginTop: 8,
  },
  notchedButtonContainer: {
    width: '100%',
    height: 54,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notchedButtonContent: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notchedButtonText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 17,
    letterSpacing: 0.3,
    color: DayRibbonColors.ink,
  },
  footerText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 11.5,
    color: DayRibbonColors.muted,
    textAlign: 'center',
    marginTop: 14,
  },

  // Modal
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
