import { StyleSheet } from 'react-native';
import { EditorialColors, EditorialFonts, EditorialRules } from '../editorial';

export const cardStyles = StyleSheet.create({
  dashboardCard: {
    backgroundColor: EditorialColors.bg,
    borderRadius: 0,
    padding: 16,
    marginBottom: 12,
    borderWidth: EditorialRules.borderWidth,
    borderColor: EditorialColors.ink,
    elevation: 0,
    shadowOpacity: 0,
  },
  cardTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 16,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
  },
});
