import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';
import { useAppUpdate } from '@services/updater/useAppUpdate';
import { NotchedRibbonButton } from './NotchedRibbonButton';

export const ForcedUpdateScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    status,
    updateInfo,
    currentVersionName,
    currentVersionCode,
    progressPercent,
    bytesDownloaded,
    totalBytes,
    errorMessage,
    startDownload,
    cancelDownload,
    installDownloadedApk,
    requestInstallPermission,
  } = useAppUpdate();

  const isForced =
    status === 'forced_update' ||
    (updateInfo?.forceUpdate &&
      (status === 'downloading' ||
        status === 'verifying' ||
        status === 'permission_required' ||
        status === 'ready_to_install' ||
        status === 'error'));

  if (!isForced || !updateInfo) {
    return null;
  }

  const formatMb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

  return (
    <View
      style={[
        styles.overlayContainer,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 24),
          paddingLeft: Math.max(insets.left, 20),
          paddingRight: Math.max(insets.right, 20),
        },
      ]}
      accessibilityRole="alert"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Day Ribbon Decorative Tilted Strip */}
        <View style={styles.ribbonStrip} />

        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>MANDATORY UPDATE</Text>
          </View>
        </View>

        <Text style={styles.title}>Update Required</Text>

        <Text style={styles.description}>
          A critical system update (v{updateInfo.latestVersionName}) is required to continue
          using the Course Coverage Report app. Your currently installed version (v
          {currentVersionName}, build {currentVersionCode}) is no longer supported for syllabus
          logging and cloud synchronization.
        </Text>

        {/* Release Highlights */}
        {updateInfo.releaseNotes && updateInfo.releaseNotes.length > 0 && (
          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>Update Highlights:</Text>
            {updateInfo.releaseNotes.map((note, idx) => (
              <View key={idx} style={styles.noteRow}>
                <Text style={styles.bullet}>▸</Text>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action / Progress Box (Fixed minimum height to prevent layout jumps) */}
        <View style={styles.actionSection}>
          {status === 'downloading' ? (
            <View style={styles.progressBox}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressStatus}>Downloading Package...</Text>
                <Text style={styles.progressPercent}>{progressPercent}%</Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>

              <View style={styles.progressMeta}>
                <Text style={styles.metaBytes}>
                  {formatMb(bytesDownloaded)} MB /{' '}
                  {totalBytes ? `${formatMb(totalBytes)} MB` : '...'}
                </Text>
                <TouchableOpacity
                  onPress={cancelDownload}
                  style={styles.cancelTap}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel update download"
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : status === 'verifying' ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Verifying cryptographic SHA-256 package signature...
              </Text>
            </View>
          ) : status === 'permission_required' ? (
            <View style={styles.permissionBox}>
              <Text style={styles.permTitle}>Unknown Apps Permission Required</Text>
              <Text style={styles.permText}>
                Android requires explicit permission to install update APKs. Please tap below to
                enable "Allow from this source" in Settings.
              </Text>
              <NotchedRibbonButton
                title="Open Android Settings"
                onPress={requestInstallPermission}
                variant="amber"
              />
            </View>
          ) : status === 'ready_to_install' ? (
            <View style={styles.readyBox}>
              <Text style={styles.readyNotice}>
                Package verified. Tap "Install Now", then tap "Install" on the Android system
                prompt.
              </Text>
              <NotchedRibbonButton
                title="Install Now"
                onPress={installDownloadedApk}
                variant="primary"
              />
            </View>
          ) : (
            <NotchedRibbonButton
              title="Download & Install Update"
              onPress={startDownload}
              variant="coral"
            />
          )}

          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity
                onPress={startDownload}
                style={styles.retryButton}
                accessibilityRole="button"
                accessibilityLabel="Retry download"
              >
                <Text style={styles.retryText}>Retry Download</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.securityNote}>
            🛡️ Safe, direct update signed by institutional developers.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DayRibbonColors.white,
    zIndex: 9999,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  ribbonStrip: {
    height: 6,
    width: 64,
    backgroundColor: DayRibbonColors.coral,
    borderRadius: 3,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#FFF0F2',
    borderColor: DayRibbonColors.coral,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: DayRibbonShapes.chipRadius,
  },
  badgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.coral,
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: DayRibbonColors.ink,
    marginBottom: 12,
  },
  description: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 14,
    lineHeight: 22,
    color: DayRibbonColors.bodyText,
    marginBottom: 20,
  },
  notesCard: {
    backgroundColor: DayRibbonColors.fieldBg,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.border,
    padding: 16,
    marginBottom: 24,
  },
  notesTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    color: DayRibbonColors.ink,
    marginBottom: 8,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    color: DayRibbonColors.coral,
    fontFamily: DayRibbonFonts.body700,
    marginRight: 6,
  },
  noteText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    lineHeight: 18,
    color: DayRibbonColors.bodyText,
    flex: 1,
  },
  actionSection: {
    minHeight: 120,
    justifyContent: 'center',
  },
  progressBox: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressStatus: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 14,
    color: DayRibbonColors.ink,
  },
  progressPercent: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.coral,
  },
  progressTrack: {
    height: 10,
    backgroundColor: DayRibbonColors.ghost,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DayRibbonColors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: DayRibbonColors.coral,
    borderRadius: 5,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  metaBytes: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  cancelTap: {
    minHeight: 36,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  infoBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  infoText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 14,
    color: DayRibbonColors.muted,
  },
  permissionBox: {
    alignItems: 'center',
  },
  permTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 15,
    color: DayRibbonColors.ink,
    marginBottom: 6,
  },
  permText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.bodyText,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  readyBox: {
    alignItems: 'center',
  },
  readyNotice: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 13,
    color: DayRibbonColors.ink,
    textAlign: 'center',
    marginBottom: 12,
  },
  errorContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.coral,
    textAlign: 'center',
    marginBottom: 6,
  },
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    color: DayRibbonColors.blue,
    textDecorationLine: 'underline',
  },
  securityNote: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 11,
    color: DayRibbonColors.muted,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ForcedUpdateScreen;
