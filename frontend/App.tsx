import React, { useEffect } from 'react';
import { StatusBar, AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from '@expo-google-fonts/instrument-sans';
import * as SplashScreen from 'expo-splash-screen';

import { AppTheme } from '@theme/theme';
import { DayRibbonColors } from '@theme/dayRibbon';
import { RootNavigator } from '@navigation/RootNavigator';
import { syncEngine } from '@features/sync/syncEngine';
import { remoteConfigService } from '@services/remoteConfig/remoteConfigService';
import { appUpdateService } from '@services/updater/appUpdateService';
import { useRemoteConfig } from '@services/remoteConfig/useRemoteConfig';
import {
  UpdatePromptModal,
  ForcedUpdateScreen,
  MaintenanceScreen,
  RemoteBanner,
} from '@components/editorial';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppContent(): React.JSX.Element {
  const { activeBanners, dismissBanner } = useRemoteConfig();

  useEffect(() => {
    // Initial fetch on app start (never blocks rendering)
    remoteConfigService.fetchConfig().catch(() => {});
    appUpdateService.checkForUpdate().catch(() => {});

    // Foreground listener (throttled to 15 mins)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        remoteConfigService.fetchConfig().catch(() => {});
        appUpdateService.checkForUpdate().catch(() => {});
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <>
      <StatusBar
        backgroundColor={DayRibbonColors.pageBg}
        barStyle="dark-content"
      />
      {activeBanners.map((banner) => (
        <RemoteBanner
          key={banner.id}
          banner={banner}
          onDismiss={dismissBanner}
        />
      ))}
      <RootNavigator />
      <UpdatePromptModal />
      <ForcedUpdateScreen />
      <MaintenanceScreen />
    </>
  );
}

function App(): React.JSX.Element | null {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_800ExtraBold,
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
  });

  useEffect(() => {
    // Initialize offline sync queue event listener
    syncEngine.initialize();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={AppTheme}>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
