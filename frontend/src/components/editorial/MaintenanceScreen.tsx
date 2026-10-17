import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';
import { useRemoteConfig } from '@services/remoteConfig/useRemoteConfig';
import { NotchedRibbonButton } from './NotchedRibbonButton';

export const MaintenanceScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isMaintenance, maintenanceInfo, getText, refetch } = useRemoteConfig();
  const [checking, setChecking] = useState(false);

  if (!isMaintenance) {
    return null;
  }

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setChecking(false), 800);
    }
  };

  const supportContact = getText('supportContact', 'support@jec.ac.in');

  const handleContact = () => {
    Linking.openURL(`mailto:${supportContact}?subject=CCR%20Maintenance%20Inquiry`).catch(() => {});
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 24),
          paddingBottom: Math.max(insets.bottom, 24),
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
        },
      ]}
      accessibilityRole="alert"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ribbon Brand Strip */}
        <View style={styles.topRibbon} />

        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SYSTEM UPGRADE</Text>
          </View>
        </View>

        <Text style={styles.title}>
          {maintenanceInfo?.title || 'Scheduled Maintenance'}
        </Text>

        <Text style={styles.message}>
          {maintenanceInfo?.message ||
            'CCR is currently undergoing scheduled maintenance. Please check back shortly.'}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Need urgent assistance?</Text>
          <Text style={styles.cardText}>
            Class Coordinators and Subject Teachers with pressing deadlines can contact campus IT
            administration.
          </Text>
          <Text style={styles.contactEmail}>{supportContact}</Text>
        </View>

        <View style={styles.actionContainer}>
          <NotchedRibbonButton
            title="Check System Status"
            onPress={handleRefresh}
            loading={checking}
            variant="amber"
          />

          <View style={{ height: 12 }} />

          <NotchedRibbonButton
            title="Contact Support"
            onPress={handleContact}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DayRibbonColors.white,
    zIndex: 9998,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  topRibbon: {
    height: 6,
    width: 60,
    backgroundColor: DayRibbonColors.amber,
    borderRadius: 3,
    marginBottom: 24,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: DayRibbonColors.amber,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: DayRibbonShapes.chipRadius,
  },
  badgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.ink,
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: DayRibbonColors.ink,
    marginBottom: 14,
  },
  message: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 15,
    lineHeight: 23,
    color: DayRibbonColors.bodyText,
    marginBottom: 24,
  },
  card: {
    backgroundColor: DayRibbonColors.fieldBg,
    borderWidth: 1,
    borderColor: DayRibbonColors.border,
    borderRadius: DayRibbonShapes.cardRadius,
    padding: 18,
    marginBottom: 28,
  },
  cardTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.ink,
    marginBottom: 6,
  },
  cardText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    lineHeight: 18,
    color: DayRibbonColors.bodyText,
    marginBottom: 10,
  },
  contactEmail: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.blue,
  },
  actionContainer: {
    width: '100%',
  },
});

export default MaintenanceScreen;
