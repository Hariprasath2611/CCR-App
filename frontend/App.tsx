import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { AppTheme } from '@theme/theme';
import { RootNavigator } from '@navigation/RootNavigator';
import { syncEngine } from '@features/sync/syncEngine';

function App(): React.JSX.Element {
  useEffect(() => {
    // Initialize offline sync queue event listener
    syncEngine.initialize();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={AppTheme}>
        <NavigationContainer>
          <StatusBar
            backgroundColor={AppTheme.colors.primary}
            barStyle="light-content"
          />
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;

