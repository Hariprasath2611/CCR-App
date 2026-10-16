import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';

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
        {/* Left button: 44x44 radius 12 logo slot or circular back button */}
        {leftSlot ? (
          <View style={styles.leftBox}>{leftSlot}</View>
        ) : showBack ? (
          <TouchableOpacity
            style={styles.circleButton}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={20} color={DayRibbonColors.ink} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoSlot}>
            <Image
              source={require('../../assets/logo-removebg-preview.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Center / Flexible space */}
        {!hasExpandedHeader ? (
          <View style={styles.titleContainer}>
            <Text style={styles.titleText} numberOfLines={1}>
              {title}
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {/* Right button: 44x44 circular bell button with 1.5px line-colour border */}
        {rightSlot ? (
          <View style={styles.leftBox}>{rightSlot}</View>
        ) : showBell ? (
          <TouchableOpacity
            style={styles.circleButton}
            onPress={handleBell}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
          >
            <Feather name="bell" size={18} color={DayRibbonColors.ink} />
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

      {/* Expanded Header (if eyebrow or subtitle provided) */}
      {hasExpandedHeader && (
        <View style={styles.expandedHeaderBlock}>
          {eyebrow && <Text style={styles.eyebrowText}>{eyebrow.toUpperCase()}</Text>}
          <Text style={styles.displayTitleText}>
            {title}
          </Text>
          {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    minHeight: 48,
  },
  logoSlot: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    ...DayRibbonShapes.shadow,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  circleButton: {
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
  leftBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    color: DayRibbonColors.ink,
    textAlign: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: DayRibbonColors.warn,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 9,
    color: DayRibbonColors.white,
  },
  expandedHeaderBlock: {
    marginTop: 12,
  },
  eyebrowText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    marginBottom: 4,
  },
  displayTitleText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: DayRibbonColors.ink,
    marginBottom: 4,
  },
  subtitleText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    lineHeight: 18,
    color: DayRibbonColors.muted,
  },
});

export default EditorialHeader;
