import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes } from '@theme/dayRibbon';
import {
  getHODForYear,
  getCCBoardForYear,
  HODBoardInfo,
  CCBoardMember,
} from '@config/facultyBoard';

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

  return (
    <View style={styles.container}>
      {showTitle && (
        <View style={styles.titleRow}>
          <Text style={styles.boardHeaderTitle}>
            ACADEMIC LEADERSHIP BOARD ({hodInfo.yearDisplay.toUpperCase()})
          </Text>
        </View>
      )}

      {/* ── HOD BOARD CARD ── */}
      <View style={styles.hodBoardCard}>
        <View style={styles.hodHeaderRow}>
          <View style={styles.hodBadgeBox}>
            <Text style={styles.hodBadgeText}>HOD BOARD</Text>
          </View>
          <View style={styles.deptBadge}>
            <Text style={styles.deptBadgeText}>{hodInfo.department.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.hodInfoRow}>
          <Avatar.Text
            size={50}
            label={hodInfo.hodName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
            style={styles.hodAvatar}
            labelStyle={styles.hodAvatarText}
          />
          <View style={styles.hodDetailsBox}>
            <Text style={styles.hodRoleLabel}>HEAD OF DEPARTMENT</Text>
            <Text style={styles.hodName}>{hodInfo.hodName}</Text>
            <View style={styles.emailRow}>
              <Feather name="mail" size={13} color={DayRibbonColors.muted} />
              <Text style={styles.emailText}>{hodInfo.email}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── CC BOARD HEADER ── */}
      <View style={styles.ccBoardHeaderRow}>
        <Text style={styles.ccBoardTitle}>
          CLASS COUNSELOR FACULTY BOARD ({ccBoard.length})
        </Text>
      </View>

      {/* ── CC CARDS LIST ── */}
      <View style={styles.ccGridContainer}>
        {ccBoard.map((cc) => (
          <TouchableOpacity
            key={cc.classId}
            style={styles.ccItemCard}
            onPress={() => onSelectCC && onSelectCC(cc)}
            activeOpacity={0.75}
          >
            <View style={styles.ccCardHeader}>
              <View style={styles.sectionIndicator}>
                <Text style={styles.sectionText}>{cc.classId.toUpperCase()}</Text>
              </View>
              <Text style={styles.ccDeptBadge}>{cc.department.toUpperCase()}</Text>
            </View>

            <Text style={styles.ccFacultyName}>{cc.facultyName}</Text>
            <Text style={styles.ccDesignationText}>{cc.designation.toUpperCase()}</Text>

            <View style={styles.ccDivider} />

            <View style={styles.ccFooterRow}>
              <View style={styles.ccEmailBox}>
                <Feather name="mail" size={12} color={DayRibbonColors.muted} />
                <Text style={styles.ccEmailText} numberOfLines={1}>
                  {cc.email}
                </Text>
              </View>
              <Feather name="arrow-right" size={16} color={DayRibbonColors.cobalt} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
  },
  titleRow: {
    marginBottom: 10,
  },
  boardHeaderTitle: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
  },
  hodBoardCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 16,
    marginBottom: 16,
    ...DayRibbonShapes.shadow,
  },
  hodHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hodBadgeBox: {
    backgroundColor: DayRibbonColors.cobaltTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  hodBadgeText: {
    color: DayRibbonColors.cobalt,
    fontFamily: DayRibbonFonts.body700,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  deptBadge: {
    backgroundColor: DayRibbonColors.bg,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  deptBadgeText: {
    color: DayRibbonColors.ink,
    fontFamily: DayRibbonFonts.body700,
    fontSize: 10,
  },
  hodInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hodAvatar: {
    backgroundColor: DayRibbonColors.cobalt,
    borderRadius: 25,
    marginRight: 14,
  },
  hodAvatarText: {
    color: DayRibbonColors.white,
    fontFamily: DayRibbonFonts.display,
  },
  hodDetailsBox: {
    flex: 1,
  },
  hodRoleLabel: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 10,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
  },
  hodName: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 17,
    lineHeight: 22,
    color: DayRibbonColors.ink,
    marginTop: 2,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  emailText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
    marginLeft: 6,
  },
  ccBoardHeaderRow: {
    marginBottom: 10,
  },
  ccBoardTitle: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 11,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
  },
  ccGridContainer: {},
  ccItemCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    marginBottom: 12,
    ...DayRibbonShapes.shadow,
  },
  ccCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIndicator: {
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: DayRibbonColors.cobaltTint,
  },
  sectionText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.cobalt,
  },
  ccDeptBadge: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 10,
    letterSpacing: 0.5,
    color: DayRibbonColors.muted,
  },
  ccFacultyName: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    color: DayRibbonColors.ink,
  },
  ccDesignationText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
    marginTop: 2,
  },
  ccDivider: {
    height: 1,
    backgroundColor: DayRibbonColors.line,
    marginVertical: 10,
  },
  ccFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ccEmailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ccEmailText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
    marginLeft: 6,
  },
});

export default FacultyBoardCard;
