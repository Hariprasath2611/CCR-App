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
import Svg, { Polygon, Circle } from 'react-native-svg';
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

// ── Top 3 Hanging Ribbons (Blue, Amber, Coral) ──
const TopRibbonCluster = () => {
  return (
    <View style={styles.topRibbonCluster} pointerEvents="none">
      {/* Blue ribbon */}
      <View style={{ width: 13, height: 36, marginRight: 5 }}>
        <View style={{ width: 13, height: 28, backgroundColor: DayRibbonColors.blue }} />
        <View style={{ width: 13, height: 8, flexDirection: 'row' }}>
          <View style={{ width: 0, height: 0, borderStyle: 'solid', borderLeftWidth: 6.5, borderRightWidth: 0, borderBottomWidth: 8, borderLeftColor: DayRibbonColors.blue, borderBottomColor: 'transparent' }} />
          <View style={{ width: 0, height: 0, borderStyle: 'solid', borderLeftWidth: 0, borderRightWidth: 6.5, borderBottomWidth: 8, borderRightColor: DayRibbonColors.blue, borderBottomColor: 'transparent' }} />
        </View>
      </View>

      {/* Amber ribbon */}
      <View style={{ width: 13, height: 24, marginRight: 5 }}>
        <View style={{ width: 13, height: 18, backgroundColor: DayRibbonColors.amber }} />
        <View style={{ width: 13, height: 6, flexDirection: 'row' }}>
          <View style={{ width: 0, height: 0, borderStyle: 'solid', borderLeftWidth: 6.5, borderRightWidth: 0, borderBottomWidth: 6, borderLeftColor: DayRibbonColors.amber, borderBottomColor: 'transparent' }} />
          <View style={{ width: 0, height: 0, borderStyle: 'solid', borderLeftWidth: 0, borderRightWidth: 6.5, borderBottomWidth: 6, borderRightColor: DayRibbonColors.amber, borderBottomColor: 'transparent' }} />
        </View>
      </View>

      {/* Coral ribbon */}
      <View style={{ width: 13, height: 42 }}>
        <View style={{ width: 13, height: 34, backgroundColor: DayRibbonColors.coral }} />
        <View style={{ width: 13, height: 8, flexDirection: 'row' }}>
          <View style={{ width: 0, height: 0, borderStyle: 'solid', borderLeftWidth: 6.5, borderRightWidth: 0, borderBottomWidth: 8, borderLeftColor: DayRibbonColors.coral, borderBottomColor: 'transparent' }} />
          <View style={{ width: 0, height: 0, borderStyle: 'solid', borderLeftWidth: 0, borderRightWidth: 6.5, borderBottomWidth: 8, borderRightColor: DayRibbonColors.coral, borderBottomColor: 'transparent' }} />
        </View>
      </View>
    </View>
  );
};

// ── Mini Hanging Ribbon for Garland Row ──
const MiniGarlandRibbon = ({ color }: { color: string }) => {
  const w = 11;
  const h = 15;
  const notch = 4.5;
  const half = w / 2;

  return (
    <View style={{ width: w, height: h, alignItems: 'center' }}>
      <View style={{ width: w, height: h - notch, backgroundColor: color }} />
      <View style={{ width: w, height: notch, flexDirection: 'row' }}>
        <View
          style={{
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderLeftWidth: half,
            borderRightWidth: 0,
            borderBottomWidth: notch,
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
            borderRightWidth: half,
            borderBottomWidth: notch,
            borderRightColor: color,
            borderBottomColor: 'transparent',
          }}
        />
      </View>
    </View>
  );
};

