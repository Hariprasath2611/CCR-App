import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Platform,
  AccessibilityInfo,
  Easing,
} from 'react-native';
import Svg, { Polygon, Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '@config/env';
import { DayRibbonColors, DayRibbonFonts } from '@theme/dayRibbon';
import { useAuthStore } from '@features/auth/store/useAuthStore';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Landing'>;

// ── CONTINUOUS CYCLIC MARQUEE RIBBON (Never stops, alternating bidirectional) ──
interface TiltedRibbonProps {
  color: string;
  word1: string;
  word2: string;
  word3: string;
  textColor: string;
  direction?: 'left' | 'right';
  speed?: number; // duration (ms) for one unit cycle
}

const TiltedRibbonStrip: React.FC<TiltedRibbonProps> = ({
  color,
  word1,
  word2,
  word3,
  textColor,
  direction = 'right',
  speed = 8500,
}) => {
  const w = 1200;
  const h = 56;
  const notch = 18;

  // Dynamically measure width of one 3-word unit
  const [unitWidth, setUnitWidth] = useState<number>(310);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: speed,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();

    return () => loop.stop();
  }, [speed]);

  const onUnitLayout = (e: LayoutChangeEvent) => {
    const measured = e.nativeEvent.layout.width;
    if (measured > 50 && Math.abs(measured - unitWidth) > 2) {
      setUnitWidth(measured);
    }
  };

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: direction === 'right' ? [-unitWidth, 0] : [0, -unitWidth],
  });

  const renderUnit = (key: string, onLayout?: (e: LayoutChangeEvent) => void) => (
    <View key={key} style={styles.ribbonUnit} onLayout={onLayout}>
      <Text style={[styles.ribbonWordText, { color: textColor }]} numberOfLines={1}>{word1}</Text>
      <Text style={[styles.ribbonWordText, { color: textColor }]} numberOfLines={1}>{word2}</Text>
      <Text style={[styles.ribbonWordText, { color: textColor }]} numberOfLines={1}>{word3}</Text>
    </View>
  );

  return (
    <View style={styles.ribbonItemWrapper}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={StyleSheet.absoluteFill}>
        <Polygon
          points={`0,0 ${w},0 ${w - notch},${h / 2} ${w},${h} 0,${h} ${notch},${h / 2}`}
          fill={color}
        />
      </Svg>
      <Animated.View
        style={[
          styles.ribbonTickerTrack,
          { transform: [{ translateX }] },
        ]}
        pointerEvents="none"
      >
        {renderUnit('u0', onUnitLayout)}
        {renderUnit('u1')}
        {renderUnit('u2')}
        {renderUnit('u3')}
        {renderUnit('u4')}
        {renderUnit('u5')}
        {renderUnit('u6')}
        {renderUnit('u7')}
      </Animated.View>
    </View>
  );
};

// ── THREE HANGING MINI RIBBONS (Top edge: 12px wide, 26/16/36px high, 18px apart) ──
const TopThreeHangingRibbons = () => {
  return (
    <View style={styles.topMiniRibbonsCluster} pointerEvents="none" aria-hidden={true}>
      {/* Ribbon 1: Blue 60% opacity, 26px high */}
      <Svg width={12} height={26} viewBox="0 0 12 26" style={{ marginRight: 18 }}>
        <Polygon points="0,0 12,0 12,26 6,20 0,26" fill="rgba(43, 53, 224, 0.6)" />
      </Svg>

      {/* Ribbon 2: Amber 75% opacity, 16px high */}
      <Svg width={12} height={16} viewBox="0 0 12 16" style={{ marginRight: 18 }}>
        <Polygon points="0,0 12,0 12,16 6,10 0,16" fill="rgba(255, 176, 32, 0.75)" />
      </Svg>

      {/* Ribbon 3: Coral 65% opacity, 36px high */}
      <Svg width={12} height={36} viewBox="0 0 12 36">
        <Polygon points="0,0 12,0 12,36 6,30 0,36" fill="rgba(255, 93, 115, 0.65)" />
      </Svg>
    </View>
  );
};

