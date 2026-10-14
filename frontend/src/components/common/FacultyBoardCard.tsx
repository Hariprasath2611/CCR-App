import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { EditorialColors, EditorialFonts, EditorialRules } from '@theme/editorial';
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
            size={52}
            label={hodInfo.hodName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
            style={styles.hodAvatar}
            labelStyle={styles.hodAvatarText}
          />
          <View style={styles.hodDetailsBox}>
            <Text style={styles.hodRoleLabel}>HEAD OF DEPARTMENT</Text>
            <Text style={styles.hodName}>{hodInfo.hodName}</Text>
            <View style={styles.emailRow}>
              <Feather name="mail" size={13} color={EditorialColors.muted} />
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
            activeOpacity={0.7}
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
                <Feather name="mail" size={12} color={EditorialColors.muted} />
                <Text style={styles.ccEmailText} numberOfLines={1}>
                  {cc.email}
                </Text>
              </View>
              <Feather name="arrow-right" size={14} color={EditorialColors.ink} />
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
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 2,
    color: EditorialColors.muted,
  },
  hodBoardCard: {
    backgroundColor: EditorialColors.ink,
    borderRadius: 0,
    borderWidth: EditorialRules.borderWidth,
    borderColor: EditorialColors.ink,
    padding: 16,
    marginBottom: 16,
  },
  hodHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hodBadgeBox: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: EditorialColors.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 0,
  },
  hodBadgeText: {
    color: EditorialColors.white,
    fontFamily: EditorialFonts.heavy,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  deptBadge: {
    backgroundColor: EditorialColors.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 0,
  },
  deptBadgeText: {
    color: EditorialColors.ink,
    fontFamily: EditorialFonts.heavy,
    fontSize: 10,
    letterSpacing: 1,
  },
  hodInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hodAvatar: {
    backgroundColor: EditorialColors.white,
    borderRadius: 0,
    marginRight: 12,
  },
  hodAvatarText: {
    color: EditorialColors.ink,
    fontFamily: EditorialFonts.display,
  },
  hodDetailsBox: {
    flex: 1,
  },
  hodRoleLabel: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 10,
    letterSpacing: 2,
    color: EditorialColors.muted,
  },
  hodName: {
    fontFamily: EditorialFonts.display,
    fontSize: 18,
    lineHeight: 22,
    color: EditorialColors.white,
    marginTop: 2,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  emailText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
    marginLeft: 6,
  },
  ccBoardHeaderRow: {
    marginBottom: 10,
  },
  ccBoardTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 2,
    color: EditorialColors.muted,
  },
  ccGridContainer: {
  },
  ccItemCard: {
    backgroundColor: EditorialColors.bg,
    borderRadius: 0,
    padding: 14,
    borderWidth: EditorialRules.hairline,
    borderColor: EditorialColors.ink,
    marginBottom: 10,
  },
  ccCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIndicator: {
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
    backgroundColor: EditorialColors.white,
  },
  sectionText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1,
    color: EditorialColors.ink,
  },
  ccDeptBadge: {
    fontFamily: EditorialFonts.bold,
    fontSize: 10,
    letterSpacing: 1,
    color: EditorialColors.muted,
  },
  ccFacultyName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 16,
    color: EditorialColors.ink,
  },
  ccDesignationText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 11,
    color: EditorialColors.muted,
    marginTop: 2,
  },
  ccDivider: {
    height: 1,
    backgroundColor: EditorialColors.track,
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
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
    marginLeft: 6,
  },
});
