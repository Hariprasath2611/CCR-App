import { Platform } from 'react-native';

export const DayRibbonColors = {
  bg: '#F3F5FF',         // app background (very light blue)
  surface: '#FFFFFF',    // cards
  ink: '#0E1330',        // main text, dark buttons
  cobalt: '#2B3FE0',     // primary: done/logged states, active tab, key numbers
  lemon: '#F5E34A',      // highlight: "now", current item, primary call to action
  line: '#DDE1F8',       // card borders, dividers, tab bar top border
  muted: '#6B73B0',      // secondary text
  mutedSoft: '#8E98E0',  // inactive tab icons/labels, placeholders
  dashed: '#B9C0EE',     // empty/free state borders and numerals
  warn: '#D9482B',       // behind plan / error / destructive (use sparingly)
  warnBg: '#FDECE7',     // warn banner background
  cobaltTint: '#EDF0FF', // info/approved banner background
  white: '#FFFFFF',
} as const;

export const DayRibbonFonts = {
  display: 'Syne_800ExtraBold',
  body500: 'InstrumentSans_500Medium',
  body600: 'InstrumentSans_600SemiBold',
  body700: 'InstrumentSans_700Bold',
} as const;

export const DayRibbonType = {
  heroNumeral: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 92,
    lineHeight: 96,
    color: DayRibbonColors.ink,
  },
  pageTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 30,
    lineHeight: 36,
    color: DayRibbonColors.ink,
  },
  periodNumber: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 34,
    lineHeight: 38,
    color: DayRibbonColors.ink,
  },
  cardTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    lineHeight: 22,
    color: DayRibbonColors.ink,
  },
  body: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 14,
    lineHeight: 20,
    color: DayRibbonColors.ink,
  },
  bodySmall: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    lineHeight: 18,
    color: DayRibbonColors.ink,
  },
  caption: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    textTransform: 'uppercase' as const,
  },
  buttonText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    letterSpacing: 0.5,
  },
} as const;

export const DayRibbonShapes = {
  cardRadius: 22,
  radiusCard: 22,
  buttonRadius: 14,
  radiusButton: 14,
  chipRadius: 14,
  radiusChip: 14,
  avatarRadius: 22, // circular
  radiusAvatar: 22,
  borderWidth: 1,
  dashedBorderWidth: 2,
  shadow: Platform.select({
    web: {
      boxShadow: '0 4px 12px rgba(14, 19, 48, 0.06)',
    },
    default: {
      shadowColor: DayRibbonColors.ink,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
  }) as any,
} as const;

export const DayRibbonSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screenHorizontal: 20,
  screenTop: 28,
  topSafeArea: 28,
  blockGap: 14,
  cardPadding: 16,
} as const;
