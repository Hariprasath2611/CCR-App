import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Landing'>;

export const LandingScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const logoWidth = width * 0.65;
  const logoHeight = logoWidth * (215 / 239); // Aspect ratio of logo.jpeg (239 width, 215 height)

  return (
    <View style={styles.container}>
      {/* Curved Blue Header */}
      <View style={styles.blueHeader}>
        <Text style={styles.collegeName}>JAYA ENGINEERING COLLEGE</Text>
        <Image
          source={require('../../../assets/logo_transparent.png')}
          style={[styles.logo, { width: logoWidth, height: logoHeight }]}
          resizeMode="contain"
        />
      </View>

      {/* Main Content Area */}
      <View style={styles.contentArea}>
        <View style={styles.titleContainer}>
          <Text style={styles.appTitle}>CCR GENERATOR</Text>
          <Text style={styles.appSubtitle}>COURSE COVERAGE REPORT MANAGEMENT SYSTEM</Text>
        </View>

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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8', // light gray background
  },
  blueHeader: {
    backgroundColor: '#0B41CD', // vibrant dark blue
    height: height * 0.58,
    width: '100%',
    borderBottomLeftRadius: width * 0.8, // curves up on the left side
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: height * 0.08,
  },
  collegeName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    marginBottom: height * 0.04,
  },
  logo: {
    alignSelf: 'center',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: height * 0.04,
    paddingBottom: height * 0.05,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B', // dark slate
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B', // gray
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 16,
    letterSpacing: 0.8,
    paddingHorizontal: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B41CD',
    height: 56,
    borderRadius: 14,
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
    letterSpacing: 1,
  },
  arrowContainer: {
    position: 'absolute',
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

