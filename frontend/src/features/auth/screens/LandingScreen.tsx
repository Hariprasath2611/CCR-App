import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '@config/env';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Landing'>;

export const LandingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [serverUrl, setServerUrl] = useState('');

  const logoWidth = Math.min(width * 0.5, 200);
  const logoHeight = logoWidth * (213 / 244);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={DayRibbonColors.bg} />

      {/* Top Bar with Settings */}
      <View style={styles.topBar}>
        <View style={styles.institutionTag}>
          <Text style={styles.institutionCode}>JEC ACADEMICS</Text>
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
          accessibilityLabel="Server settings"
        >
          <Feather name="settings" size={20} color={DayRibbonColors.ink} />
        </TouchableOpacity>
      </View>

      <View style={styles.heroSection}>
        {/* Emblem Slot */}
        <View style={styles.logoFrame}>
          <Image
            source={require('../../../assets/logo-removebg-preview.png')}
            style={{ width: logoWidth, height: logoHeight }}
            resizeMode="contain"
          />
        </View>

        {/* Institution Title */}
        <View style={styles.institutionInfo}>
          <Text style={styles.collegeName}>JAYA ENGINEERING COLLEGE</Text>
          <Text style={styles.collegeTagline}>EXCELLENCE IN EDUCATION • LEGACY IN SERVICE</Text>
        </View>

        {/* 1px Line Divider */}
        <View style={styles.divider} />

        {/* App Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.titleHeadline}>Course Coverage Report</Text>
          <Text style={styles.titleSubtitle}>
            Continuous syllabus tracking & curriculum monitoring system
          </Text>
        </View>
      </View>

      {/* Bottom CTA Block */}
      <View style={styles.bottomBlock}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Feather name="arrow-right" size={18} color={DayRibbonColors.white} />
        </TouchableOpacity>

        <Text style={styles.legalMeta}>
          Official Institutional Platform • Anna University Affiliated
        </Text>
      </View>

      {/* Server Settings Modal */}
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
    backgroundColor: DayRibbonColors.bg,
    justifyContent: 'space-between',
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
    paddingTop: DayRibbonSpacing.screenTop,
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  institutionTag: {
    paddingVertical: 4,
  },
  institutionCode: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    letterSpacing: 1,
    color: DayRibbonColors.cobalt,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...DayRibbonShapes.shadow,
  },
  heroSection: {
    alignItems: 'flex-start',
    width: '100%',
  },
  logoFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'center',
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 16,
    ...DayRibbonShapes.shadow,
  },
  institutionInfo: {
    marginBottom: 16,
    width: '100%',
  },
  collegeName: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 15,
    letterSpacing: 0.5,
    color: DayRibbonColors.ink,
    marginBottom: 4,
  },
  collegeTagline: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: DayRibbonColors.line,
    marginBottom: 20,
  },
  titleBlock: {
    width: '100%',
  },
  titleHeadline: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: DayRibbonColors.ink,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  titleSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 14,
    lineHeight: 20,
    color: DayRibbonColors.muted,
  },
  bottomBlock: {
    width: '100%',
    gap: 14,
  },
  getStartedButton: {
    height: 52,
    width: '100%',
    backgroundColor: DayRibbonColors.cobalt,
    borderRadius: DayRibbonShapes.buttonRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...DayRibbonShapes.shadow,
  },
  getStartedText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 15,
    letterSpacing: 0.5,
    color: DayRibbonColors.white,
  },
  legalMeta: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    textAlign: 'center',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 19, 48, 0.4)',
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
