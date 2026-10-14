import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { EditorialColors, EditorialFonts, EditorialRules } from '@theme/editorial';

interface EditorialHeaderProps {
  title: string;
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

  return (
    <View style={styles.header}>
      {/* Left button: 44x44 square outlined */}
      {leftSlot ? (
        <View style={styles.squareBox}>{leftSlot}</View>
      ) : showBack ? (
        <TouchableOpacity
          style={styles.squareButton}
          onPress={handleBack}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={20} color={EditorialColors.ink} />
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

      {/* Center Title: UPPERCASE label */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText} numberOfLines={1}>
          {title.toUpperCase()}
        </Text>
      </View>

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
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 16,
  },
  squareButton: {
    width: 44,
    height: 44,
    borderWidth: EditorialRules.borderWidth,
    borderColor: EditorialColors.ink,
    borderRadius: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
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
});