// ── BUNTING STRING & 9 PENNANTS (Above CTA: 1.5px #D5D8F5 wire + 9 12x12px pennants) ──
const BuntingDecor: React.FC<{ width: number }> = ({ width }) => {
  const pennantColors = [
    'rgba(43, 53, 224, 0.6)',  // blue
    'rgba(255, 176, 32, 0.6)', // amber
    'rgba(255, 93, 115, 0.6)', // coral
    'rgba(61, 219, 176, 0.6)', // mint
    'rgba(43, 53, 224, 0.6)',  // blue
    'rgba(255, 176, 32, 0.6)', // amber
    'rgba(255, 93, 115, 0.6)', // coral
    'rgba(61, 219, 176, 0.6)', // mint
    'rgba(43, 53, 224, 0.6)',  // blue
  ];

  const w = Math.max(width, 320);
  const h = 24;

  return (
    <View style={styles.buntingContainer} pointerEvents="none" aria-hidden={true}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Thin curved wire */}
        <Path
          d={`M 0,2 Q ${w / 2},12 ${w},2`}
          stroke="#D5D8F5"
          strokeWidth={1.5}
          fill="none"
        />

        {/* 9 Swallowtail Pennants (12x12px) */}
        {pennantColors.map((col, idx) => {
          const t = (idx + 0.5) / 9;
          const x = t * (w - 24) + 6;
          // Curve sag: y = 2 + 10 * 4 * t * (1 - t)
          const y = 2 + 40 * t * (1 - t);

          return (
            <Polygon
              key={`pennant-${idx}`}
              points={`${x},${y} ${x + 12},${y} ${x + 12},${y + 12} ${x + 6},${y + 7} ${x},${y + 12}`}
              fill={col}
            />
          );
        })}
      </Svg>
    </View>
  );
};

// ── BACKGROUND DECORATIONS (Isolated background layer) ──
interface BackgroundDecorProps {
  screenWidth: number;
  screenHeight: number;
  dayNum: number | string;
  fadeAnim: Animated.Value;
}

