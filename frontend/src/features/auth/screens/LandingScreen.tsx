import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { Palette } from '@theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Landing'>;

export const LandingScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      {/* ── Abstract Background Designs & Glassmorphic Orbs ── */}
      <View style={styles.topOrb} />
      <View style={styles.centerLeftOrb} />
      <View style={styles.bottomRightOrb} />
      <View style={styles.bottomLeftOrb} />

      <View style={styles.content}>
        
        {/* ── Top Header Section ── */}
        <View style={styles.headerContainer}>
          {/* Academic Portal Pill Badge */}
          <View style={styles.portalBadge}>
            <MaterialCommunityIcons name="shield-check" size={14} color="#1E40AF" />
            <Text style={styles.portalBadgeText}>OFFICIAL ACADEMIC PORTAL</Text>
          </View>

          {/* Premium Rounded Logo Container */}
          <View style={styles.logoFrame}>
            <Image
              source={require('../../../assets/logo.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.collegeName}>JAYA ENGINEERING COLLEGE</Text>
          <View style={styles.collegeLine} />
        </View>

        {/* ── Main Feature Headline ── */}
        <View style={styles.headlineContainer}>
          <Text style={styles.appTitle}>CCR Generator</Text>
          <Text style={styles.appSubtitle}>Course Coverage Report Management System</Text>
        </View>

        {/* ── Floating Illustration Card ── */}
        <View style={styles.illustrationFrame}>
          <Image
            source={require('../../../assets/landing_illustration.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* ── Footer Navigation Actions ── */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>GET STARTED</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#FFFFFF" style={styles.arrowIcon} />
          </TouchableOpacity>

          <View style={styles.secureBadge}>
            <MaterialCommunityIcons name="lock-outline" size={12} color="#94A3B8" />
            <Text style={styles.secureText}>Authorized Access Only · SSL Secured</Text>
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Off-white premium workspace canvas
  },
  // Abstract BG Shapes
  topOrb: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E0E7FF',
    opacity: 0.6,
  },
  centerLeftOrb: {
    position: 'absolute',
    top: height * 0.35,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#EFF6FF',
    opacity: 0.7,
  },
  bottomRightOrb: {
    position: 'absolute',
    bottom: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#EEF2FF',
    opacity: 0.8,
  },
  bottomLeftOrb: {
    position: 'absolute',
    bottom: height * 0.15,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECFDF5',
    opacity: 0.5,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 44,
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  portalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
  },
  portalBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E40AF',
    marginLeft: 5,
    letterSpacing: 0.8,
  },
  logoFrame: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  collegeName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
    marginTop: 14,
    letterSpacing: 1.5,
  },
  collegeLine: {
    width: 40,
    height: 3,
    backgroundColor: '#0F52BA',
    borderRadius: 2,
    marginTop: 10,
  },

  headlineContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A', // Slate dark
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 10,
  },

  illustrationFrame: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 0.8)',
    borderRadius: 20,
    padding: 16,
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  illustration: {
    width: '95%',
    height: '100%',
  },

  footerContainer: {
    alignItems: 'center',
    width: '100%',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F52BA',
    paddingVertical: 15,
    paddingHorizontal: 36,
    borderRadius: 30,
    shadowColor: '#0F52BA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    width: '85%',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  arrowIcon: {
    marginLeft: 6,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  secureText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
});
