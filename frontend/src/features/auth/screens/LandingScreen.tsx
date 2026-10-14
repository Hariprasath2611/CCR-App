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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '@config/env';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing, EditorialType } from '@theme/editorial';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Landing'>;

export const LandingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [serverUrl, setServerUrl] = useState('');

  const logoWidth = Math.min(width * 0.55, 220);
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
      <StatusBar barStyle="dark-content" backgroundColor={EditorialColors.bg} />

      {/* Top Bar with Settings */}
      <View style={styles.topBar}>
        <View style={styles.institutionTag}>
          <Text style={styles.institutionCode}>JEC-ACADEMICS</Text>
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
          accessibilityLabel="Server settings"
        >
          <Feather name="settings" size={20} color={EditorialColors.ink} />
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

        {/* 4px Heavy Ink Rule */}
        <View style={styles.heavyRule} />

        {/* App Title with vermilion full stop */}
        <View style={styles.titleBlock}>
          <Text style={styles.titleHeadline}>
            CCR GENERATOR<Text style={styles.accentDot}>.</Text>
          </Text>
          <Text style={styles.titleSubtitle}>
            COURSE COVERAGE REPORT MANAGEMENT SYSTEM
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
          <Text style={styles.getStartedText}>GET STARTED</Text>
          <Feather name="arrow-right" size={18} color={EditorialColors.white} />
        </TouchableOpacity>

        <Text style={styles.legalMeta}>
          OFFICIAL INSTITUTIONAL PLATFORM • ANNA UNIVERSITY AFFILIATED
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
              <Text style={styles.modalTitle}>
                SERVER SETTINGS<Text style={styles.accentDot}>.</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
                accessibilityLabel="Close modal"
              >
                <Feather name="x" size={20} color={EditorialColors.ink} />
              </TouchableOpacity>
            </View>

            <View style={styles.hairlineRule} />

            <Text style={styles.modalDescription}>
              Configure the API Endpoint for the Course Completion Monitoring System backend database.
            </Text>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>API BASE URL</Text>
              <TextInput
                style={styles.underlineInput}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="https://your-server-url.com/v1"
                placeholderTextColor={EditorialColors.muted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.outlineActionBtn}
                onPress={handleReset}
              >
                <Text style={styles.outlineBtnText}>RESET</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.outlineActionBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.outlineBtnText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={handleSave}
              >
                <Text style={styles.primaryBtnText}>SAVE</Text>
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
    backgroundColor: EditorialColors.bg,
    justifyContent: 'space-between',
    paddingHorizontal: EditorialSpacing.screenHorizontal,
    paddingTop: EditorialSpacing.topSafeArea,
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
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    backgroundColor: EditorialColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  institutionInfo: {
    marginBottom: 16,
    width: '100%',
  },
  collegeName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 15,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  collegeTagline: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 10,
    letterSpacing: 1.5,
    color: EditorialColors.muted,
  },
  heavyRule: {
    width: '100%',
    height: EditorialRules.section,
    backgroundColor: EditorialColors.ink,
    marginBottom: 20,
  },
  hairlineRule: {
    width: '100%',
    height: EditorialRules.divider,
    backgroundColor: EditorialColors.ink,
    marginBottom: 16,
  },
  titleBlock: {
    width: '100%',
  },
  titleHeadline: {
    fontFamily: EditorialFonts.display,
    fontSize: 38,
    lineHeight: 42,
    color: EditorialColors.ink,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  accentDot: {
    color: EditorialColors.accent,
  },
  titleSubtitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
    lineHeight: 16,
  },
  bottomBlock: {
    width: '100%',
    gap: 14,
  },
  getStartedButton: {
    height: 54,
    width: '100%',
    backgroundColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  getStartedText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.white,
  },
  legalMeta: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 10,
    letterSpacing: 1.5,
    color: EditorialColors.muted,
    textAlign: 'center',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 17, 17, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: EditorialColors.bg,
    borderWidth: 2,
    borderColor: EditorialColors.ink,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: EditorialFonts.display,
    fontSize: 22,
    color: EditorialColors.ink,
    letterSpacing: 0.5,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
  },
  modalDescription: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    color: EditorialColors.muted,
    lineHeight: 18,
    marginBottom: 20,
  },
  fieldBlock: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
    marginBottom: 6,
  },
  underlineInput: {
    height: 44,
    borderBottomWidth: 2,
    borderBottomColor: EditorialColors.ink,
    fontFamily: EditorialFonts.semibold,
    fontSize: 15,
    color: EditorialColors.ink,
    paddingVertical: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  outlineActionBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 2,
    color: EditorialColors.ink,
  },
  primaryActionBtn: {
    height: 44,
    paddingHorizontal: 20,
    backgroundColor: EditorialColors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 2,
    color: EditorialColors.white,
  },
});
