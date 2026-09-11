import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Avatar, Card, Badge, Divider } from 'react-native-paper';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette } from '@theme/colors';
import {
  getHODForYear,
  getCCBoardForYear,
  HODBoardInfo,
  CCBoardMember,
} from '@config/facultyBoard';
import { ms } from '@theme/responsive';

interface FacultyBoardCardProps {
  yearOrDept?: string;
  onSelectCC?: (cc: CCBoardMember) => void;
  showTitle?: boolean;
}

export const FacultyBoardCard: React.FC<FacultyBoardCardProps> = ({
  yearOrDept = '1st Year',
  onSelectCC,
  showTitle = true,
}) => {
  const hodInfo: HODBoardInfo = getHODForYear(yearOrDept);
  const ccBoard: CCBoardMember[] = getCCBoardForYear(yearOrDept);

  const getSectionBadgeColor = (sec: string) => {
    const s = sec.toUpperCase();
    if (s.includes('A')) return '#3B82F6';
    if (s.includes('B')) return '#10B981';
    if (s.includes('C')) return '#8B5CF6';
    if (s.includes('D')) return '#F59E0B';
    if (s.includes('E')) return '#EC4899';
    if (s.includes('F')) return '#06B6D4';
    if (s.includes('G')) return '#6366F1';
    return Palette.primary;
  };

  return (
    <View style={styles.container}>
      {showTitle && (
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="shield-account-outline" size={22} color={Palette.primary} />
          <Text style={styles.boardHeaderTitle}>Academic Leadership Board ({hodInfo.yearDisplay})</Text>
        </View>
      )}

      {/* ── HOD BOARD CARD ── */}
      <Card style={styles.hodBoardCard}>
        <Card.Content style={styles.hodCardContent}>
          <View style={styles.hodHeaderRow}>
            <View style={styles.hodBadgeBox}>
              <MaterialCommunityIcons name="crown" size={16} color="#FFFFFF" />
              <Text style={styles.hodBadgeText}>HOD BOARD</Text>
            </View>
            <Badge style={styles.deptBadge}>{hodInfo.department}</Badge>
          </View>

          <View style={styles.hodInfoRow}>
            <Avatar.Text
              size={50}
              label={hodInfo.hodName.replace(/^(Dr\.|Mrs\.|Mr\.|Ms\.)\s*/, '').substring(0, 2).toUpperCase()}
              style={styles.hodAvatar}
              labelStyle={styles.hodAvatarText}
            />
            <View style={styles.hodDetailsBox}>
              <Text style={styles.hodRoleLabel}>{hodInfo.designation}</Text>
              <Text style={styles.hodName}>{hodInfo.hodName}</Text>
              <View style={styles.emailRow}>
                <Feather name="mail" size={12} color="#C8D8F5" />
                <Text style={styles.emailText}>{hodInfo.email}</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* ── CC BOARD HEADER ── */}
      <View style={styles.ccBoardHeaderRow}>
        <MaterialCommunityIcons name="account-group" size={20} color={Palette.textDark} />
        <Text style={styles.ccBoardTitle}>CLASS COORDINATOR (CC) BOARD</Text>
        <Badge style={styles.countBadge}>{ccBoard.length} Sections</Badge>
      </View>

      {/* ── CC BOARD GRID / CARDS ── */}
      <View style={styles.ccGridContainer}>
        {ccBoard.map((cc) => {
          const color = getSectionBadgeColor(cc.section);
          return (
            <TouchableOpacity
              key={cc.classId}
              style={styles.ccItemCard}
              activeOpacity={0.8}
              onPress={() => onSelectCC && onSelectCC(cc)}
            >
              <View style={styles.ccCardHeader}>
                <View style={[styles.sectionIndicator, { backgroundColor: color + '15', borderColor: color + '40' }]}>
                  <Text style={[styles.sectionText, { color }]}>{cc.section.replace('Section ', 'SEC ')}</Text>
                </View>
                <Badge style={[styles.ccDeptBadge, { backgroundColor: '#F1F5F9', color: Palette.textDark }]}>
                  {cc.department}
                </Badge>
              </View>

              <Text style={styles.ccFacultyName}>{cc.facultyName}</Text>
              <Text style={styles.ccDesignationText} numberOfLines={1}>{cc.designation}</Text>

              <Divider style={styles.ccDivider} />

              <View style={styles.ccFooterRow}>
                <View style={styles.ccEmailBox}>
                  <Feather name="mail" size={11} color={Palette.textLight} />
                  <Text style={styles.ccEmailText} numberOfLines={1}>{cc.email}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={Palette.textLight} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: ms(8),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ms(12),
    gap: ms(8),
  },
  boardHeaderTitle: {
    fontSize: ms(16),
    fontWeight: '900',
    color: Palette.textDark,
  },

  // HOD Board Styles
  hodBoardCard: {
    backgroundColor: '#0F52BA',
    borderRadius: ms(20),
    marginBottom: ms(16),
    elevation: 3,
    shadowColor: '#0F52BA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  hodCardContent: {
    padding: ms(18),
  },
  hodHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(14),
  },
  hodBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: ms(10),
    paddingVertical: ms(4),
    borderRadius: ms(8),
    gap: ms(6),
  },
  hodBadgeText: {
    color: '#FFFFFF',
    fontSize: ms(11),
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  deptBadge: {
    backgroundColor: '#FFFFFF',
    color: '#0F52BA',
    fontWeight: '800',
    paddingHorizontal: ms(10),
    borderRadius: ms(6),
  },
  hodInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(14),
  },
  hodAvatar: {
    backgroundColor: '#FFFFFF',
  },
  hodAvatarText: {
    color: '#0F52BA',
    fontWeight: '900',
  },
  hodDetailsBox: {
    flex: 1,
  },
  hodRoleLabel: {
    fontSize: ms(11),
    color: '#C8D8F5',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  hodName: {
    fontSize: ms(20),
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: ms(2),
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    marginTop: ms(4),
  },
  emailText: {
    fontSize: ms(12),
    color: '#E2E8F0',
    fontWeight: '500',
  },

  // CC Board Styles
  ccBoardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ms(12),
    marginTop: ms(4),
    gap: ms(8),
  },
  ccBoardTitle: {
    fontSize: ms(13),
    fontWeight: '800',
    color: Palette.textDark,
    letterSpacing: 0.5,
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#EEF2FF',
    color: Palette.primary,
    fontWeight: '800',
  },

  // CC Items Grid
  ccGridContainer: {
    gap: ms(12),
  },
  ccItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    padding: ms(14),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  ccCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(8),
  },
  sectionIndicator: {
    paddingHorizontal: ms(10),
    paddingVertical: ms(4),
    borderRadius: ms(8),
    borderWidth: 1,
  },
  sectionText: {
    fontSize: ms(12),
    fontWeight: '900',
  },
  ccDeptBadge: {
    fontWeight: '700',
    fontSize: ms(10.5),
  },
  ccFacultyName: {
    fontSize: ms(16),
    fontWeight: '800',
    color: Palette.textDark,
  },
  ccDesignationText: {
    fontSize: ms(11.5),
    color: Palette.textLight,
    fontWeight: '500',
    marginTop: ms(2),
  },
  ccDivider: {
    marginVertical: ms(10),
    backgroundColor: '#F1F5F9',
  },
  ccFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ccEmailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    flex: 1,
  },
  ccEmailText: {
    fontSize: ms(11.5),
    color: Palette.textLight,
    fontWeight: '500',
  },
});
