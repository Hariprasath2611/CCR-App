import { StyleSheet } from 'react-native';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '../dayRibbon';

export const cardStyles = StyleSheet.create({
  dashboardCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    padding: 16,
    marginBottom: 14,
    borderWidth: DayRibbonShapes.borderWidth,
    borderColor: DayRibbonColors.line,
    ...DayRibbonShapes.shadow,
  },
  cardTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    color: DayRibbonColors.ink,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
  },
});
