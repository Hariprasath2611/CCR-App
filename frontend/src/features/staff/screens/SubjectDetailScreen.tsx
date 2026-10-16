import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StaffStackParamList } from '@navigation/types';
import { SyllabusRepository } from '@database/repositories/SyllabusRepository';
import { SQLiteSyllabusNode } from '@database/types';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { BigNumber } from '@components/editorial/BigNumber';
import { Label } from '@components/editorial/Label';
import { StatTile } from '@components/editorial/StatTile';
import { ProgressBar } from '@components/editorial/ProgressBar';

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
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={20} color={DayRibbonColors.ink} />
          </TouchableOpacity>
          <View style={styles.headerTagChip}>
            <Text style={styles.headerTagText}>{subjectCode}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.subjectTitle}>{subjectCode} Syllabus</Text>
        <Text style={styles.subjectSubtitle}>
          Complete unit-wise syllabus breakdown and verified topic coverage logs.
        </Text>

        {/* Big Number Coverage Hero Card */}
        <View style={styles.heroCard}>
          <Label text="COURSE COMPLETION" />
          <View style={styles.heroRow}>
            <BigNumber value={overallPercent} size="big" showPercent color={DayRibbonColors.cobalt} />
          </View>
          <ProgressBar
            progress={overallPercent / 100}
            isLagging={overallPercent < 50}
            style={styles.heroProgress}
          />
        </View>

        {/* 3-Column Stat Tiles */}
        <View style={styles.statGrid}>
          <StatTile
            label="Completed"
            value={completedCount}
            style={styles.statTileItem}
          />
          <StatTile
            label="Total Topics"
            value={totalCount}
            style={styles.statTileItem}
          />
          <StatTile
            label="Remaining"
            value={totalCount - completedCount}
            style={styles.statTileItem}
          />
        </View>

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
          <Text style={styles.primaryActionText}>Log Weekly Progress</Text>
          <Feather name="arrow-right" size={18} color={DayRibbonColors.surface} />
        </TouchableOpacity>

        {/* Topics by Unit */}
        {loading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonBlock} />
          </View>
        ) : totalCount === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="book-open" size={24} color={DayRibbonColors.muted} />
            </View>
            <Text style={styles.emptyTitle}>No Syllabus Topics Found</Text>
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
                  <Text style={styles.unitTitle}>{unitName}</Text>
                  <View style={styles.unitBadge}>
                    <Text style={styles.unitBadgeText}>
                      {unitCompleted}/{unitTopics.length} ({unitPercent}%)
                    </Text>
                  </View>
                </View>

                <View style={styles.topicList}>
                  {unitTopics.map((topic) => {
                    const isDone = topic.is_completed === 1;
                    return (
                      <TouchableOpacity
                        key={topic.topic_id}
                        style={styles.topicCard}
                        onPress={() => toggleTopic(topic)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.checkboxCircle,
                            isDone ? styles.checkboxCircleChecked : null,
                          ]}
                        >
                          {isDone && (
                            <Feather name="check" size={14} color={DayRibbonColors.surface} />
                          )}
                        </View>

                        <View style={styles.topicInfo}>
                          <Text
                            style={[
                              styles.topicName,
                              isDone ? styles.topicNameDone : null,
                            ]}
                          >
                            {topic.topic_title}
                          </Text>
                          {topic.completed_date ? (
                            <Text style={styles.completedDateText}>
                              Completed: {topic.completed_date}
                            </Text>
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
    backgroundColor: DayRibbonColors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  content: {
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
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
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: DayRibbonColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DayRibbonShapes.chipRadius,
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  headerTagText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.cobalt,
  },
  subjectTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: DayRibbonColors.ink,
    marginBottom: 4,
  },
  subjectSubtitle: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
    lineHeight: 18,
    marginBottom: 16,
  },
  heroCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 20,
    marginBottom: 16,
  },
  heroRow: {
    marginTop: 6,
    marginBottom: 12,
  },
  heroProgress: {
    marginTop: 4,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statTileItem: {
    flex: 1,
  },
  primaryActionButton: {
    height: 52,
    width: '100%',
    borderRadius: DayRibbonShapes.buttonRadius,
    backgroundColor: DayRibbonColors.cobalt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  primaryActionText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 14,
    color: DayRibbonColors.surface,
  },
  unitBlock: {
    marginBottom: 20,
  },
  unitHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  unitTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 15,
    letterSpacing: 0.5,
    color: DayRibbonColors.ink,
  },
  unitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: DayRibbonShapes.chipRadius,
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  unitBadgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.muted,
  },
  topicList: {
    gap: 8,
  },
  topicCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: DayRibbonColors.line,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCircleChecked: {
    backgroundColor: DayRibbonColors.cobalt,
    borderColor: DayRibbonColors.cobalt,
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontFamily: DayRibbonFonts.body600,
    fontSize: 14,
    lineHeight: 20,
    color: DayRibbonColors.ink,
  },
  topicNameDone: {
    textDecorationLine: 'line-through',
    color: DayRibbonColors.muted,
  },
  completedDateText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 11,
    color: DayRibbonColors.muted,
    marginTop: 2,
  },
  skeletonContainer: {
    gap: 12,
    paddingVertical: 16,
  },
  skeletonBlock: {
    height: 80,
    backgroundColor: DayRibbonColors.line,
    borderRadius: DayRibbonShapes.cardRadius,
  },
  emptyContainer: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 24,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DayRibbonColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 18,
    color: DayRibbonColors.ink,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 13,
    color: DayRibbonColors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
