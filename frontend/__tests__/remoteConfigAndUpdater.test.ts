jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo', () => ({
  NativeModules: {
    ApkInstaller: {
      canRequestPackageInstalls: jest.fn(() => Promise.resolve(true)),
      getAppVersion: jest.fn(() => Promise.resolve({ versionCode: 1, versionName: '1.0.0' })),
      getApkSha256: jest.fn(() => Promise.resolve('a'.repeat(64))),
      installApk: jest.fn(() => Promise.resolve(true)),
    },
  },
  Platform: { OS: 'android', select: (obj: any) => obj.android || obj.default },
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    openSettings: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file:///cache/',
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: false })),
  deleteAsync: jest.fn(() => Promise.resolve()),
  createDownloadResumable: jest.fn(),
}));

import { isValidHexColor, remoteConfigService } from '../src/services/remoteConfig/remoteConfigService';
import { isAllowedApkHost } from '../src/services/updater/appUpdateService';

describe('Remote Config & App Update Engine', () => {
  describe('Hex Color Validator', () => {
    test('Validates Day Ribbon 6-char hex colors', () => {
      expect(isValidHexColor('#2B35E0')).toBe(true); // Blue
      expect(isValidHexColor('#FFB020')).toBe(true); // Amber
      expect(isValidHexColor('#FF5D73')).toBe(true); // Coral
      expect(isValidHexColor('#3DDBB0')).toBe(true); // Mint
      expect(isValidHexColor('#0E1030')).toBe(true); // Ink
    });

    test('Validates 8-char hex colors with alpha', () => {
      expect(isValidHexColor('#2B35E0FF')).toBe(true);
    });

    test('Rejects invalid colors', () => {
      expect(isValidHexColor('blue')).toBe(false);
      expect(isValidHexColor('#123')).toBe(false);
      expect(isValidHexColor('#ZZZZZZ')).toBe(false);
      expect(isValidHexColor('')).toBe(false);
      expect(isValidHexColor(undefined)).toBe(false);
    });
  });

  describe('APK Download URL Allow-List Security', () => {
    test('Allows official GitHub Releases HTTPS URLs', () => {
      expect(
        isAllowedApkHost(
          'https://github.com/Hariprasath2611/CCR-App/releases/download/v1.0.0/app-release.apk'
        )
      ).toBe(true);
      expect(
        isAllowedApkHost(
          'https://objects.githubusercontent.com/github-production-release-asset-2e65be/app.apk'
        )
      ).toBe(true);
    });

    test('Allows Render backend HTTPS URLs', () => {
      expect(
        isAllowedApkHost('https://ccms-backend-0zmp.onrender.com/v1/downloads/app-release.apk')
      ).toBe(true);
    });

    test('Rejects unallowed domains and insecure HTTP', () => {
      expect(isAllowedApkHost('http://github.com/app.apk')).toBe(false); // Insecure HTTP
      expect(isAllowedApkHost('https://untrusted-hacker-site.com/malicious.apk')).toBe(false);
      expect(isAllowedApkHost('ftp://github.com/app.apk')).toBe(false);
      expect(isAllowedApkHost('not-a-url')).toBe(false);
    });
  });

  describe('Remote Config Service Business Logic', () => {
    beforeEach(() => {
      remoteConfigService._resetForTesting();
    });

    test('Feature flags resolve correctly with defaults', () => {
      expect(remoteConfigService.flag('offlineSyncV2')).toBe(true);
      expect(remoteConfigService.flag('nonExistentFeature', false)).toBe(false);
      expect(remoteConfigService.flag('nonExistentFeature', true)).toBe(true);
    });

    test('Text overrides return default when key not found', () => {
      expect(remoteConfigService.getText('supportContact')).toBe('support@jec.ac.in');
      expect(remoteConfigService.getText('unknownKey', 'Default Fallback')).toBe('Default Fallback');
    });

    test('Theme override falls back to Day Ribbon defaults', () => {
      expect(remoteConfigService.getThemeToken('blue')).toBe('#2B35E0');
      expect(remoteConfigService.getThemeToken('amber')).toBe('#FFB020');
    });

    test('Maintenance mode bypasses allowed roles', () => {
      // Not in maintenance initially
      expect(remoteConfigService.isMaintenanceActive('STAFF')).toBe(false);

      // Set maintenance enabled
      (remoteConfigService as any).currentConfig.maintenance = {
        enabled: true,
        title: 'Maintenance',
        message: 'Under maintenance',
        allowedRoles: ['ADMIN', 'PRINCIPAL'],
      };

      // STAFF is blocked
      expect(remoteConfigService.isMaintenanceActive('STAFF')).toBe(true);
      expect(remoteConfigService.isMaintenanceActive(undefined)).toBe(true);

      // ADMIN and PRINCIPAL bypass
      expect(remoteConfigService.isMaintenanceActive('ADMIN')).toBe(false);
      expect(remoteConfigService.isMaintenanceActive('PRINCIPAL')).toBe(false);
    });
  });
});
