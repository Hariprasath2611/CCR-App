import { useState, useEffect, useCallback } from 'react';
import { remoteConfigService, RemoteConfigData, RemoteBanner } from './remoteConfigService';
import { useAuthStore } from '@features/auth/store/useAuthStore';

export function useRemoteConfig() {
  const [config, setConfig] = useState<RemoteConfigData>(remoteConfigService.getConfig());
  const [activeBanners, setActiveBanners] = useState<RemoteBanner[]>(remoteConfigService.getActiveBanners());
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const unsubscribe = remoteConfigService.subscribe((newConfig) => {
      setConfig(newConfig);
      setActiveBanners(remoteConfigService.getActiveBanners());
    });

    // Initial check
    setConfig(remoteConfigService.getConfig());
    setActiveBanners(remoteConfigService.getActiveBanners());

    return unsubscribe;
  }, []);

  const flag = useCallback(
    (name: string, defaultValue = false) => {
      return remoteConfigService.flag(name, defaultValue);
    },
    [config]
  );

  const getText = useCallback(
    (key: string, defaultValue = '') => {
      return remoteConfigService.getText(key, defaultValue);
    },
    [config]
  );

  const getThemeToken = useCallback(
    (token: 'blue' | 'amber' | 'coral' | 'mint' | 'ink') => {
      return remoteConfigService.getThemeToken(token);
    },
    [config]
  );

  const dismissBanner = useCallback(async (id: string) => {
    await remoteConfigService.dismissBanner(id);
    setActiveBanners(remoteConfigService.getActiveBanners());
  }, []);

  const isMaintenance = remoteConfigService.isMaintenanceActive(user?.role);

  return {
    config,
    flag,
    getText,
    getThemeToken,
    isMaintenance,
    maintenanceInfo: config.maintenance,
    activeBanners,
    dismissBanner,
    refetch: () => remoteConfigService.fetchConfig(true),
  };
}
