import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';
import {
  PublishReleaseInput,
  UpdateConfigInput,
  VersionQueryInput,
  ConfigQueryInput,
} from '../validators/appRelease.schema';

// Load committed defaults
const defaultReleasePath = path.join(__dirname, '../config/defaults/defaultRelease.json');
const defaultConfigPath = path.join(__dirname, '../config/defaults/defaultConfig.json');

const loadCommittedRelease = (): any => {
  try {
    return JSON.parse(fs.readFileSync(defaultReleasePath, 'utf8'));
  } catch (err) {
    return {
      latestVersionName: '1.0.0',
      latestVersionCode: 1,
      minSupportedVersionCode: 1,
      apkUrl: 'https://github.com/Hariprasath2611/CCR-App/releases/download/v1.0.0/app-release.apk',
      apkSha256: 'a34ff6fa45758d78de4e8f8bc27f60b6d681f07cb4fa6ea202ab1886ce8f0636',
      apkSizeBytes: 90535979,
      releaseNotes: ['Initial production release'],
      channel: 'stable',
      publishedAt: new Date().toISOString(),
    };
  }
};

const loadCommittedConfig = (): any => {
  try {
    return JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
  } catch (err) {
    return {
      configVersion: 1,
      minSupportedVersionCode: 1,
      maintenance: {
        enabled: false,
        title: 'Maintenance',
        message: 'System is temporarily under maintenance.',
        allowedRoles: ['ADMIN', 'PRINCIPAL'],
      },
      featureFlags: { offlineSyncV2: true, advancedAnalytics: true, pdfExport: true },
      banners: [],
      texts: { supportContact: 'support@jec.ac.in' },
      theme: { blue: '#2B35E0', amber: '#FFB020', coral: '#FF5D73', mint: '#3DDBB0', ink: '#0E1030' },
    };
  }
};

// In-memory cache + rollback history
let currentReleaseCache: any = loadCommittedRelease();
let previousReleaseCache: any = null;

let currentConfigCache: any = loadCommittedConfig();
let previousConfigCache: any = null;

export class AppReleaseService {
  /**
   * Get app version details and compute whether a force update is required
   */
  static async getVersion(query: VersionQueryInput) {
    const channel = query.channel || 'stable';
    let release = currentReleaseCache;

    try {
      if ((prisma as any).appRelease) {
        const dbRelease = await (prisma as any).appRelease.findFirst({
          where: { channel },
          orderBy: { createdAt: 'desc' },
        });
        if (dbRelease) {
          release = dbRelease;
          currentReleaseCache = dbRelease;
        }
      }
    } catch (err) {
      // Graceful fallback to cached/committed release
      console.warn('[AppReleaseService] DB lookup fallback:', (err as any)?.message);
    }

    const callerVersionCode = query.versionCode || 1;
    const forceUpdate = callerVersionCode < release.minSupportedVersionCode;

    return {
      latestVersionName: release.latestVersionName,
      latestVersionCode: release.latestVersionCode,
      minSupportedVersionCode: release.minSupportedVersionCode,
      forceUpdate,
      apkUrl: release.apkUrl,
      apkSha256: release.apkSha256,
      apkSizeBytes: release.apkSizeBytes || null,
      releaseNotes: release.releaseNotes || [],
      publishedAt: release.publishedAt || new Date().toISOString(),
      channel: release.channel || 'stable',
    };
  }

  /**
   * Get remote configuration (banners, feature flags, maintenance, texts, theme)
   */
  static async getConfig(query: ConfigQueryInput) {
    let config = currentConfigCache;

    try {
      if ((prisma as any).appConfig) {
        const dbConfig = await (prisma as any).appConfig.findFirst({
          orderBy: { createdAt: 'desc' },
        });
        if (dbConfig && dbConfig.configJson) {
          const parsed = JSON.parse(dbConfig.configJson);
          config = { ...parsed, configVersion: dbConfig.configVersion };
          currentConfigCache = config;
        }
      }
    } catch (err) {
      console.warn('[AppReleaseService] Config DB lookup fallback:', (err as any)?.message);
    }

    return {
      ...config,
      serverTime: new Date().toISOString(),
    };
  }

