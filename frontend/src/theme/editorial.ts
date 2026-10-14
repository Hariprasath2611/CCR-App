export const EditorialColors = {
  bg: '#F7F7F4',      // app background (off-white)
  ink: '#111111',     // text, borders, primary buttons, active states
  accent: '#E8452C',  // vermilion: lagging/behind/error/destructive/key numbers
  muted: '#777777',   // secondary text, captions, inactive tab text
  track: '#DAD8D2',   // empty progress segments, disabled fills
  white: '#FFFFFF',   // text on ink/accent backgrounds
} as const;

export const EditorialFonts = {
  display: 'ArchivoBlack_400Regular',
  semibold: 'Archivo_600SemiBold',
  bold: 'Archivo_700Bold',
  heavy: 'Archivo_800ExtraBold',
} as const;

export const EditorialType = {
  heroNumber: {
    fontFamily: EditorialFonts.display,
    fontSize: 104,
    lineHeight: 104,
    color: EditorialColors.ink,
  },
  bigNumber: {
    fontFamily: EditorialFonts.display,
    fontSize: 60,
    lineHeight: 62,
    color: EditorialColors.ink,
  },
  sectionNumber: {
    fontFamily: EditorialFonts.display,
    fontSize: 32,
    lineHeight: 34,
    color: EditorialColors.ink,
  },
  screenTitle: {
    fontFamily: EditorialFonts.display,
    fontSize: 42,
    lineHeight: 44,
    color: EditorialColors.ink,
    letterSpacing: -0.5,
  },
  listName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 17,
    lineHeight: 22,
    color: EditorialColors.ink,
  },
  body: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: EditorialColors.ink,
  },
  bodyLarge: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 15,
    lineHeight: 22,
    color: EditorialColors.ink,
  },
  caption: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
    textTransform: 'uppercase' as const,
  },
  buttonText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  tabLabel: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
} as const;

export const EditorialSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  hero: 28,
  screenPaddingHorizontal: 20,
  screenPaddingTop: 28,
  screenHorizontal: 20,
  topSafeArea: 28,
  rowPaddingVertical: 12,
  blockGap: 12,
} as const;

export const EditorialRules = {
  hairline: 1,
  heavy: 4,
  divider: 1,
  section: 4,
  borderWidth: 1.5,
  borderRadius: 0, // strict 0 everywhere
} as const;

