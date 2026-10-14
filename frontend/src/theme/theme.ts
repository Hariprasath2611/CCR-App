import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { EditorialColors, EditorialFonts } from './editorial';

const fontConfig = {
  fontFamily: EditorialFonts.semibold,
};

export const AppTheme = {
  ...MD3LightTheme,
  roundness: 0,
  colors: {
    ...MD3LightTheme.colors,
    primary: EditorialColors.ink,
    primaryContainer: EditorialColors.track,
    secondary: EditorialColors.ink,
    secondaryContainer: EditorialColors.track,
    background: EditorialColors.bg,
    surface: EditorialColors.bg,
    surfaceVariant: EditorialColors.bg,
    error: EditorialColors.accent,
    outline: EditorialColors.ink,
    outlineVariant: EditorialColors.track,
    onPrimary: EditorialColors.white,
    onSurface: EditorialColors.ink,
    onBackground: EditorialColors.ink,
  },
  fonts: configureFonts({ config: fontConfig }),
};
