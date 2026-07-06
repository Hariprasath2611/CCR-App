import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { Palette } from './colors';

const fontConfig = {
  fontFamily: 'System',
};

export const AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Palette.primary,
    primaryContainer: Palette.secondary,
    secondary: Palette.accent,
    background: Palette.background,
    surface: Palette.surface,
    error: Palette.error,
    outline: Palette.border,
  },
  fonts: configureFonts({ config: fontConfig }),
};
