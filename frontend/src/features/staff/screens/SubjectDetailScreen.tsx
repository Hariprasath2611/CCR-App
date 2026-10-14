import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StaffStackParamList } from '@navigation/types';
import { SyllabusRepository } from '@database/repositories/SyllabusRepository';
import { SQLiteSyllabusNode } from '@database/types';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { BigNumber } from '@components/editorial/BigNumber';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';

type RouteParams = RouteProp<StaffStackParamList, 'SubjectDetail'>;
type NavProp = NativeStackNavigationProp<StaffStackParamList>;

export const SubjectDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavProp>();
  const subjectCode = route.params?.subjectCode || 'CS3591';

  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<SQLiteSyllabusNode[]>([]);
  const syllabusRepo = new SyllabusRepository();

  const loadSyllabus = async () => {
    try {
      setLoading(true);
      const data = await syllabusRepo.getSyllabusBySubject(subjectCode);
      setTopics(data);
    } catch (err) {
      console.error('Failed to load subject syllabus:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSyllabus();
  }, [subjectCode]);

  const toggleTopic = async (topic: SQLiteSyllabusNode) => {
    try {
      const isDone = topic.is_completed === 1;
      const newStatus = isDone ? 0 : 1;
      await syllabusRepo.updateCompletionStatus(topic.topic_id, !isDone);
      setTopics((prev) =>
        prev.map((t) =>
          t.topic_id === topic.topic_id ? { ...t, is_completed: newStatus } : t
        )
      );
    } catch (e) {
      console.error('Failed to update topic status:', e);
    }
  };

  const unitsMap: Record<string, SQLiteSyllabusNode[]> = {};
  for (const t of topics) {
    const u = t.unit || 'Unit 1';
    if (!unitsMap[u]) unitsMap[u] = [];
    unitsMap[u].push(t);
  }

  const completedCount = topics.filter((t) => t.is_completed === 1).length;
  const totalCount = topics.length;
  const overallPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={20} color={EditorialColors.ink} />
          </TouchableOpacity>
          <Label text={`COURSE CODE • ${subjectCode}`} />
        </View>

        {/* Title heavy 24 */}
        <Text style={styles.subjectTitle}>{subjectCode} SYLLABUS STRUCTURE</Text>
        <Text style={styles.subjectSubtitle}>
          Complete unit-wise syllabus breakdown and verified topic coverage logs.
        </Text>

        {/* Big Number Section */}
        <View style={styles.heroSection}>
          <Label text="COURSE COMPLETION" />
          <View style={styles.heroRow}>
            <BigNumber value={overallPercent} size="big" showPercent />
          </View>
        </View>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

        {/* 3-Column Stat Row */}
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{completedCount}</Text>
            <Label text="COMPLETED" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{totalCount}</Text>
            <Label text="TOTAL" />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{totalCount - completedCount}</Text>
            <Label text="REMAINING" />
          </View>
        </View>

        {/* 1px Hairline Rule */}
        <Rule thickness="hairline" style={styles.hairlineSpacer} />

        {/* Action Button: Log Weekly Progress */}
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() =>
            navigation.navigate('WeeklyProgress', {
              subjectCode,
              weekNumber: 12,
            })
          }
          activeOpacity={0.85}
        >
          <Text style={styles.primaryActionText}>LOG WEEKLY PROGRESS</Text>
          <Feather name="arrow-right" size={18} color={EditorialColors.white} />
        </TouchableOpacity>

        {/* Topics by Unit */}
        {loading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonBlock} />
          </View>
        ) : totalCount === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>NO SYLLABUS TOPICS FOUND</Text>
            <Text style={styles.emptySub}>
              Syllabus topics for {subjectCode} have not yet been seeded into local storage.
            </Text>
          </View>
        ) : (
          Object.keys(unitsMap).map((unitName) => {
            const unitTopics = unitsMap[unitName];
            const unitCompleted = unitTopics.filter((t) => t.is_completed === 1).length;
            const unitPercent = Math.round((unitCompleted / (unitTopics.length || 1)) * 100);

            return (
              <View key={unitName} style={styles.unitBlock}>
                <View style={styles.unitHeaderRow}>
                  <Text style={styles.unitTitle}>{unitName.toUpperCase()}</Text>
                  <Label text={`${unitCompleted}/${unitTopics.length} (${unitPercent}%)`} />
                </View>

                <View style={styles.topicList}>
                  {unitTopics.map((topic) => {
                    const isDone = topic.is_completed === 1;
                    return (
                      <TouchableOpacity
                        key={topic.topic_id}
                        style={styles.topicRow}
                        onPress={() => toggleTopic(topic)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.checkboxSquare,
                            isDone ? styles.checkboxSquareChecked : null,
                          ]}
                        >
                          {isDone && (
                            <Feather name="check" size={14} color={EditorialColors.white} />
                          )}
                        </View>

                        <View style={styles.topicInfo}>
                          <Text
                            style={[
                              styles.topicName,
                              isDone ? styles.topicNameDone : null,
                            ]}
                          >
                            {topic.topic_name}
                          </Text>
                          {topic.hours_allotted ? (
                            <Label text={`${topic.hours_allotted} HOURS ALLOTTED`} />
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    backgroundColor: EditorialColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 24,
    lineHeight: 28,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  subjectSubtitle: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 13,
    color: EditorialColors.muted,
    lineHeight: 18,
    marginBottom: 12,
  },
  heroSection: {
    marginTop: 8,
  },
  heroRow: {
    marginTop: 4,
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
    marginBottom: 24,
  },
  primaryActionText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 13,
    letterSpacing: 2,
    color: EditorialColors.white,
  },
  unitBlock: {
    marginBottom: 24,
  },
  unitHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: EditorialColors.ink,
    paddingBottom: 6,
  },
  unitTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 14,
    letterSpacing: 1.5,
    color: EditorialColors.ink,
  },
  topicList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.track,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.track,
    gap: 12,
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxSquareChecked: {
    backgroundColor: EditorialColors.ink,
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: EditorialColors.ink,
    marginBottom: 2,
  },
  topicNameDone: {
    textDecorationLine: 'line-through',
    color: EditorialColors.muted,
  },
  skeletonContainer: {
    gap: 12,
    paddingVertical: 16,
  },
  skeletonBlock: {
    height: 80,
    backgroundColor: EditorialColors.track,
  },
  emptyContainer: {
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 14,
    letterSpacing: 2,
    color: EditorialColors.ink,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: EditorialFonts.semibold,
    fontSize: 12,
    color: EditorialColors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
