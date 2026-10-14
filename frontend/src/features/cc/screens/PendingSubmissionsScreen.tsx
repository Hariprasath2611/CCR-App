import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, Avatar, Chip } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { CCStackParamList } from '@navigation/types';
import { useReportStore, SubjectProgress } from '../store/useReportStore';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ms } from '@theme/responsive';

type RouteParams = RouteProp<CCStackParamList, 'PendingSubmissions'>;

export const PendingSubmissionsScreen = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<any>();
  const classId = route.params?.classId || '1st Year SEC-A';
  const selectedWeek = 12;

  const subjectProgressList = useReportStore((state) => state.subjectProgressList);
  const subjects: SubjectProgress[] = subjectProgressList[`${classId}_${selectedWeek}`] || [];

  // Filter pending subjects
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <View style={styles.headerCard}>
        <View style={styles.headerIconBox}>
          <MaterialCommunityIcons name="clock-alert-outline" size={32} color="#EF4444" />
        </View>
        <Text style={styles.headerTitle}>Pending Submissions Queue</Text>
        <Text style={styles.headerSub}>
          Faculty teachers in <Text style={{ fontWeight: '700', color: Palette.textDark }}>{classId}</Text> who have not yet submitted syllabus logs for Week {selectedWeek}.
        </Text>

        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {pendingSubjects.length} Subject{pendingSubjects.length !== 1 ? 's' : ''} Awaiting Submission
          </Text>
        </View>

        {pendingSubjects.length > 0 && (
          <Button
            mode="contained"
            icon="bell-ring"
            onPress={handleSendAllReminders}
            style={styles.remindAllBtn}
          >
            Remind All Faculty
          </Button>
        )}
      </View>

      {/* Pending Items List */}
      {pendingSubjects.length === 0 ? (
        <Card style={styles.allDoneCard}>
          <Card.Content style={styles.allDoneContent}>
            <MaterialCommunityIcons name="check-decagram" size={64} color={Palette.success} />
            <Text style={styles.allDoneTitle}>All Logged On Time!</Text>
            <Text style={styles.allDoneSub}>
              All assigned subject teachers for {classId} have successfully submitted their Week {selectedWeek} progress logs.
            </Text>
            <Button
              mode="contained"
              style={{ marginTop: ms(16) }}
              onPress={() => navigation.navigate('ConsolidatedReport', { classId, weekNumber: selectedWeek })}
            >
              Open Consolidated Spreadsheet
            </Button>
          </Card.Content>
        </Card>
      ) : (
        pendingSubjects.map((sub) => {
          const isReminded = remindedMap[sub.code];
          return (
            <Card key={sub.code} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeBadgeText}>{sub.code}</Text>
                  </View>
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>DUE TODAY</Text>
                  </View>
                </View>

                <Text style={styles.subTitle}>{sub.name}</Text>
                <Text style={styles.facultyName}>Assigned Teacher: {sub.faculty}</Text>

                <View style={styles.footerRow}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.lastKnown}>Last Recorded Progress: {sub.coverage}%</Text>
                  </View>

                  <Button
                    mode={isReminded ? 'outlined' : 'contained-tonal'}
                    compact
                    icon={isReminded ? 'check' : 'bell-outline'}
                    disabled={isReminded}
                    onPress={() => handleSendReminder(sub)}
                    textColor={isReminded ? Palette.success : Palette.primary}
                    style={styles.remindBtn}
                  >
                    {isReminded ? 'Notified' : 'Send Reminder'}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: ms(16),
    paddingBottom: ms(40),
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    padding: ms(20),
    alignItems: 'center',
    marginBottom: ms(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  headerIconBox: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ms(12),
  },
  headerTitle: {
    fontSize: ms(18),
    fontWeight: '900',
    color: Palette.textDark,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: ms(12.5),
    color: Palette.textLight,
    textAlign: 'center',
    marginTop: ms(4),
    lineHeight: ms(18),
  },
  countBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: ms(12),
    paddingVertical: ms(6),
    borderRadius: ms(10),
    marginTop: ms(12),
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  countBadgeText: {
    fontSize: ms(12),
    fontWeight: '800',
    color: Palette.error,
  },
  remindAllBtn: {
    marginTop: ms(14),
    backgroundColor: Palette.primary,
    borderRadius: ms(12),
    width: '100%',
  },
  allDoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    padding: ms(24),
  },
  allDoneContent: {
    alignItems: 'center',
  },
  allDoneTitle: {
    fontSize: ms(18),
    fontWeight: '800',
    color: Palette.textDark,
    marginTop: ms(12),
  },
  allDoneSub: {
    fontSize: ms(13),
    color: Palette.textLight,
    textAlign: 'center',
    marginTop: ms(4),
    lineHeight: ms(19),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    marginBottom: ms(12),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(6),
  },
  codeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(6),
  },
  codeBadgeText: {
    fontSize: ms(12),
    fontWeight: '800',
    color: Palette.primary,
  },
  urgentBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(6),
  },
  urgentBadgeText: {
    fontSize: ms(10),
    fontWeight: '800',
    color: Palette.error,
  },
  subTitle: {
    fontSize: ms(14.5),
    fontWeight: '800',
    color: Palette.textDark,
  },
  facultyName: {
    fontSize: ms(12.5),
    color: Palette.primary,
    fontWeight: '700',
    marginTop: ms(2),
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: ms(12),
    paddingTop: ms(8),
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  progressInfo: {
    flex: 1,
  },
  lastKnown: {
    fontSize: ms(11.5),
    color: Palette.textLight,
  },
  remindBtn: {
    borderRadius: ms(8),
  },
});

export default PendingSubmissionsScreen;
