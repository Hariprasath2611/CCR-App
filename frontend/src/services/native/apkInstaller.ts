import { NativeModules, Platform, Linking } from 'react-native';

const ApkInstaller = NativeModules ? NativeModules.ApkInstaller : undefined;

export interface AppVersionInfo {
  versionCode: number;
  versionName: string;
}

export const nativeApkInstaller = {
  /**
   * Check if unknown app sources installation is permitted
   */
  async canRequestPackageInstalls(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    if (ApkInstaller?.canRequestPackageInstalls) {
      try {
        return await ApkInstaller.canRequestPackageInstalls();
      } catch (err) {
        console.warn('[ApkInstaller] canRequestPackageInstalls error:', err);
      }
    }
    return true; // Fallback
  },

  /**
   * Open the system settings page for managing unknown app sources
   */
  async openInstallPermissionSettings(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    if (ApkInstaller?.openInstallPermissionSettings) {
      try {
        return await ApkInstaller.openInstallPermissionSettings();
      } catch (err) {
        console.warn('[ApkInstaller] openInstallPermissionSettings error:', err);
      }
    }
    // Fallback: open application settings
    try {
      await Linking.openSettings();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Launch Android package installer for downloaded APK file
   */
  async installApk(fileUri: string): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    // Use native module with FileProvider + Intent.ACTION_VIEW
    if (ApkInstaller?.installApk) {
      return await ApkInstaller.installApk(fileUri);
    }

    // Fallback using Linking if NativeModule is not yet linked in running bundle
    try {
      const canOpen = await Linking.canOpenURL(fileUri);
      if (canOpen) {
        await Linking.openURL(fileUri);
        return true;
      }
    } catch (err) {
      console.warn('[ApkInstaller] Linking fallback failed:', err);
    }

    throw new Error('Native APK installer module is not available.');
  },

  /**
   * Compute SHA-256 hash of APK file
   */
  async getApkSha256(fileUri: string): Promise<string> {
    if (ApkInstaller?.getApkSha256) {
      return await ApkInstaller.getApkSha256(fileUri);
    }

    // Fallback: read file and compute SHA-256
    throw new Error('SHA-256 computation requires native Android module.');
  },

  /**
   * Get installed versionCode and versionName from Android PackageInfo
   */
  async getAppVersion(): Promise<AppVersionInfo> {
    if (Platform.OS === 'android' && ApkInstaller?.getAppVersion) {
      try {
        return await ApkInstaller.getAppVersion();
      } catch (err) {
        console.warn('[ApkInstaller] getAppVersion native error:', err);
      }
    }

    // Default fallback to 1 / 1.0.0
    return {
      versionCode: 1,
      versionName: '1.0.0',
    };
  },
};
