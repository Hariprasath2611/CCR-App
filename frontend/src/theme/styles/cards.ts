import { StyleSheet } from 'react-native';
import { Palette } from '../colors';

export const cardStyles = StyleSheet.create({
  dashboardCard: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Palette.primary,
    // iOS shadow properties
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Android shadow
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Palette.textDark,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Palette.textLight,
  },
});
