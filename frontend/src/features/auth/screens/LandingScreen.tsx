import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Landing'>;

export const LandingScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── TOP SECTION ── */}
        <View style={styles.topContainer}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.jayaText}>JAYA</Text>
          <View style={styles.collegeNameRow}>
            <View style={styles.line} />
            <Text style={styles.collegeNameText}>ENGINEERING COLLEGE</Text>
            <View style={styles.line} />
          </View>
          <MaterialCommunityIcons name="school" size={18} color="#0B41CD" style={styles.schoolIcon} />
          <Text style={styles.mottoText}>Excellence in Education. Legacy in Service.</Text>
        </View>

        {/* ── EMBLEM EMBED CIRCLE ── */}
        <View style={styles.emblemContainer}>
          <View style={styles.emblemShadowOuter}>
            <Image
              source={require('../../../assets/landing_emblem.png')}
              style={styles.emblemImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ── APP TITLE BLOCK ── */}
        <View style={styles.titleContainer}>
          <Text style={styles.appTitleText}>
            <Text style={styles.blueTitle}>CCR </Text>
            <Text style={styles.darkTitle}>GENERATOR</Text>
          </Text>
          <Text style={styles.appSubtitleText}>COURSE COVERAGE REPORT MANAGEMENT SYSTEM</Text>
          <View style={styles.accentLine} />
        </View>

        {/* ── LAPTOP ILLUSTRATION BLOCK ── */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../../../assets/landing_illustration.png')}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        {/* ── GET STARTED ACTION BUTTON ── */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>GET STARTED</Text>
          <View style={styles.arrowContainer}>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#0B41CD" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 35,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '500',
  },
  jayaText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0B41CD',
    letterSpacing: -1,
    marginTop: 4,
  },
  collegeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    width: '90%',
  },
  line: {
    height: 1,
    backgroundColor: '#E2E8F0',
    flex: 1,
  },
  collegeNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginHorizontal: 10,
    letterSpacing: 0.5,
  },
  schoolIcon: {
    marginTop: 8,
  },
  mottoText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 6,
    fontStyle: 'italic',
  },
  emblemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  emblemShadowOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B41CD',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#EFF2F6',
  },
  emblemImage: {
    width: 170,
    height: 170,
  },
  titleContainer: {
    alignItems: 'center',
    width: '100%',
  },
  appTitleText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  blueTitle: {
    color: '#0B41CD',
  },
  darkTitle: {
    color: '#1E293B',
  },
  appSubtitleText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginTop: 6,
    textAlign: 'center',
  },
  accentLine: {
    width: 32,
    height: 3,
    backgroundColor: '#0B41CD',
    borderRadius: 1.5,
    marginTop: 10,
  },
  illustrationContainer: {
    width: '100%',
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  illustrationImage: {
    width: '95%',
    height: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B41CD',
    height: 56,
    borderRadius: 28,
    width: '100%',
    shadowColor: '#0B41CD',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  arrowContainer: {
    position: 'absolute',
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

