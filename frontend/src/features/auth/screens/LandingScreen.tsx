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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '@config/env';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Landing'>;

export const LandingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [serverUrl, setServerUrl] = useState('');

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

  // Format today's date banner string
  const getTodayString = () => {
    const d = new Date();
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return `TODAY · ${dayName} ${dayNum} ${monthName}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── TOP HEADER ── */}
        <View style={styles.topHeader}>
          <Text style={styles.headerTag}>JEC ACADEMICS</Text>

          <TouchableOpacity
            style={styles.settingsCircleBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
            accessibilityLabel="Server settings"
          >
            <Feather name="settings" size={19} color={DayRibbonColors.ink} />
          </TouchableOpacity>
        </View>

        {/* ── TODAY PILL ── */}
        <View style={styles.todayPillWrapper}>
          <View style={styles.todayPill}>
            <Text style={styles.todayPillText}>{getTodayString()}</Text>
          </View>
        </View>

        {/* ── SLANTED "DAY RIBBON" STRIPES BANNER ── */}
        <View style={styles.ribbonWrapper}>
          <View style={styles.ribbonStack}>
            {/* Band 1: Cobalt Blue */}
            <View style={[styles.ribbonBand, styles.bandCobalt]}>
              <Text style={styles.bandTextWhite}>
                SYLLABUS{'     '}TOPICS{'     '}LESSONS
              </Text>
            </View>

            {/* Band 2: Warm Amber Golden */}
            <View style={[styles.ribbonBand, styles.bandAmber]}>
              <Text style={styles.bandTextDark}>
                PLANNED{'     '}TAUGHT{'     '}COVERED
              </Text>
            </View>

            {/* Band 3: Coral Red */}
            <View style={[styles.ribbonBand, styles.bandCoral]}>
              <Text style={styles.bandTextDark}>
                TRACK{'     '}REVIEW{'     '}IMPROVE
              </Text>
            </View>

            {/* Band 4: Mint Green */}
            <View style={[styles.ribbonBand, styles.bandMint]}>
              <Text style={styles.bandTextDark}>
                FACULTY{'     '}COURSES{'     '}REPORTS
              </Text>
            </View>
          </View>
        </View>

        {/* ── HERO TEXT CONTENT ── */}
        <View style={styles.heroTextSection}>
          <Text style={styles.collegeEyebrow}>JAYA ENGINEERING COLLEGE</Text>

          <View style={styles.stackedTitleBox}>
            <Text style={styles.titleWordDark}>Course</Text>
            <Text style={styles.titleWordCobalt}>Coverage</Text>
            <Text style={styles.titleWordDark}>Report</Text>
          </View>

          <Text style={styles.subtitleText}>
            Continuous syllabus tracking and curriculum monitoring, one day at a time.
          </Text>
        </View>

        {/* ── BOTTOM RIBBON CTA BLOCK ── */}
        <View style={styles.bottomBlock}>
          <TouchableOpacity
            style={styles.ribbonButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.88}
            accessibilityLabel="Get Started"
          >
            {/* Left Notch Triangle (cuts into button) */}
            <View style={styles.notchLeft} />

            <View style={styles.ribbonButtonContent}>
              <Text style={styles.ribbonButtonText}>Get Started</Text>
              <Feather name="arrow-right" size={20} color={DayRibbonColors.ink} />
            </View>

            {/* Right Notch Triangle (cuts into button) */}
            <View style={styles.notchRight} />
          </TouchableOpacity>

          <Text style={styles.legalMeta}>
            Official Institutional Platform · Anna University Affiliated
          </Text>
        </View>
      </ScrollView>

      {/* ── SERVER SETTINGS MODAL ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Server Settings</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
                accessibilityLabel="Close modal"
              >
                <Feather name="x" size={20} color={DayRibbonColors.ink} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            <Text style={styles.modalDescription}>
              Configure the API Endpoint for the Course Completion Monitoring System backend database.
            </Text>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>API BASE URL</Text>
              <TextInput
                style={styles.inputField}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="https://your-server-url.com/v1"
                placeholderTextColor={DayRibbonColors.mutedSoft}
                selectionColor={DayRibbonColors.cobalt}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={handleReset}
              >
                <Text style={styles.secondaryBtnText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={handleSave}
              >
                <Text style={styles.primaryBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },

  // Top Section
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTag: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    color: DayRibbonColors.cobalt,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  settingsCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Today Pill
  todayPillWrapper: {
    paddingHorizontal: 24,
    marginTop: 4,
    marginBottom: 16,
  },
  todayPill: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: DayRibbonColors.ink,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
  },
  todayPillText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.ink,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // Ribbon Banner
  ribbonWrapper: {
    width: '100%',
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbonStack: {
    width: width * 1.35,
    transform: [{ rotate: '-8.5deg' }],
  },
  ribbonBand: {
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bandCobalt: {
    backgroundColor: '#2B3FE0',
  },
  bandAmber: {
    backgroundColor: '#FBA919',
  },
  bandCoral: {
    backgroundColor: '#FF4757',
  },
  bandMint: {
    backgroundColor: '#20D489',
  },
  bandTextWhite: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  bandTextDark: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 18,
    color: DayRibbonColors.ink,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Hero Text
  heroTextSection: {
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 28,
  },
  collegeEyebrow: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  stackedTitleBox: {
    marginBottom: 14,
  },
  titleWordDark: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 46,
    lineHeight: 50,
    color: DayRibbonColors.ink,
    letterSpacing: -0.5,
  },
  titleWordCobalt: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 46,
    lineHeight: 50,
    color: DayRibbonColors.cobalt,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 14,
    lineHeight: 22,
    color: DayRibbonColors.muted,
  },

  // Bottom CTA
  bottomBlock: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  ribbonButton: {
    height: 54,
    width: '100%',
    backgroundColor: '#FBA919',
    position: 'relative',
    justifyContent: 'center',
  },
  notchLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    borderTopWidth: 27,
    borderBottomWidth: 27,
    borderLeftWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
    zIndex: 2,
  },
  notchRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 0,
    height: 0,
    borderTopWidth: 27,
    borderBottomWidth: 27,
    borderRightWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#FFFFFF',
    zIndex: 2,
  },
  ribbonButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 38,
  },
  ribbonButtonText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    color: DayRibbonColors.ink,
  },
  legalMeta: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 11,
    color: DayRibbonColors.muted,
    textAlign: 'center',
    marginTop: 12,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 19, 48, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 24,
    ...DayRibbonShapes.shadow,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 22,
    color: DayRibbonColors.ink,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.bg,
  },
  modalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: DayRibbonColors.line,
    marginBottom: 16,
  },
  modalDescription: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
    lineHeight: 18,
    marginBottom: 20,
  },
  fieldBlock: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    marginBottom: 6,
  },
  inputField: {
    height: 48,
    backgroundColor: DayRibbonColors.bg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    fontFamily: DayRibbonFonts.body600,
    fontSize: 14,
    color: DayRibbonColors.ink,
    paddingHorizontal: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  secondaryActionBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    color: DayRibbonColors.ink,
  },
  primaryActionBtn: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: DayRibbonColors.cobalt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    color: DayRibbonColors.white,
  },
});

export default LandingScreen;
