import { registerRootComponent } from 'expo';
import { LogBox, Platform } from 'react-native';
import App from './App';

// Suppress known third-party React Native Web deprecation warnings
LogBox.ignoreLogs([
  'props.pointerEvents is deprecated. Use style.pointerEvents',
  '"shadow*" style props are deprecated. Use "boxShadow"',
  'Possible EventEmitter memory leak detected',
]);

// Filter out browser extension & web polyfill warnings in browser console
if (Platform.OS === 'web' && typeof console !== 'undefined') {
  const originalWarn = console.warn.bind(console);
  console.warn = (...args) => {
    const msg = args.map((a) => (typeof a === 'string' ? a : a?.message || '')).join(' ');
    if (
      msg.includes('pointerEvents is deprecated') ||
      msg.includes('"shadow*" style props are deprecated') ||
      msg.includes('MaxListenersExceededWarning') ||
      msg.includes('ObjectMultiplex') ||
      msg.includes('app-init-liveness') ||
      msg.includes('background-liveness')
    ) {
      return;
    }
    originalWarn(...args);
  };
}

registerRootComponent(App);
