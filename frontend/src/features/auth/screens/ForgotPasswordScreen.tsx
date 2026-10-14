import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResetRequest = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter your institutional email');
      return;
    }
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={EditorialColors.bg} />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingTop: Math.max(insets.top + 16, EditorialSpacing.topSafeArea),
            paddingBottom: Math.max(insets.bottom + 24, 32),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Back Navigation Button */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Back to sign in"
          >
            <Feather name="arrow-left" size={20} color={EditorialColors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTag}>RECOVERY</Text>
        </View>

        {/* Headline */}
        <View style={styles.titleSection}>
          <Text style={styles.headline}>
            {isSubmitted ? 'REQUEST SENT' : 'RESET PASSWORD'}
            <Text style={styles.accentDot}>.</Text>
          </Text>
          <Text style={styles.subtext}>
            {isSubmitted
              ? `If ${email} is registered with Jaya Engineering College CCR, password reset instructions have been forwarded to your institutional mailbox.`
              : 'Enter your registered faculty or administrator email address to request password credentials recovery.'}
          </Text>
        </View>

        {/* 4px Heavy Ink Rule */}
        <View style={styles.heavyRule} />

        {!isSubmitted ? (
          <View style={styles.formSection}>
            <View style={styles.inputBlock}>
              <Text style={styles.fieldLabel}>INSTITUTIONAL EMAIL</Text>
              <TextInput
                style={[
                  styles.underlineInput,
                  error ? styles.inputErrorBorder : null,
                ]}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (error) setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="e.g. drkaruppaiya@ccr.edu"
                placeholderTextColor={EditorialColors.muted}
              />
              {!!error && (
                <Text style={styles.errorText}>
                  {error.toUpperCase()}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleResetRequest}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={EditorialColors.white} size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>SEND RECOVERY LINK</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.successSection}>
            <View style={styles.noticeBlock}>
              <Text style={styles.noticeTag}>SECURITY NOTICE</Text>
              <Text style={styles.noticeBody}>
                For immediate assistance or locked accounts, please contact the Central IT Administration at it-support@jec.ac.in.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>RETURN TO SIGN IN</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            JAYA ENGINEERING COLLEGE • CCR SECURITY VERIFIED
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: EditorialSpacing.screenHorizontal,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    backgroundColor: EditorialColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTag: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
  },
  titleSection: {
    marginBottom: 20,
  },
  headline: {
    fontFamily: EditorialFonts.display,
    fontSize: 40,
    lineHeight: 44,
    color: EditorialColors.ink,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  accentDot: {
    color: EditorialColors.accent,
  },
  subtext: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: EditorialColors.muted,
  },
  heavyRule: {
    width: '100%',
    height: EditorialRules.section,
    backgroundColor: EditorialColors.ink,
    marginBottom: 28,
  },
  formSection: {
    width: '100%',
    marginBottom: 32,
  },
  inputBlock: {
    marginBottom: 28,
  },
  fieldLabel: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
    marginBottom: 6,
  },
  underlineInput: {
    height: 48,
    borderBottomWidth: 2,
    borderBottomColor: EditorialColors.ink,
    fontFamily: EditorialFonts.semibold,
    fontSize: 16,
    color: EditorialColors.ink,
    paddingVertical: 8,
  },
  inputErrorBorder: {
    borderBottomColor: EditorialColors.accent,
  },
  errorText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.accent,
    marginTop: 6,
  },
  primaryButton: {
    height: 54,
    width: '100%',
    backgroundColor: EditorialColors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.white,
  },
  successSection: {
    width: '100%',
    marginBottom: 32,
  },
  noticeBlock: {
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    padding: 16,
    marginBottom: 24,
    backgroundColor: EditorialColors.bg,
  },
  noticeTag: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.ink,
    marginBottom: 6,
  },
  noticeBody: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: EditorialColors.ink,
  },
  footerNote: {
    marginTop: 'auto',
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 10,
    letterSpacing: 1.5,
    color: EditorialColors.muted,
    textAlign: 'center',
  },
});
