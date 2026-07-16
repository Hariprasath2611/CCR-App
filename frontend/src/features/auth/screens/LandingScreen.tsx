import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Dimensions, Modal, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '@config/env';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Landing'>;

// Custom Dot Grid Component for UI decoration
const DotGrid = () => (
  <View style={styles.dotGrid}>
    {Array.from({ length: 6 }).map((_, r) => (
      <View key={r} style={styles.dotRow}>
        {Array.from({ length: 6 }).map((_, c) => (
          <View key={c} style={styles.dot} />
        ))}
      </View>
    ))}
  </View>
);

export const LandingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [serverUrl, setServerUrl] = useState('');

  // Size of the central logo
  const emblemSize = width * 0.72;
  const logoWidth = emblemSize * 0.95;
  const logoHeight = logoWidth * (213 / 244); // Aspect ratio of logo-removebg-preview.png (244x213)

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
      {/* Settings cog icon button in the top right corner */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="cog" size={24} color="#0B41CD" />
      </TouchableOpacity>

      {/* Decorative Dot Grids (Top Right and Top Left subtle overlays) */}
      <DotGrid />
      <View style={[styles.dotGridLeft, { top: height * 0.12 }]}>
        {Array.from({ length: 4 }).map((_, r) => (
          <View key={r} style={styles.dotRow}>
            {Array.from({ length: 3 }).map((_, c) => (
              <View key={c} style={styles.dot} />
            ))}
          </View>
        ))}
      </View>

      {/* Decorative Bottom Waves */}
      <View style={styles.waveContainer}>
        <View style={styles.wave1} />
        <View style={styles.wave2} />
      </View>

      {/* Top Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeLine} />
          <Text style={styles.welcomeText}>Welcome to</Text>
          <View style={styles.welcomeLine} />
        </View>

        <Text style={styles.collegeNameJaya}>JAYA</Text>
        <Text style={styles.collegeNameSub}>ENGINEERING COLLEGE</Text>

        <View style={styles.iconRow}>
          <View style={styles.iconLine} />
          <MaterialCommunityIcons name="school" size={18} color="#0B41CD" />
          <View style={styles.iconLine} />
        </View>

        <Text style={styles.tagline}>Excellence in Education. Legacy in Service.</Text>
      </View>

      {/* Center Image Section (logo-removebg-preview.png) */}
      <View style={styles.emblemContainer}>
        <Image
          source={require('../../../assets/logo-removebg-preview.png')}
          style={{ width: logoWidth, height: logoHeight }}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Title & Action Section */}
      <View style={styles.bottomContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.appTitle}>
            <Text style={styles.ccrText}>CCR</Text> GENERATOR
          </Text>
          <Text style={styles.appSubtitle}>
            COURSE COVERAGE REPORT MANAGEMENT SYSTEM
          </Text>
          <View style={styles.titleUnderline} />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>GET STARTED</Text>
          <View style={styles.arrowCircle}>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#0B41CD" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Premium Server Config Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="server" size={28} color="#0B41CD" />
              <Text style={styles.modalTitle}>Server Settings</Text>
            </View>
            
            <Text style={styles.modalDescription}>
              Configure the API Endpoint for the Course Completion Monitoring System backend database.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>API BASE URL</Text>
              <TextInput
                style={styles.textInput}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="https://your-server-url.com/v1"
                placeholderTextColor="#A0AEC0"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.resetButton]}
                onPress={handleReset}
              >
                <Text style={styles.resetButtonText}>RESET</Text>
              </TouchableOpacity>
              
              <View style={styles.rightActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>CANCEL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>SAVE</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#F6FAFD', // Light, premium blue-white background
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.03,
  },
  // Dot decoration styles
  dotGrid: {
    position: 'absolute',
    top: 40,
    right: 20,
    opacity: 0.15,
  },
  dotGridLeft: {
    position: 'absolute',
    left: 20,
    opacity: 0.12,
  },
  dotRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#0B41CD',
    marginHorizontal: 4,
  },
  // Overlapping wave footer styles
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.18,
    overflow: 'hidden',
    zIndex: -1,
  },
  wave1: {
    position: 'absolute',
    bottom: -height * 0.05,
    left: -width * 0.1,
    width: width * 1.2,
    height: height * 0.18,
    backgroundColor: '#E2EEFC',
    borderTopLeftRadius: width * 0.6,
    borderTopRightRadius: width * 0.5,
    opacity: 0.55,
  },
  wave2: {
    position: 'absolute',
    bottom: -height * 0.07,
    left: -width * 0.2,
    width: width * 1.4,
    height: height * 0.18,
    backgroundColor: '#EDF5FD',
    borderTopLeftRadius: width * 0.5,
    borderTopRightRadius: width * 0.7,
    opacity: 0.8,
  },
  // Header styles
  headerContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: height * 0.01,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  welcomeLine: {
    width: 30,
    height: 1.2,
    backgroundColor: '#B9D5FA',
    marginHorizontal: 10,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  collegeNameJaya: {
    fontSize: 50,
    fontWeight: '900',
    color: '#0B41CD',
    letterSpacing: 4,
    lineHeight: 52,
  },
  collegeNameSub: {
    fontSize: 16,
    fontWeight: '800',
    color: '#102A43',
    letterSpacing: 2,
    marginTop: 2,
    marginBottom: 10,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconLine: {
    width: 35,
    height: 1.2,
    backgroundColor: '#B9D5FA',
    marginHorizontal: 12,
  },
  tagline: {
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: '600',
    color: '#64748B',
  },
  // Central emblem styles
  emblemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: height * 0.02,
    position: 'relative',
  },
  // Bottom content styles
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: height * 0.02,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#102A43',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  ccrText: {
    color: '#0B41CD',
  },
  appSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.8,
    lineHeight: 14,
    paddingHorizontal: 10,
  },
  titleUnderline: {
    width: 45,
    height: 3,
    backgroundColor: '#0B41CD',
    borderRadius: 1.5,
    marginTop: 12,
  },
  // Button styles
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B41CD', // Vibrant royal blue to match screenshot button
    height: 56,
    borderRadius: 28, // Fully rounded pill shape
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#0B41CD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  arrowCircle: {
    position: 'absolute',
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18, // Circular
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 25,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#102A43',
    marginLeft: 10,
  },
  modalDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#486581',
    marginBottom: 8,
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: '#F0F4F8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#102A43',
    borderWidth: 1,
    borderColor: '#D9E2EC',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  resetButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#627D98',
  },
  saveButton: {
    backgroundColor: '#0B41CD',
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
