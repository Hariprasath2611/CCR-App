import { useState, useEffect } from 'react';
import { appUpdateService, UpdateState } from './appUpdateService';

export function useAppUpdate() {
  const [updateState, setUpdateState] = useState<UpdateState>(appUpdateService.getState());

  useEffect(() => {
    const unsubscribe = appUpdateService.subscribe((state) => {
      setUpdateState(state);
    });
    return unsubscribe;
  }, []);

  return {
    ...updateState,
    checkForUpdate: (force = true) => appUpdateService.checkForUpdate(force),
    startDownload: () => appUpdateService.startDownload(),
    cancelDownload: () => appUpdateService.cancelDownload(),
    installDownloadedApk: () => appUpdateService.installDownloadedApk(),
    requestInstallPermission: () => appUpdateService.requestInstallPermission(),
    snoozeUpdate: () => appUpdateService.snoozeUpdate(),
    dismissPrompt: () => appUpdateService.dismissPrompt(),
  };
}
