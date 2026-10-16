import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from './dayRibbon';

const fontConfig = {
  fontFamily: DayRibbonFonts.body500,
};

export const AppTheme = {
  ...MD3LightTheme,
  roundness: DayRibbonShapes.cardRadius,
  colors: {
    ...MD3LightTheme.colors,
    primary: DayRibbonColors.cobalt,
    primaryContainer: DayRibbonColors.cobaltTint,
    secondary: DayRibbonColors.ink,
    secondaryContainer: DayRibbonColors.line,
    background: DayRibbonColors.bg,
    surface: DayRibbonColors.surface,
    surfaceVariant: DayRibbonColors.bg,
    error: DayRibbonColors.warn,
    errorContainer: DayRibbonColors.warnBg,
    outline: DayRibbonColors.line,
    outlineVariant: DayRibbonColors.dashed,
    onPrimary: DayRibbonColors.white,
    onSurface: DayRibbonColors.ink,
    onBackground: DayRibbonColors.ink,
  },
  fonts: configureFonts({ config: fontConfig }),
};