// ── Garland Row above the CTA Button ──
const GarlandRow = () => {
  const colors = [
    DayRibbonColors.blue,
    DayRibbonColors.amber,
    DayRibbonColors.coral,
    DayRibbonColors.mint,
    DayRibbonColors.blue,
    DayRibbonColors.amber,
    DayRibbonColors.coral,
    DayRibbonColors.mint,
    DayRibbonColors.blue,
  ];

  return (
    <View style={styles.garlandWrapper} pointerEvents="none">
      <View style={styles.garlandWire} />
      <View style={styles.garlandRibbonsRow}>
        {colors.map((c, i) => (
          <MiniGarlandRibbon key={i} color={c} />
        ))}
      </View>
    </View>
  );
};

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

  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Format real date matching Photo 2: "TODAY · FRI 16 OCT"
  const formatToday = (d: Date) => {
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return `TODAY · ${dayName} ${dayNum} ${monthName}`;
  };

  const [todayString, setTodayString] = useState(() => formatToday(currentDate));

  useEffect(() => {
    const refreshDate = () => {
      const now = new Date();
      setCurrentDate(now);
      setTodayString(formatToday(now));
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
      const now = new Date();
      setCurrentDate(now);
      setTodayString(formatToday(now));
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
  const dayNumber = currentDate.getDate();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 12) }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── BACKGROUND DECORATIONS (Dot Grid, Rings, Floating Dots, Watermark) ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          {/* Subtle dot grid */}
          {Array.from({ length: 14 }).map((_, row) =>
            Array.from({ length: 9 }).map((_, col) => (
              <Circle
                key={`dot-${row}-${col}`}
                cx={22 + col * 42}
                cy={25 + row * 62}
                r={1.2}
                fill="#E2E7F6"
              />
            ))
          )}

          {/* Top-Right Concentric Arcs around Settings */}
          <Circle
            cx={SCREEN_WIDTH - 42}
            cy={52}
            r={44}
            fill="none"
            stroke="#DDE3F5"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
          <Circle
            cx={SCREEN_WIDTH - 42}
            cy={52}
            r={76}
            fill="none"
            stroke="#DDE3F5"
            strokeWidth={1}
            strokeDasharray="3 5"
          />
          <Circle
            cx={SCREEN_WIDTH - 42}
            cy={52}
            r={112}
            fill="none"
            stroke="#E5EAF8"
            strokeWidth={1}
            strokeDasharray="4 6"
          />

          {/* Top scattered accent dots */}
          <Circle cx={SCREEN_WIDTH * 0.51} cy={102} r={4.5} fill={DayRibbonColors.mint} />
          <Circle cx={SCREEN_WIDTH * 0.59} cy={108} r={5.5} fill={DayRibbonColors.amber} />
          <Circle cx={SCREEN_WIDTH * 0.67} cy={120} r={4} fill={DayRibbonColors.coral} />

          {/* Hero Area Concentric Arcs behind Right Side */}
          <Circle
            cx={SCREEN_WIDTH * 0.88}
            cy={510}
            r={120}
            fill="none"
            stroke="#DCE2F8"
            strokeWidth={1.2}
            strokeDasharray="3 4"
          />
          <Circle
            cx={SCREEN_WIDTH * 0.88}
            cy={510}
            r={160}
            fill="none"
            stroke="#E8EDFC"
            strokeWidth={1}
            strokeDasharray="4 5"
          />

          {/* Hero floating accent dots */}
          <Circle cx={SCREEN_WIDTH * 0.85} cy={480} r={6} fill={DayRibbonColors.amber} />
          <Circle cx={SCREEN_WIDTH * 0.91} cy={520} r={4.5} fill={DayRibbonColors.coral} />
          <Circle cx={SCREEN_WIDTH * 0.78} cy={555} r={5.5} fill={DayRibbonColors.mint} />
        </Svg>

        {/* Top 3 Hanging Ribbons at top edge */}
        <TopRibbonCluster />

        {/* Giant Calendar Day Watermark (e.g. 17) */}
        <View style={styles.watermarkContainer}>
          <Text style={styles.watermarkText}>{dayNumber}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── TOP ROW: "JEC ACADEMICS" + SETTINGS BUTTON (44x44) ── */}
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

        {/* ── FOUR TILTED RIBBONS: LARGE, BOLD, BLEEDING SIDES, NO TOP/BOTTOM CUTS ── */}
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

        {/* ── GARLAND OF MINI BOOKMARK RIBBONS ABOVE BUTTON ── */}
        <GarlandRow />

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

            {/* Button Content: "Get Started" on Left, Arrow on Right */}
            <View style={styles.notchedButtonContent} pointerEvents="none">
              <Text style={styles.notchedButtonText}>Get Started</Text>
              <Feather name="arrow-right" size={22} color={DayRibbonColors.ink} />
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
    position: 'relative',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 16,
  },

  // Top Ribbon Cluster (Blue, Amber, Coral hanging from top edge)
  topRibbonCluster: {
    position: 'absolute',
    top: 0,
    left: SCREEN_WIDTH * 0.50,
    flexDirection: 'row',
    zIndex: 1,
  },

  // Giant Calendar Day Number Watermark
  watermarkContainer: {
    position: 'absolute',
    top: 360,
    right: -10,
    zIndex: 0,
    opacity: 0.08,
  },
  watermarkText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 210,
    lineHeight: 210,
    color: DayRibbonColors.blue,
  },

  // Top Row: "JEC ACADEMICS" + Settings button
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 8,
    zIndex: 2,
  },
  topRowBrand: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12.5,
    letterSpacing: 1.5,
    color: DayRibbonColors.blue,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5D8F5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  // Date Pill: "TODAY · FRI 16 OCT"
  todayPillWrapper: {
    alignItems: 'flex-start',
    marginBottom: 4,
    zIndex: 2,
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

  // Four Tilted Ribbons: Large font, tall strips, bleeding sides
  ribbonsContainer: {
    height: 250,
    overflow: 'hidden',
    marginHorizontal: -24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  ribbonsSlantedStack: {
    transform: [{ rotate: '-10.5deg' }],
    width: SCREEN_WIDTH * 1.35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbonStrip: {
    height: 44,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 0.5,
  },
  ribbonWordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: SCREEN_WIDTH * 0.94,
  },
  ribbonWordLight: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 22,
    letterSpacing: 0.8,
    color: '#FFFFFF',
  },
  ribbonWordDark: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 22,
    letterSpacing: 0.8,
    color: DayRibbonColors.ink,
  },

  // Hero Section
  heroSection: {
    marginTop: -8,
    marginBottom: 10,
    zIndex: 2,
  },
  collegeEyebrow: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    letterSpacing: 1.2,
    color: '#4A4E86',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  headingBlock: {
    marginBottom: 10,
  },
  headingLineDark: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 58,
    lineHeight: 58,
    letterSpacing: -1.5,
    color: DayRibbonColors.ink,
  },
  headingLineBlue: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 58,
    lineHeight: 58,
    letterSpacing: -1.5,
    color: DayRibbonColors.blue,
  },
  sublineText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 14.5,
    lineHeight: 22,
    color: '#4A4E86',
  },

  // Garland of Mini Bookmark Ribbons
  garlandWrapper: {
    width: '100%',
    marginBottom: 10,
    marginTop: 4,
    zIndex: 2,
  },
  garlandWire: {
    width: '100%',
    height: 1,
    backgroundColor: '#DDE2F5',
  },
  garlandRibbonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },

  // Bottom CTA: Notched Ribbon Button with Swallowtail Ends
  ctaSection: {
    width: '100%',
    zIndex: 2,
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
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 36,
  },
  notchedButtonText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 17.5,
    letterSpacing: 0.3,
    color: DayRibbonColors.ink,
  },
  footerText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 11.5,
    color: '#5A5E96',
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
