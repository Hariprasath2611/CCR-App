import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ENV } from '@config/env';
import { DayRibbonColors } from '@theme/dayRibbon';

export interface RemoteBanner {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  startsAt: string;
  endsAt: string;
  dismissible: boolean;
}

export interface RemoteMaintenance {
  enabled: boolean;
  title: string;
  message: string;
  allowedRoles: string[];
}

export interface RemoteThemeOverrides {
  blue?: string;
  amber?: string;
  coral?: string;
  mint?: string;
  ink?: string;
}

export interface RemoteConfigData {
  configVersion: number;
  minSupportedVersionCode: number;
  maintenance: RemoteMaintenance;
  featureFlags: Record<string, boolean>;
  banners: RemoteBanner[];
  texts: Record<string, string>;
  theme?: RemoteThemeOverrides;
  serverTime?: string;
}

export const DEFAULT_REMOTE_CONFIG: RemoteConfigData = {
  configVersion: 1,
  minSupportedVersionCode: 1,
  maintenance: {
    enabled: false,
    title: 'Scheduled Maintenance',
    message: 'CCR is currently undergoing scheduled maintenance. Please check back shortly.',
    allowedRoles: ['ADMIN', 'PRINCIPAL'],
  },
  featureFlags: {
    offlineSyncV2: true,
    advancedAnalytics: true,
    pdfExport: true,
    showTimetableWidget: true,
  },
  banners: [],
  texts: {
    supportContact: 'support@jec.ac.in',
    loginHelp: 'Use your institutional @jec.com account to sign in.',
    offlineNotice: 'Working in offline mode. Changes will sync automatically.',
  },
  theme: {
    blue: DayRibbonColors.blue,
    amber: DayRibbonColors.amber,
    coral: DayRibbonColors.coral,
    mint: DayRibbonColors.mint,
    ink: DayRibbonColors.ink,
  },
};

const CACHE_KEY = 'ccr_remote_config_cache';
const DISMISSED_BANNERS_KEY = 'ccr_dismissed_banners';
const THROTTLE_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;

export const isValidHexColor = (color?: string): boolean => {
  if (!color || typeof color !== 'string') return false;
  return HEX_COLOR_REGEX.test(color);
};

class RemoteConfigService {
  private currentConfig: RemoteConfigData = DEFAULT_REMOTE_CONFIG;
  private dismissedBannerIds: Set<string> = new Set();
  private lastFetchTime = 0;
  private isFetching = false;
  private listeners: Array<(config: RemoteConfigData) => void> = [];

  constructor() {
    this.loadFromCache();
  }

  /**
   * Subscribe to config updates
   */
  subscribe(listener: (config: RemoteConfigData) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentConfig);
      } catch (err) {
        console.warn('[RemoteConfig] Listener notification error:', err);
      }
    });
  }

  /**
   * Load cached config and dismissed banners from AsyncStorage
   */
  async loadFromCache(): Promise<RemoteConfigData> {
    try {
      const [cachedConfigJson, dismissedJson] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEY),
        AsyncStorage.getItem(DISMISSED_BANNERS_KEY),
      ]);

      if (cachedConfigJson) {
        const parsed = JSON.parse(cachedConfigJson);
        this.currentConfig = { ...DEFAULT_REMOTE_CONFIG, ...parsed };
      }

      if (dismissedJson) {
        const ids: string[] = JSON.parse(dismissedJson);
        this.dismissedBannerIds = new Set(ids);
      }
    } catch (err) {
      console.warn('[RemoteConfig] Cache load error:', err);
    }
    return this.currentConfig;
  }

  /**
   * Fetch latest configuration from server with timeout and exponential backoff
   */
  async fetchConfig(force = false): Promise<RemoteConfigData> {
    const now = Date.now();
    if (!force && now - this.lastFetchTime < THROTTLE_INTERVAL_MS) {
      return this.currentConfig;
    }

    if (this.isFetching) {
      return this.currentConfig;
    }

    this.isFetching = true;

    try {
      const endpoint = `${ENV.API_URL}/app/config`;
      const configData = await this.fetchWithRetry(endpoint, 2, 1000);

      this.currentConfig = {
        ...DEFAULT_REMOTE_CONFIG,
        ...configData,
      };
      this.lastFetchTime = Date.now();

      // Persist to cache
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(this.currentConfig));
      this.notify();
    } catch (err) {
      console.warn('[RemoteConfig] Network fetch failed, using cached config:', (err as any)?.message);
    } finally {
      this.isFetching = false;
    }

    return this.currentConfig;
  }

  /**
   * Axios fetch with 6s timeout and exponential backoff retries
   */
  private async fetchWithRetry(url: string, retries: number, delayMs: number): Promise<any> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(url, {
          timeout: 6000,
          headers: { Accept: 'application/json' },
        });
        return response.data;
      } catch (err) {
        if (attempt === retries) {
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
      }
    }
  }

  /**
   * Feature flag helper: flag("name", defaultVal)
   */
  flag(name: string, defaultValue = false): boolean {
    if (this.currentConfig.featureFlags && name in this.currentConfig.featureFlags) {
      return !!this.currentConfig.featureFlags[name];
    }
    return defaultValue;
  }

  /**
   * Text override helper: getText("key", defaultVal)
   */
  getText(key: string, defaultValue = ''): string {
    if (this.currentConfig.texts && key in this.currentConfig.texts) {
      return this.currentConfig.texts[key];
    }
    return defaultValue;
  }

  /**
   * Theme override with hex validation falling back to Day Ribbon tokens
   */
  getThemeToken(token: keyof RemoteThemeOverrides): string {
    const override = this.currentConfig.theme?.[token];
    if (override && isValidHexColor(override)) {
      return override;
    }
    // Fall back to built-in Day Ribbon token
    return (DayRibbonColors as any)[token] || '#2B35E0';
  }

  /**
   * Check if maintenance mode is active for the current user's role
   */
  isMaintenanceActive(userRole?: string): boolean {
    const maintenance = this.currentConfig.maintenance;
    if (!maintenance || !maintenance.enabled) {
      return false;
    }

    // Role bypass
    if (userRole && Array.isArray(maintenance.allowedRoles)) {
      if (maintenance.allowedRoles.includes(userRole.toUpperCase())) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get active banners (within startsAt and endsAt, not dismissed)
   */
  getActiveBanners(): RemoteBanner[] {
    const banners = this.currentConfig.banners || [];
    const now = new Date().getTime();

    return banners.filter((b) => {
      if (b.dismissible && this.dismissedBannerIds.has(b.id)) {
        return false;
      }
      try {
        const start = new Date(b.startsAt).getTime();
        const end = new Date(b.endsAt).getTime();
        return now >= start && now <= end;
      } catch {
        return false;
      }
    });
  }

  /**
   * Dismiss a banner and remember dismissed ID
   */
  async dismissBanner(bannerId: string): Promise<void> {
    this.dismissedBannerIds.add(bannerId);
    try {
      await AsyncStorage.setItem(
        DISMISSED_BANNERS_KEY,
        JSON.stringify(Array.from(this.dismissedBannerIds))
      );
      this.notify();
    } catch (err) {
      console.warn('[RemoteConfig] Failed to save dismissed banner:', err);
    }
  }

  /**
   * Get current in-memory config snapshot
   */
  getConfig(): RemoteConfigData {
    return this.currentConfig;
  }

  /**
   * For unit testing
   */
  _resetForTesting() {
    this.currentConfig = { ...DEFAULT_REMOTE_CONFIG };
    this.dismissedBannerIds.clear();
    this.lastFetchTime = 0;
  }
}

export const remoteConfigService = new RemoteConfigService();
