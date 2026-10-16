import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { CCStackParamList } from '@navigation/types';
import { useReportStore, SubjectProgress } from '../store/useReportStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { Label } from '@components/editorial/Label';
import { StatTile } from '@components/editorial/StatTile';
import { Feather } from '@expo/vector-icons';

type RouteParams = RouteProp<CCStackParamList, 'PendingSubmissions'>;

export const PendingSubmissionsScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<any>();
  const classId = route.params?.classId || '1st Year SEC-A';
  const selectedWeek = 12;

  const subjectProgressList = useReportStore((state) => state.subjectProgressList);
  const subjects: SubjectProgress[] = subjectProgressList[`${classId}_${selectedWeek}`] || [];

  const pendingSubjects = subjects.filter((s) => s.status === 'Pending');
  const [remindedMap, setRemindedMap] = useState<Record<string, boolean>>({});

  const handleSendReminder = (sub: SubjectProgress) => {
    setRemindedMap((prev) => ({ ...prev, [sub.code]: true }));
    Alert.alert(
      'Reminder Dispatched',
      `Notification reminder successfully sent to ${sub.faculty} for ${sub.code} - ${sub.name}.`
    );
  };

  const handleSendAllReminders = () => {
    const updated: Record<string, boolean> = {};
    pendingSubjects.forEach((s) => {
      updated[s.code] = true;
    });
    setRemindedMap(updated);
    Alert.alert(
      'Bulk Reminders Sent',
      `Automated weekly syllabus logging notification sent to all ${pendingSubjects.length} pending faculty members.`
    );
  };

  return (
    <View style={styles.screenWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor={DayRibbonColors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, DayRibbonSpacing.topSafeArea),
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Label text={`AUDIT QUEUE • ${classId.toUpperCase()}`} />
          <Text style={styles.headerTitle}>Pending Queue</Text>
          <Text style={styles.headerSubtitle}>
            Faculty teachers who have not yet submitted syllabus logs for Week {selectedWeek}.
          </Text>
        </View>

        {/* Stat Tiles */}
        <View style={styles.statGrid}>
          <StatTile
            label="Awaiting"
            value={pendingSubjects.length}
            isLagging={pendingSubjects.length > 0}
            style={styles.statTileItem}
          />
          <StatTile
            label="Current"
            value={`W-${selectedWeek}`}
            style={styles.statTileItem}
          />
          <StatTile
            label="Submitted"
            value={subjects.length - pendingSubjects.length}
            style={styles.statTileItem}
          />
        </View>

        {/* Bulk Remind Button if pending */}
        {pendingSubjects.length > 0 && (
          <TouchableOpacity
            style={styles.lemonActionButton}
            onPress={handleSendAllReminders}
            activeOpacity={0.85}
          >
            <Text style={styles.lemonActionText}>Remind All Faculty</Text>
            <Feather name="bell" size={18} color={DayRibbonColors.ink} />
          </TouchableOpacity>
        )}

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>FACULTY QUEUE</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{pendingSubjects.length} PENDING</Text>
          </View>
        </View>

        {/* Pending Items List */}
        {pendingSubjects.length === 0 ? (
          <View style={styles.allDoneCard}>
            <View style={styles.allDoneIconCircle}>
              <Feather name="check" size={24} color={DayRibbonColors.cobalt} />
            </View>
            <Text style={styles.allDoneTitle}>All Logged On Time</Text>
            <Text style={styles.allDoneSub}>
              All assigned subject teachers for {classId} have successfully submitted their Week {selectedWeek} progress logs.
            </Text>
            <TouchableOpacity
              style={styles.allDoneBtn}
              onPress={() => navigation.navigate('ConsolidatedReport', { classId, weekNumber: selectedWeek })}
              activeOpacity={0.85}
            >
              <Text style={styles.allDoneBtnText}>Open Consolidated Spreadsheet</Text>
              <Feather name="arrow-right" size={16} color={DayRibbonColors.surface} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pendingList}>
            {pendingSubjects.map((sub) => {
              const isReminded = remindedMap[sub.code];
              return (
                <View key={sub.code} style={styles.pendingCard}>
                  <View style={styles.rowTop}>
                    <View style={styles.infoCol}>
                      <View style={styles.codeRow}>
                        <Text style={styles.subjectCode}>{sub.code}</Text>
                        <View style={styles.dueBadge}>
                          <Text style={styles.dueBadgeText}>DUE TODAY</Text>
                        </View>
                      </View>
                      <Text style={styles.subjectName}>{sub.name}</Text>
                      <Text style={styles.facultyMeta}>
                        Faculty: {sub.faculty} • Last: {sub.coverage}%
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.remindBtn,
                        isReminded ? styles.remindBtnDisabled : null,
                      ]}
                      disabled={isReminded}
                      onPress={() => handleSendReminder(sub)}
                      activeOpacity={0.7}
                      accessibilityLabel={`Send reminder to ${sub.faculty}`}
                    >
                      <Text
                        style={[
                          styles.remindBtnText,
                          isReminded ? styles.remindBtnTextDisabled : null,
                        ]}
                      >
                        {isReminded ? 'Notified' : 'Remind'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  content: {
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: DayRibbonColors.ink,
    marginTop: 4,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
    lineHeight: 18,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statTileItem: {
    flex: 1,
  },
  lemonActionButton: {
    height: 52,
    borderRadius: DayRibbonShapes.buttonRadius,
    backgroundColor: DayRibbonColors.lemon,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  lemonActionText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.ink,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 13,
    letterSpacing: 1.2,
    color: DayRibbonColors.ink,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: DayRibbonShapes.chipRadius,
    backgroundColor: DayRibbonColors.warnBg,
  },
  countBadgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.warn,
  },
  pendingList: {
    gap: 12,
  },
  pendingCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 16,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    marginRight: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  subjectCode: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  dueBadge: {
    backgroundColor: DayRibbonColors.warnBg,
    borderRadius: DayRibbonShapes.chipRadius,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dueBadgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 10,
    color: DayRibbonColors.warn,
  },
  subjectName: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    lineHeight: 22,
    color: DayRibbonColors.ink,
    marginBottom: 4,
  },
  facultyMeta: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
  },
  remindBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.ink,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remindBtnDisabled: {
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.line,
  },
  remindBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.ink,
  },
  remindBtnTextDisabled: {
    color: DayRibbonColors.mutedSoft,
  },
  allDoneCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 24,
    alignItems: 'center',
  },
  allDoneIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DayRibbonColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  allDoneTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 20,
    color: DayRibbonColors.ink,
    marginBottom: 6,
  },
  allDoneSub: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  allDoneBtn: {
    height: 52,
    paddingHorizontal: 20,
    borderRadius: DayRibbonShapes.buttonRadius,
    backgroundColor: DayRibbonColors.cobalt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  allDoneBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.surface,
  },
});
