import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { CCStackParamList } from '@navigation/types';
import { useReportStore, SubjectProgress } from '../store/useReportStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
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
      <StatusBar barStyle="dark-content" backgroundColor={EditorialColors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, EditorialSpacing.topSafeArea),
            paddingBottom: insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Label text={`AUDIT QUEUE • ${classId.toUpperCase()}`} />
          <Text style={styles.headerTitle}>
            PENDING QUEUE<Text style={styles.accentDot}>.</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Faculty teachers who have not yet submitted syllabus logs for Week {selectedWeek}.
          </Text>
        </View>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* Stat Row */}
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text
              style={[
                styles.statNum,
                pendingSubjects.length > 0 ? styles.accentStatNum : null,
              ]}
            >
              {pendingSubjects.length}
            </Text>
            <Label text="AWAITING" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>W-{selectedWeek}</Text>
            <Label text="CURRENT" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{subjects.length - pendingSubjects.length}</Text>
            <Label text="SUBMITTED" />
          </View>
        </View>

        {/* 1px Hairline Rule */}
        <Rule thickness="hairline" style={styles.hairlineSpacer} />

        {/* Bulk Remind Button if pending */}
        {pendingSubjects.length > 0 && (
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={handleSendAllReminders}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryActionText}>REMIND ALL FACULTY</Text>
            <Feather name="bell" size={16} color={EditorialColors.white} />
          </TouchableOpacity>
        )}

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>FACULTY QUEUE</Text>
          <Label text={`${pendingSubjects.length} PENDING`} />
        </View>

        {/* Pending Items List */}
        {pendingSubjects.length === 0 ? (
          <View style={styles.allDoneBox}>
            <Text style={styles.allDoneTitle}>ALL LOGGED ON TIME</Text>
            <Text style={styles.allDoneSub}>
              All assigned subject teachers for {classId} have successfully submitted their Week {selectedWeek} progress logs.
            </Text>
            <TouchableOpacity
              style={styles.allDoneBtn}
              onPress={() => navigation.navigate('ConsolidatedReport', { classId, weekNumber: selectedWeek })}
              activeOpacity={0.85}
            >
              <Text style={styles.allDoneBtnText}>OPEN CONSOLIDATED SPREADSHEET</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pendingList}>
            {pendingSubjects.map((sub) => {
              const isReminded = remindedMap[sub.code];
              return (
                <View key={sub.code} style={styles.pendingRow}>
                  <View style={styles.rowTop}>
                    <View style={styles.infoCol}>
                      <View style={styles.codeRow}>
                        <Text style={styles.subjectCode}>{sub.code}</Text>
                        <View style={styles.dueBadge}>
                          <Text style={styles.dueBadgeText}>DUE TODAY</Text>
                        </View>
                      </View>
                      <Text style={styles.subjectName}>{sub.name}</Text>
                      <Label
                        text={`FACULTY: ${sub.faculty?.toUpperCase()} • LAST: ${sub.coverage}%`}
                        style={styles.facultyMeta}
                      />
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.remindBtn,
                        isReminded ? styles.remindBtnDisabled : null,
                      ]}
                      disabled={isReminded}
                      onPress={() => handleSendReminder(sub)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.remindBtnText,
                          isReminded ? styles.remindBtnTextDisabled : null,
                        ]}
                      >
                        {isReminded ? 'NOTIFIED' : 'REMIND'}
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
    backgroundColor: EditorialColors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: EditorialColors.bg,
  },
  content: {
    paddingHorizontal: EditorialSpacing.screenHorizontal,
  },
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: EditorialFonts.display,
    fontSize: 36,
    lineHeight: 40,
    color: EditorialColors.ink,
    letterSpacing: -0.5,
    marginTop: 4,
    marginBottom: 4,
  },
  accentDot: {
    color: EditorialColors.accent,
  },
  headerSubtitle: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
    lineHeight: 18,
  },
  heavySpacer: {
    marginVertical: 18,
  },
  hairlineSpacer: {
    marginVertical: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: EditorialFonts.display,
    fontSize: 30,
    lineHeight: 34,
    color: EditorialColors.ink,
    marginBottom: 2,
  },
  accentStatNum: {
    color: EditorialColors.accent,
  },
  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: EditorialColors.ink,
  },
  primaryActionButton: {
    height: 54,
    width: '100%',
    backgroundColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  primaryActionText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.white,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.ink,
  },
  pendingList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
  },
  pendingRow: {
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.ink,
    paddingVertical: 14,
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
    fontFamily: EditorialFonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    color: EditorialColors.muted,
  },
  dueBadge: {
    borderWidth: 1,
    borderColor: EditorialColors.accent,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  dueBadgeText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 9,
    letterSpacing: 1,
    color: EditorialColors.accent,
  },
  subjectName: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 16,
    lineHeight: 20,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  facultyMeta: {
    letterSpacing: 1.5,
  },
  remindBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remindBtnDisabled: {
    borderColor: EditorialColors.track,
    backgroundColor: EditorialColors.track,
  },
  remindBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
  },
  remindBtnTextDisabled: {
    color: EditorialColors.muted,
  },
  allDoneBox: {
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    padding: 20,
    alignItems: 'center',
    backgroundColor: EditorialColors.bg,
  },
  allDoneTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 15,
    letterSpacing: 2,
    color: EditorialColors.ink,
    marginBottom: 6,
  },
  allDoneSub: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    color: EditorialColors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  allDoneBtn: {
    height: 48,
    paddingHorizontal: 20,
    backgroundColor: EditorialColors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allDoneBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 12,
    letterSpacing: 2,
    color: EditorialColors.white,
  },
});
