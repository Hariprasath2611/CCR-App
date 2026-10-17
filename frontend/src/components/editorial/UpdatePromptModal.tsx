import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';
import { useAppUpdate } from '@services/updater/useAppUpdate';
import { NotchedRibbonButton } from './NotchedRibbonButton';

export const UpdatePromptModal: React.FC = () => {
  const {
    status,
    updateInfo,
    progressPercent,
    bytesDownloaded,
    totalBytes,
    errorMessage,
    startDownload,
    cancelDownload,
    installDownloadedApk,
    requestInstallPermission,
    snoozeUpdate,
    dismissPrompt,
  } = useAppUpdate();

  // Show only if update is available, downloading, verifying, or ready to install (and NOT forced)
  const isVisible =
    (status === 'update_available' ||
      status === 'downloading' ||
      status === 'verifying' ||
      status === 'ready_to_install' ||
      status === 'permission_required') &&
    !updateInfo?.forceUpdate;

  if (!isVisible || !updateInfo) {
    return null;
  }

  const formatMb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

  return (
    <Modal
      transparent
      animationType="slide"
      visible={isVisible}
      onRequestClose={dismissPrompt}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer} accessibilityRole="alert">
          {/* Top Decorative Ribbon Strip */}
          <View style={styles.topRibbonStrip} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Update Available</Text>
              <Text style={styles.versionBadge}>
                v{updateInfo.latestVersionName} (Build {updateInfo.latestVersionCode})
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={dismissPrompt}
              accessibilityRole="button"
              accessibilityLabel="Dismiss update prompt"
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Release Notes */}
          <ScrollView style={styles.notesScroll} contentContainerStyle={styles.notesContent}>
            <Text style={styles.notesHeading}>What's New in this Version:</Text>
            {updateInfo.releaseNotes?.map((note, idx) => (
              <View key={idx} style={styles.noteItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Fixed Height Progress / Actions Section (prevents layout jumps) */}
          <View style={styles.fixedActionBox}>
            {status === 'downloading' ? (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Downloading APK...</Text>
                  <Text style={styles.progressPercent}>{progressPercent}%</Text>
                </View>

                {/* Progress Bar Track & Fill */}
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>

                <View style={styles.progressFooter}>
                  <Text style={styles.bytesText}>
                    {formatMb(bytesDownloaded)} MB of{' '}
                    {totalBytes ? `${formatMb(totalBytes)} MB` : '...'}
                  </Text>
                  <TouchableOpacity
                    onPress={cancelDownload}
                    style={styles.cancelButton}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel download"
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : status === 'verifying' ? (
              <View style={styles.statusBox}>
                <Text style={styles.statusText}>Verifying SHA-256 integrity hash...</Text>
              </View>
            ) : status === 'permission_required' ? (
              <View style={styles.permissionBox}>
                <Text style={styles.permissionTitle}>Permission Required</Text>
                <Text style={styles.permissionText}>
                  Please allow "Install unknown apps" for CCR in Settings to complete the update.
                </Text>
                <NotchedRibbonButton
                  title="Open Settings"
                  onPress={requestInstallPermission}
                  variant="amber"
                />
              </View>
            ) : status === 'ready_to_install' ? (
              <View style={styles.readyBox}>
                <Text style={styles.readyNotice}>
                  APK verified. Android requires you to tap "Install" on the system prompt.
                </Text>
                <NotchedRibbonButton
                  title="Launch Installer"
                  onPress={installDownloadedApk}
                  variant="primary"
                />
              </View>
            ) : (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.laterButton}
                  onPress={snoozeUpdate}
                  accessibilityRole="button"
                  accessibilityLabel="Update later (snooze 24 hours)"
                >
                  <Text style={styles.laterText}>Later</Text>
                </TouchableOpacity>

                <View style={styles.primaryButtonWrapper}>
                  <NotchedRibbonButton
                    title="Update Now"
                    onPress={startDownload}
                    variant="primary"
                  />
                </View>
              </View>
            )}

            {errorMessage ? (
              <Text style={styles.errorText} numberOfLines={2}>
                {errorMessage}
              </Text>
            ) : null}

            <Text style={styles.disclaimerText}>
              Note: Android requires user confirmation to finish package installation.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(14, 16, 48, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: DayRibbonColors.white,
    borderTopLeftRadius: DayRibbonShapes.cardRadius * 1.5,
    borderTopRightRadius: DayRibbonShapes.cardRadius * 1.5,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderTopWidth: 1,
    borderColor: DayRibbonColors.border,
    maxHeight: '80%',
    ...DayRibbonShapes.upwardShadow,
  },
  topRibbonStrip: {
    height: 4,
    width: 48,
    backgroundColor: DayRibbonColors.amber,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 22,
    color: DayRibbonColors.ink,
    letterSpacing: -0.3,
  },
  versionBadge: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    color: DayRibbonColors.blue,
    marginTop: 2,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 18,
    color: DayRibbonColors.muted,
  },
  notesScroll: {
    maxHeight: 140,
    marginVertical: 8,
  },
  notesContent: {
    paddingVertical: 4,
  },
  notesHeading: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    color: DayRibbonColors.muted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.amber,
    marginRight: 8,
  },
  noteText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    lineHeight: 18,
    color: DayRibbonColors.bodyText,
    flex: 1,
  },
  fixedActionBox: {
    minHeight: 110,
    justifyContent: 'center',
    marginTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  laterButton: {
    minHeight: 52,
    minWidth: 80,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DayRibbonShapes.buttonRadius,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.border,
  },
  laterText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.muted,
  },
  primaryButtonWrapper: {
    flex: 1,
  },
  progressContainer: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 13,
    color: DayRibbonColors.ink,
  },
  progressPercent: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    color: DayRibbonColors.blue,
  },
  progressTrack: {
    height: 8,
    backgroundColor: DayRibbonColors.ghost,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DayRibbonColors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: DayRibbonColors.blue,
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  bytesText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  cancelButton: {
    minHeight: 36,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.coral,
  },
  statusBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  statusText: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 13,
    color: DayRibbonColors.muted,
  },
  permissionBox: {
    alignItems: 'center',
  },
  permissionTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.ink,
    marginBottom: 4,
  },
  permissionText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.bodyText,
    textAlign: 'center',
    marginBottom: 10,
  },
  readyBox: {
    alignItems: 'center',
  },
  readyNotice: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.bodyText,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.coral,
    textAlign: 'center',
    marginTop: 6,
  },
  disclaimerText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 11,
    color: DayRibbonColors.muted,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default UpdatePromptModal;