const BackgroundDecorations: React.FC<BackgroundDecorProps> = ({
  screenWidth,
  screenHeight,
  dayNum,
  fadeAnim,
}) => {
  const isSmallScreen = screenHeight < 700 || screenWidth < 340;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { opacity: fadeAnim, overflow: 'hidden' }]}
      pointerEvents="none"
      aria-hidden={true}
    >
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Top Grid Vertical Fade Mask */}
          <LinearGradient id="topFadeMask" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#D5D8F5" stopOpacity="0.8" />
            <Stop offset="0.7" stopColor="#D5D8F5" stopOpacity="0.3" />
            <Stop offset="1" stopColor="#D5D8F5" stopOpacity="0" />
          </LinearGradient>

          {/* Middle Grid Vertical Fade Mask */}
          <LinearGradient id="midFadeMask" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#D5D8F5" stopOpacity="0" />
            <Stop offset="0.2" stopColor="#D5D8F5" stopOpacity="0.5" />
            <Stop offset="0.8" stopColor="#D5D8F5" stopOpacity="0.5" />
            <Stop offset="1" stopColor="#D5D8F5" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* 1. Top Dot Grid (150px high, 16px spacing, ~1.4px radius) */}
        {Array.from({ length: 9 }).map((_, row) =>
          Array.from({ length: Math.ceil(screenWidth / 16) + 1 }).map((_, col) => {
            const op = Math.max(0, 0.8 - row * 0.09);
            return (
              <Circle
                key={`top-dot-${row}-${col}`}
                cx={col * 16 + 8}
                cy={row * 16 + 8}
                r={1.4}
                fill="#D5D8F5"
                opacity={op}
              />
            );
          })
        )}

        {/* 2. Top-Right Rings: 190px solid #D5D8F5, inside 122px dashed mint (70% opacity) */}
        {/* Placed at top-right corner (-70px top, -70px right) */}
        <Circle
          cx={screenWidth + 70 - 95}
          cy={-70 + 95}
          r={95} // 190px diameter
          stroke="#D5D8F5"
          strokeWidth={1.5}
          fill="none"
        />
        <Circle
          cx={screenWidth + 70 - 95}
          cy={-70 + 95}
          r={61} // 122px diameter
          stroke="rgba(61, 219, 176, 0.7)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          fill="none"
        />

        {/* 3. Three Confetti Dots above tilted ribbons: amber 10px, coral 7px, mint 8px */}
        <Circle cx={screenWidth * 0.51} cy={102} r={4} fill={DayRibbonColors.mint} />
        <Circle cx={screenWidth * 0.59} cy={108} r={5} fill={DayRibbonColors.amber} />
        <Circle cx={screenWidth * 0.67} cy={120} r={3.5} fill={DayRibbonColors.coral} />

        {/* 4. Middle Dot Grid behind heading and sub-line (about 230px high) */}
        {Array.from({ length: 14 }).map((_, row) =>
          Array.from({ length: Math.ceil(screenWidth / 16) + 1 }).map((_, col) => {
            const rowRel = row / 14;
            const op = Math.sin(rowRel * Math.PI) * 0.5;
            return (
              <Circle
                key={`mid-dot-${row}-${col}`}
                cx={col * 16 + 8}
                cy={screenHeight * 0.52 + row * 16}
                r={1.4}
                fill="#D5D8F5"
                opacity={op}
              />
            );
          })
        )}

        {/* 5. Middle Rings: 230px solid #D5D8F5, inside 154px dashed amber (55% opacity) */}
        {!isSmallScreen && (
          <>
            <Circle
              cx={screenWidth + 15}
              cy={screenHeight * 0.65}
              r={115} // 230px diameter
              stroke="#D5D8F5"
              strokeWidth={1.5}
              fill="none"
            />
            <Circle
              cx={screenWidth + 15}
              cy={screenHeight * 0.65}
              r={77} // 154px diameter
              stroke="rgba(255, 176, 32, 0.55)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="none"
            />
            {/* 6. Three Confetti Dots to the right of "Course": amber 12px, coral 8px, mint 10px */}
            <Circle cx={screenWidth * 0.85} cy={screenHeight * 0.58} r={6} fill={DayRibbonColors.amber} />
            <Circle cx={screenWidth * 0.91} cy={screenHeight * 0.62} r={4} fill={DayRibbonColors.coral} />
            <Circle cx={screenWidth * 0.78} cy={screenHeight * 0.66} r={5} fill={DayRibbonColors.mint} />
          </>
        )}
      </Svg>

      {/* Top 3 Hanging Ribbons from top edge */}
      <TopThreeHangingRibbons />

      {/* Ghost Numeral: Current Day of Month in Bricolage 800 (~210px, color #F0F1FF) */}
      {!isSmallScreen && (
        <View style={styles.ghostNumeralWrapper}>
          <Text style={styles.ghostNumeralText}>{dayNum}</Text>
        </View>
      )}
    </Animated.View>
  );
};

