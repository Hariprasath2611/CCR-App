import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { Rule } from './Rule';

interface EditorialHeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  showBell?: boolean;
  unreadCount?: number;
  onBellPress?: () => void;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export const EditorialHeader: React.FC<EditorialHeaderProps> = ({
  title,
  eyebrow,
  subtitle,
  showBack = false,
  onBackPress,
  showBell = false,
  unreadCount = 0,
  onBellPress,
  leftSlot,
  rightSlot,
}) => {
  const navigation = useNavigation<any>();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleBell = () => {
    if (onBellPress) {
      onBellPress();
    } else {
      navigation.navigate('Notifications');
    }
  };

  const hasExpandedHeader = Boolean(eyebrow || subtitle);

  return (
    <View style={styles.container}>
      {/* Top Nav Row */}
      <View style={styles.header}>
        {/* Left button: 44x44 square outlined or back link */}
        {leftSlot ? (
          <View style={styles.squareBox}>{leftSlot}</View>
        ) : showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={16} color={EditorialColors.ink} style={{ marginRight: 6 }} />
            <Text style={styles.backButtonText}>BACK</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.squareLogoBox}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Center / Right controls */}
        {!hasExpandedHeader ? (
          <View style={styles.titleContainer}>
            <Text style={styles.titleText} numberOfLines={1}>
              {title.toUpperCase()}
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {/* Right button: 44x44 square outlined bell button */}
        {rightSlot ? (
          <View style={styles.squareBox}>{rightSlot}</View>
        ) : showBell ? (
          <TouchableOpacity
            style={styles.squareButton}
            onPress={handleBell}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
          >
            <Feather name="bell" size={18} color={EditorialColors.ink} />
            {unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderBox} />
        )}
      </View>

      {/* Expanded Editorial Header (if eyebrow or subtitle provided) */}
      {hasExpandedHeader && (
        <View style={styles.expandedHeaderBlock}>
          {eyebrow && <Text style={styles.eyebrowText}>{eyebrow.toUpperCase()}</Text>}
          <Text style={styles.displayTitleText}>
            {title.toUpperCase()}
            <Text style={styles.accentPeriod}>.</Text>
          </Text>
          {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
          <Rule thickness={4} color={EditorialColors.ink} style={styles.headerRule} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: EditorialSpacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    minHeight: 48,
  },
  squareButton: {
    width: 44,
    height: 44,
    borderWidth: EditorialRules.borderWidth,
    borderColor: EditorialColors.ink,
    borderRadius: 0,
    backgroundColor: EditorialColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingHorizontal: 10,
    backgroundColor: EditorialColors.white,
  },
  backButtonText: {
    fontFamily: EditorialFonts.bold,
    fontSize: 11,
    color: EditorialColors.ink,
    letterSpacing: 1,
  },
  squareBox: {
    width: 44,
    height: 44,
    borderWidth: EditorialRules.borderWidth,
    borderColor: EditorialColors.ink,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareLogoBox: {
    width: 44,
    height: 44,
    borderWidth: EditorialRules.borderWidth,
    borderColor: EditorialColors.ink,
    borderRadius: 0,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EditorialColors.white,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  placeholderBox: {
    width: 44,
    height: 44,
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  titleText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 2,
    color: EditorialColors.ink,
    textAlign: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: EditorialColors.accent,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 9,
    color: EditorialColors.white,
    letterSpacing: 0,
  },
  expandedHeaderBlock: {
    marginTop: EditorialSpacing.md,
  },
  eyebrowText: {
    fontFamily: EditorialFonts.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
    marginBottom: 6,
  },
  displayTitleText: {
    fontFamily: EditorialFonts.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
    color: EditorialColors.ink,
    marginBottom: 6,
  },
  accentPeriod: {
    color: EditorialColors.accent,
  },
  subtitleText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: EditorialColors.muted,
    marginBottom: EditorialSpacing.sm,
  },
  headerRule: {
    marginTop: EditorialSpacing.sm,
  },
});

export default EditorialHeader;
