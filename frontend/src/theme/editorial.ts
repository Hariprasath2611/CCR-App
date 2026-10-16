import {
  DayRibbonColors,
  DayRibbonFonts,
  DayRibbonType,
  DayRibbonShapes,
  DayRibbonSpacing,
} from './dayRibbon';

export {
  DayRibbonColors,
  DayRibbonFonts,
  DayRibbonType,
  DayRibbonShapes,
  DayRibbonSpacing,
};

// Aliases for compatibility during and after migration
export const EditorialColors = {
  bg: DayRibbonColors.bg,
  ink: DayRibbonColors.ink,
  accent: DayRibbonColors.warn,
  muted: DayRibbonColors.muted,
  track: DayRibbonColors.line,
  white: DayRibbonColors.white,
  surface: DayRibbonColors.surface,
  cobalt: DayRibbonColors.cobalt,
  lemon: DayRibbonColors.lemon,
  line: DayRibbonColors.line,
  mutedSoft: DayRibbonColors.mutedSoft,
  dashed: DayRibbonColors.dashed,
  warn: DayRibbonColors.warn,
  warnBg: DayRibbonColors.warnBg,
} as const;

export const EditorialFonts = {
  display: DayRibbonFonts.display,
  semibold: DayRibbonFonts.body600,
  bold: DayRibbonFonts.body700,
  heavy: DayRibbonFonts.body700,
  regular: DayRibbonFonts.body500,
} as const;

export const EditorialType = {
  heroNumber: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 92,
    lineHeight: 96,
    color: DayRibbonColors.cobalt,
  },
  bigNumber: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 60,
    lineHeight: 64,
    color: DayRibbonColors.ink,
  },
  sectionNumber: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 34,
    lineHeight: 38,
    color: DayRibbonColors.ink,
  },
  screenTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 30,
    lineHeight: 36,
    color: DayRibbonColors.ink,
  },
  listName: {
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
  bodyLarge: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 15,
    lineHeight: 22,
    color: DayRibbonColors.ink,
  },
  caption: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
    textTransform: 'uppercase' as const,
  },
  buttonText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  tabLabel: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    letterSpacing: 0.5,
  },
} as const;

export const EditorialSpacing = {
  xs: DayRibbonSpacing.xs,
  sm: DayRibbonSpacing.sm,
  md: DayRibbonSpacing.md,
  lg: DayRibbonSpacing.lg,
  xl: DayRibbonSpacing.xl,
  xxl: DayRibbonSpacing.xxl,
  xxxl: DayRibbonSpacing.xxxl,
  hero: DayRibbonSpacing.screenTop,
  screenPaddingHorizontal: DayRibbonSpacing.screenHorizontal,
  screenPaddingTop: DayRibbonSpacing.screenTop,
  screenHorizontal: DayRibbonSpacing.screenHorizontal,
  topSafeArea: DayRibbonSpacing.screenTop,
  rowPaddingVertical: 14,
  blockGap: DayRibbonSpacing.blockGap,
} as const;

export const EditorialRules = {
  hairline: 1,
  heavy: 2,
  divider: 1,
  section: 2,
  borderWidth: 1,
  borderRadius: DayRibbonShapes.cardRadius,
  cardRadius: DayRibbonShapes.cardRadius,
  buttonRadius: DayRibbonShapes.buttonRadius,
  chipRadius: DayRibbonShapes.chipRadius,
} as const;
