import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppTextInput } from '@components/common/AppTextInput';
import { AppButton } from '@components/common/AppButton';
import { ms } from '@theme/responsive';

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

    // Simulate password reset notification / request
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
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: Math.max(insets.top + ms(20), ms(40)), paddingBottom: Math.max(insets.bottom + ms(20), ms(40)) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={Palette.primary} />
          <Text style={styles.backButtonText}>Back to Sign In</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name={isSubmitted ? 'email-check-outline' : 'lock-reset'}
              size={36}
              color={Palette.primary}
            />
          </View>

          <Text style={styles.title}>
            {isSubmitted ? 'Reset Request Sent' : 'Reset Password'}
          </Text>

          <Text style={styles.subtitle}>
            {isSubmitted
              ? `If ${email} is registered with Jaya Engineering College CCR, password reset instructions have been forwarded to your institutional mailbox.`
              : 'Enter your registered faculty or administrator email address to request password credentials recovery.'}
          </Text>

          {!isSubmitted ? (
            <View style={styles.formSection}>
              <AppTextInput
                label="Institutional Email"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (error) setError('');
                }}
                error={error}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="e.g. drkaruppaiya@ccr.edu"
              />

              <AppButton
                title={isLoading ? 'Sending Request...' : 'Send Recovery Link'}
                onPress={handleResetRequest}
                loading={isLoading}
                style={styles.actionBtn}
              />
            </View>
          ) : (
            <View style={styles.successSection}>
              <View style={styles.noticeBox}>
                <Feather name="info" size={16} color="#0F52BA" />
                <Text style={styles.noticeText}>
                  For immediate assistance or locked accounts, please contact the Central IT Administration at{' '}
                  <Text style={{ fontWeight: '700' }}>it-support@jec.ac.in</Text>.
                </Text>
              </View>

              <AppButton
                title="Return to Sign In"
                onPress={() => navigation.navigate('Login')}
                style={styles.actionBtn}
              />
            </View>
          )}

          <View style={styles.helpBox}>
            <MaterialCommunityIcons name="shield-check" size={16} color={Palette.textLight} />
            <Text style={styles.helpText}>Jaya Engineering College • CCR System Security</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: ms(24),
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ms(20),
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: ms(14),
    fontWeight: '700',
    color: Palette.primary,
    marginLeft: ms(8),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(24),
    padding: ms(24),
    alignItems: 'center',
    shadowColor: '#0F52BA',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: ms(72),
    height: ms(72),
    borderRadius: ms(36),
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ms(16),
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  title: {
    fontSize: ms(22),
    fontWeight: '900',
    color: Palette.textDark,
    textAlign: 'center',
    marginBottom: ms(8),
  },
  subtitle: {
    fontSize: ms(13.5),
    color: Palette.textLight,
    textAlign: 'center',
    lineHeight: ms(20),
    marginBottom: ms(20),
    paddingHorizontal: ms(8),
  },
  formSection: {
    width: '100%',
  },
  successSection: {
    width: '100%',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: ms(12),
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: ms(20),
  },
  noticeText: {
    fontSize: ms(12),
    color: '#1E3A8A',
    marginLeft: ms(8),
    flex: 1,
    lineHeight: ms(18),
  },
  actionBtn: {
    marginTop: ms(8),
    borderRadius: ms(12),
    paddingVertical: ms(4),
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ms(24),
  },
  helpText: {
    fontSize: ms(11),
    color: Palette.textLight,
    fontWeight: '600',
    marginLeft: ms(6),
  },
});

export default ForgotPasswordScreen;
