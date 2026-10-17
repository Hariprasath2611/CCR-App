import { Platform } from 'react-native';

/**
 * DAY RIBBON DESIGN TOKENS
 * Visual signature: horizontal tilted strips, hanging bookmark ribbons, notched ends.
 */
export const DayRibbonColors = {
  // Brand Ribbon Accents
  blue: '#2B35E0',
  amber: '#FFB020',
  coral: '#FF5D73',
  mint: '#3DDBB0',

  // Core Neutrals
  ink: '#0E1030',
  muted: '#4A4E86',
  border: '#D5D8F5',
  fieldBg: '#F6F7FF',
  pageBg: '#FFFFFF',

  // Bottom Nav Inactive Tokens
  inactiveBase: '#7B7FB5',
  inactiveAccent: '#C9CCF0',
  inactiveLabel: '#5A5E96',

  // Aliases for compatibility
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  cobalt: '#2B35E0',
  lemon: '#FFB020',
  line: '#D5D8F5',
  mutedSoft: '#7B7FB5',
  dashed: '#B9C0EE',
  white: '#FFFFFF',
  warn: '#FF5D73',
  warnBg: '#FFF0F2',
  cobaltTint: '#EDF0FF',
} as const;

export const DayRibbonFonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayFallback: Platform.select({ ios: 'System', android: 'sans-serif-black', default: 'sans-serif' }),
  body400: 'InstrumentSans_400Regular',
  body500: 'InstrumentSans_500Medium',
  body600: 'InstrumentSans_600SemiBold',
  body700: 'InstrumentSans_700Bold',
} as const;

export const DayRibbonSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  screenHorizontal: 20,
  screenTop: 16,
  topSafeArea: 16,
  blockGap: 16,
  screenBottom: 24,
} as const;

export const DayRibbonRadii = {
  field: 14,
  sheet: 28,
  pill: 999,
  card: 16,
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
  cardRadius: DayRibbonRadii.card,
  radiusCard: DayRibbonRadii.card,
  buttonRadius: DayRibbonRadii.field,
  radiusButton: DayRibbonRadii.field,
  chipRadius: DayRibbonRadii.pill,
  radiusChip: DayRibbonRadii.pill,
  avatarRadius: 22,
  radiusAvatar: 22,
  borderWidth: 1,
  dashedBorderWidth: 2,
  shadow: Platform.select({
    web: {
      boxShadow: '0 4px 14px rgba(14, 16, 48, 0.08)',
    },
    default: {
      shadowColor: DayRibbonColors.ink,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },
  }) as any,
  upwardShadow: Platform.select({
    web: {
      boxShadow: '0 -3px 12px rgba(14, 16, 48, 0.06)',
    },
    default: {
      shadowColor: DayRibbonColors.ink,
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 4,
    },
  }) as any,
} as const;
