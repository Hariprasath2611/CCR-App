import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Syne_800ExtraBold } from '@expo-google-fonts/syne';
import {
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from '@expo-google-fonts/instrument-sans';
import * as SplashScreen from 'expo-splash-screen';

import { AppTheme } from '@theme/theme';
import { DayRibbonColors } from '@theme/dayRibbon';
import { RootNavigator } from '@navigation/RootNavigator';
import { syncEngine } from '@features/sync/syncEngine';

SplashScreen.preventAutoHideAsync().catch(() => {});

function App(): React.JSX.Element | null {
  const [fontsLoaded] = useFonts({
    Syne_800ExtraBold,
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
          <StatusBar
            backgroundColor={DayRibbonColors.bg}
            barStyle="dark-content"
          />
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
