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
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

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
      <StatusBar barStyle="dark-content" backgroundColor={DayRibbonColors.bg} />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingTop: Math.max(insets.top + 16, DayRibbonSpacing.screenTop),
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
            <Feather name="arrow-left" size={20} color={DayRibbonColors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTag}>RECOVERY</Text>
        </View>

        {/* Headline */}
        <View style={styles.titleSection}>
          <Text style={styles.headline}>
            {isSubmitted ? 'Request Sent' : 'Reset Password'}
          </Text>
          <Text style={styles.subtext}>
            {isSubmitted
              ? `If ${email} is registered with Jaya Engineering College CCR, password reset instructions have been forwarded to your institutional mailbox.`
              : 'Enter your registered faculty or administrator email address to request password credentials recovery.'}
          </Text>
        </View>

        {/* 1px Line Divider */}
        <View style={styles.divider} />

        {!isSubmitted ? (
          <View style={styles.formSection}>
            <View style={styles.inputBlock}>
              <Text style={styles.fieldLabel}>INSTITUTIONAL EMAIL</Text>
              <View
                style={[
                  styles.inputBox,
                  isFocused && styles.inputFocused,
                  error ? styles.inputError : null,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (error) setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="e.g. drkaruppaiya@ccr.edu"
                  placeholderTextColor={DayRibbonColors.mutedSoft}
                  selectionColor={DayRibbonColors.cobalt}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </View>
              {!!error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleResetRequest}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={DayRibbonColors.white} size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Send Recovery Link</Text>
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
              <Text style={styles.primaryButtonText}>Return to Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            Jaya Engineering College • CCR Security Verified
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
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
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...DayRibbonShapes.shadow,
  },
  headerTag: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    letterSpacing: 1,
    color: DayRibbonColors.cobalt,
  },
  titleSection: {
    marginBottom: 16,
  },
  headline: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: DayRibbonColors.ink,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtext: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 14,
    lineHeight: 20,
    color: DayRibbonColors.muted,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: DayRibbonColors.line,
    marginBottom: 24,
  },
  formSection: {
    width: '100%',
    marginBottom: 32,
  },
  inputBlock: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    marginBottom: 6,
  },
  inputBox: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    paddingHorizontal: 14,
    minHeight: 52,
    justifyContent: 'center',
  },
  inputFocused: {
    borderColor: DayRibbonColors.cobalt,
  },
  inputError: {
    borderColor: DayRibbonColors.warn,
  },
  input: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 15,
    color: DayRibbonColors.ink,
    paddingVertical: 10,
  },
  errorText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 12,
    color: DayRibbonColors.warn,
    marginTop: 4,
    marginLeft: 2,
  },
  primaryButton: {
    height: 52,
    width: '100%',
    backgroundColor: DayRibbonColors.cobalt,
    borderRadius: DayRibbonShapes.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    ...DayRibbonShapes.shadow,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    letterSpacing: 0.5,
    color: DayRibbonColors.white,
  },
  successSection: {
    width: '100%',
    marginBottom: 32,
  },
  noticeBlock: {
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.cardRadius,
    padding: 16,
    marginBottom: 24,
    backgroundColor: DayRibbonColors.surface,
    ...DayRibbonShapes.shadow,
  },
  noticeTag: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.cobalt,
    marginBottom: 6,
  },
  noticeBody: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    lineHeight: 18,
    color: DayRibbonColors.ink,
  },
  footerNote: {
    marginTop: 'auto',
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
