import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import {
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
} from '@expo-google-fonts/archivo';
import { ArchivoBlack_400Regular } from '@expo-google-fonts/archivo-black';
import * as SplashScreen from 'expo-splash-screen';

import { AppTheme } from '@theme/theme';
import { EditorialColors } from '@theme/editorial';
import { RootNavigator } from '@navigation/RootNavigator';
import { syncEngine } from '@features/sync/syncEngine';

SplashScreen.preventAutoHideAsync().catch(() => {});

function App(): React.JSX.Element | null {
  const [fontsLoaded] = useFonts({
    ArchivoBlack_400Regular,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
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
            backgroundColor={EditorialColors.bg}
            barStyle="dark-content"
          />
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