  /**
   * Publish a new APK release
   */
  static async publishRelease(input: PublishReleaseInput) {
    previousReleaseCache = { ...currentReleaseCache };

    const newRelease = {
      latestVersionName: input.latestVersionName,
      latestVersionCode: input.latestVersionCode,
      minSupportedVersionCode: input.minSupportedVersionCode,
      apkUrl: input.apkUrl,
      apkSha256: input.apkSha256,
      apkSizeBytes: input.apkSizeBytes || null,
      releaseNotes: input.releaseNotes,
      channel: input.channel || 'stable',
      publishedAt: new Date().toISOString(),
    };

    currentReleaseCache = newRelease;

    try {
      if ((prisma as any).appRelease) {
        await (prisma as any).appRelease.create({
          data: {
            latestVersionName: newRelease.latestVersionName,
            latestVersionCode: newRelease.latestVersionCode,
            minSupportedVersionCode: newRelease.minSupportedVersionCode,
            apkUrl: newRelease.apkUrl,
            apkSha256: newRelease.apkSha256,
            apkSizeBytes: newRelease.apkSizeBytes,
            releaseNotes: newRelease.releaseNotes,
            channel: newRelease.channel,
            publishedAt: new Date(newRelease.publishedAt),
          },
        });
      }
    } catch (err) {
      console.warn('[AppReleaseService] Failed to persist release to DB:', (err as any)?.message);
    }

    return newRelease;
  }

  /**
   * Update remote configuration
   */
  static async updateConfig(input: UpdateConfigInput) {
    previousConfigCache = { ...currentConfigCache };

    const newVersion = (currentConfigCache?.configVersion || 1) + 1;
    const newConfig = {
      ...input,
      configVersion: newVersion,
    };

    currentConfigCache = newConfig;

    try {
      if ((prisma as any).appConfig) {
        await (prisma as any).appConfig.create({
          data: {
            configVersion: newVersion,
            configJson: JSON.stringify(newConfig),
          },
        });
      }
    } catch (err) {
      console.warn('[AppReleaseService] Failed to persist config to DB:', (err as any)?.message);
    }

    return {
      ...newConfig,
      serverTime: new Date().toISOString(),
    };
  }

  /**
   * Rollback release or config to the previous state
   */
  static async rollback(target: 'release' | 'config' | 'all') {
    const rolledBack: { release?: any; config?: any } = {};

    if (target === 'release' || target === 'all') {
      if (!previousReleaseCache) {
        throw new Error('No previous release state available for rollback');
      }
      currentReleaseCache = { ...previousReleaseCache };
      previousReleaseCache = null;
      rolledBack.release = currentReleaseCache;
    }

    if (target === 'config' || target === 'all') {
      if (!previousConfigCache) {
        throw new Error('No previous config state available for rollback');
      }
      currentConfigCache = { ...previousConfigCache };
      previousConfigCache = null;
      rolledBack.config = currentConfigCache;
    }

    return rolledBack;
  }

  /**
   * Self-hosted OTA bundle info
   */
  static getBundleLatest(runtimeVersion?: string, platform: string = 'android') {
    return {
      bundleVersion: currentReleaseCache.latestVersionName,
      url: currentReleaseCache.apkUrl,
      sha256: currentReleaseCache.apkSha256,
      size: currentReleaseCache.apkSizeBytes,
      mandatory: false,
    };
  }

  /**
   * Helper for tests to reset state
   */
  static _resetForTesting() {
    currentReleaseCache = loadCommittedRelease();
    previousReleaseCache = null;
    currentConfigCache = loadCommittedConfig();
    previousConfigCache = null;
  }
}