// ── MAIN LANDING SCREEN ──
export const LandingScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const { user, accessToken } = useAuthStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [contentWidth, setContentWidth] = useState(WINDOW_WIDTH);
  const [screenHeight, setScreenHeight] = useState(WINDOW_HEIGHT);

  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Animation values for entrance motions
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Fade-in entrance animation with prefers-reduced-motion check
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reducedMotion) => {
      if (!reducedMotion) {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }
    });
  }, []);

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

  // Locale-safe real date computation: "TODAY · <WEEKDAY> <DD> <MON>"
  const formatToday = (d: Date) => {
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return `TODAY · ${dayName} ${dayNum} ${monthName}`;
  };

  const [todayString, setTodayString] = useState(() => formatToday(currentDate));

  // Keep date updated dynamically on midnight rollover and foreground wakeup
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

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0) setContentWidth(width);
    if (height > 0) setScreenHeight(height);
  };

  const dayNumber = currentDate.getDate();
  const ctaWidth = Math.min(contentWidth - 40, 480);
  const btnHeight = 60;
  const notchDepth = 18;

  return (
    <View
      style={styles.pageRoot}
      onLayout={handleLayout}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── BACKGROUND DECORATIONS (ISOLATED WRAPPER, zIndex: 0) ── */}
      <BackgroundDecorations
        screenWidth={contentWidth}
        screenHeight={screenHeight}
        dayNum={dayNumber}
        fadeAnim={fadeAnim}
      />

      {/* ── CONTENT LAYER (zIndex: 1, capped at 480px, responsive padding) ── */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom + 24, 32),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.contentConstrained}>
          {/* 1. Header row (44px high) */}
          <View style={styles.headerRow}>
            <Text style={styles.headerBrand}>JEC ACADEMICS</Text>
          </View>

          {/* 2. Ribbon zone (about 354px high, full-bleed, overflow hidden, margin-top 6px) */}
          <View
            style={styles.ribbonZoneContainer}
            aria-hidden={true}
          >
            {/* White pill "TODAY · <WEEKDAY> <DD> <MON>" top-left inside zone */}
            <View style={styles.todayPillWrapper}>
              <View style={styles.todayPill}>
                <Text style={styles.todayPillText}>{todayString}</Text>
              </View>
            </View>

            {/* Four tilted ribbons: alternating directions: Row 1 RIGHT, Row 2 LEFT, Row 3 RIGHT, Row 4 LEFT */}
            <View style={styles.ribbonsSlantedStack} pointerEvents="none">
              <TiltedRibbonStrip
                color={DayRibbonColors.blue}
                word1="SYLLABUS"
                word2="TOPICS"
                word3="LESSONS"
                textColor="#FFFFFF"
                direction="right"
                speed={8500}
              />
              <TiltedRibbonStrip
                color={DayRibbonColors.amber}
                word1="PLANNED"
                word2="TAUGHT"
                word3="COVERED"
                textColor={DayRibbonColors.ink}
                direction="left"
                speed={8500}
              />
              <TiltedRibbonStrip
                color={DayRibbonColors.coral}
                word1="TRACK"
                word2="REVIEW"
                word3="IMPROVE"
                textColor={DayRibbonColors.ink}
                direction="right"
                speed={8500}
              />
              <TiltedRibbonStrip
                color={DayRibbonColors.mint}
                word1="FACULTY"
                word2="COURSES"
                word3="REPORTS"
                textColor={DayRibbonColors.ink}
                direction="left"
                speed={8500}
              />
            </View>
          </View>

          {/* 3. College Eyebrow: "JAYA ENGINEERING COLLEGE" */}
          <View style={styles.heroSection}>
            <Text style={styles.collegeEyebrow}>JAYA ENGINEERING COLLEGE</Text>

            {/* 4. H1: "Course / Coverage / Report" on three lines */}
            <View style={styles.headingBlock}>
              <Text style={styles.headingLineDark}>Course</Text>
              <Text style={styles.headingLineBlue}>Coverage</Text>
              <Text style={styles.headingLineDark}>Report</Text>
            </View>

            {/* 5. Sub-line */}
            <Text style={styles.sublineText}>
              Continuous syllabus tracking and curriculum monitoring, one day at a time.
            </Text>
          </View>

          {/* 6. Flexible Spacer */}
          <View style={styles.flexibleSpacer} />

          {/* Bunting pennants in gap between sub-line and CTA */}
          <BuntingDecor width={ctaWidth} />

          {/* 7. CTA Button "Get Started" + arrow icon: 60px high, amber, swallowtail ends */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={[styles.ctaButton, { width: ctaWidth }]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Get Started"
            >
              {/* Swallowtail Polygon Background */}
              <Svg width={ctaWidth} height={btnHeight} viewBox={`0 0 ${ctaWidth} ${btnHeight}`}>
                <Polygon
                  points={`0,0 ${ctaWidth},0 ${ctaWidth - notchDepth},${btnHeight / 2} ${ctaWidth},${btnHeight} 0,${btnHeight} ${notchDepth},${btnHeight / 2}`}
                  fill={DayRibbonColors.amber}
                />
              </Svg>

              {/* Label Left, Arrow Right */}
              <View style={styles.ctaButtonContent} pointerEvents="none">
                <Text style={styles.ctaButtonText}>Get Started</Text>
                <Feather name="arrow-right" size={22} color={DayRibbonColors.ink} />
              </View>
            </TouchableOpacity>

            {/* 8. Footer Line */}
            <Text style={styles.footerText}>
              Official Institutional Platform · Anna University Affiliated
            </Text>
          </View>
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
  pageRoot: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: DayRibbonColors.page,
    position: 'relative',
    overflow: 'hidden',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentConstrained: {
    width: '100%',
    maxWidth: 480,
    flex: 1,
    justifyContent: 'space-between',
  },

  // 1. Header Row (44px high)
  headerRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerBrand: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 12,
    letterSpacing: 1.68, // .14em of 12px
    color: DayRibbonColors.blue,
    textTransform: 'uppercase',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DayRibbonColors.page,
    borderWidth: 1,
    borderColor: DayRibbonColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 2. Ribbon Zone (354px high, full-bleed, overflow hidden, margin-top 6px)
  ribbonZoneContainer: {
    height: 354,
    width: '100%',
    marginTop: 6,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  todayPillWrapper: {
    position: 'absolute',
    top: 8,
    left: 20,
    zIndex: 20,
  },
  todayPill: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.ink,
    backgroundColor: DayRibbonColors.page,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayPillText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 12,
    letterSpacing: 0.8,
    color: DayRibbonColors.ink,
    textTransform: 'uppercase',
  },

  // Tilted Ribbons: 1200px wide, 56px high, rotate(-12deg), stacked 58px apart
  ribbonsSlantedStack: {
    width: 1200,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
    marginTop: 10,
  },
  ribbonItemWrapper: {
    width: 1200,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 1, // Stacks closely at ~58px center-to-center
    overflow: 'hidden',
  },
  ribbonTickerTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: -450,
    height: 56,
  },
  ribbonUnit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ribbonWordText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 22,
    letterSpacing: 0.6,
    marginHorizontal: 8,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  // 3. Hero Section
  heroSection: {
    paddingHorizontal: 20,
    marginTop: -8,
    zIndex: 10,
  },
  collegeEyebrow: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 12,
    letterSpacing: 1.4,
    color: DayRibbonColors.muted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  headingBlock: {
    marginBottom: 10,
  },
  headingLineDark: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 54,
    lineHeight: 53, // line-height .98
    letterSpacing: -1.08, // -0.02em
    color: DayRibbonColors.ink,
  },
  headingLineBlue: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 54,
    lineHeight: 53, // line-height .98
    letterSpacing: -1.08, // -0.02em
    color: DayRibbonColors.blue,
  },
  sublineText: {
    fontFamily: DayRibbonFonts.body400,
    fontSize: 15,
    lineHeight: 22.5, // 1.5 line-height
    color: DayRibbonColors.bodyText,
    maxWidth: 300,
  },

  // 6. Flexible Spacer
  flexibleSpacer: {
    flex: 1,
    minHeight: 16,
  },

  // Bunting
  buntingContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    zIndex: 10,
  },

  // 7. CTA Section (60px high, amber, swallowtail ends)
  ctaSection: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  ctaButton: {
    height: 60,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 36,
  },
  ctaButtonText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 17,
    letterSpacing: 0.3,
    color: DayRibbonColors.ink,
  },

  // 8. Footer Line
  footerText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 11,
    color: DayRibbonColors.muted,
    textAlign: 'center',
    marginTop: 14,
  },

  // ── DECORATIONS STYLES ──
  topMiniRibbonsCluster: {
    position: 'absolute',
    top: 0,
    left: '52%',
    flexDirection: 'row',
    zIndex: 2,
  },
  ghostNumeralWrapper: {
    position: 'absolute',
    right: -15,
    top: '46%',
    zIndex: 1,
    opacity: 0.9,
  },
  ghostNumeralText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 210,
    lineHeight: 210,
    letterSpacing: -10.5, // -0.05em of 210
    color: DayRibbonColors.ghost,
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
    backgroundColor: DayRibbonColors.page,
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
