import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, ProgressBar, Checkbox, ActivityIndicator, Button } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StaffStackParamList } from '@navigation/types';
import { SyllabusRepository } from '@database/repositories/SyllabusRepository';
import { SQLiteSyllabusNode } from '@database/types';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ms } from '@theme/responsive';

type RouteParams = RouteProp<StaffStackParamList, 'SubjectDetail'>;
type NavProp = NativeStackNavigationProp<StaffStackParamList>;

export const SubjectDetailScreen = () => {
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
      const newStatus = topic.is_completed === 1 ? 0 : 1;
      await syllabusRepo.updateTopicStatus(topic.topic_id, newStatus);
      setTopics((prev) =>
        prev.map((t) =>
          t.topic_id === topic.topic_id ? { ...t, is_completed: newStatus } : t
        )
      );
    } catch (e) {
      console.error('Failed to update topic status:', e);
    }
  };

  // Group topics by unit
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeBadgeText}>{subjectCode}</Text>
          </View>
          <Text style={styles.percentText}>{overallPercent}% Completed</Text>
        </View>

        <Text style={styles.subjectTitle}>Syllabus Units & Topics Structure</Text>
        <Text style={styles.subjectSub}>
          {completedCount} of {totalCount} topics marked as completed
        </Text>

        <ProgressBar
          progress={totalCount > 0 ? completedCount / totalCount : 0}
          color={Palette.primary}
          style={styles.headerProgressBar}
        />

        <Button
          mode="contained"
          icon="playlist-edit"
          style={styles.logBtn}
          onPress={() =>
            navigation.navigate('WeeklyProgress', {
              subjectCode,
              weekNumber: 12,
            })
          }
        >
          Log Weekly Progress for {subjectCode}
        </Button>
      </View>

      {/* Topics by Unit */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Palette.primary} />
          <Text style={styles.loaderText}>Loading syllabus tree...</Text>
        </View>
      ) : totalCount === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <MaterialCommunityIcons name="book-open-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Syllabus Topics Found</Text>
            <Text style={styles.emptySub}>
              Syllabus topics for {subjectCode} have not yet been seeded into local storage.
            </Text>
            <Button
              mode="outlined"
              style={{ marginTop: ms(16) }}
              onPress={() =>
                navigation.navigate('WeeklyProgress', {
                  subjectCode,
                  weekNumber: 12,
                })
              }
            >
              Manual Course Coverage Entry
            </Button>
          </Card.Content>
        </Card>
      ) : (
        Object.keys(unitsMap).map((unitName) => {
          const unitTopics = unitsMap[unitName];
          const unitCompleted = unitTopics.filter((t) => t.is_completed === 1).length;
          const unitPercent = Math.round((unitCompleted / unitTopics.length) * 100);

          return (
            <Card key={unitName} style={styles.unitCard}>
              <Card.Content>
                <View style={styles.unitHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.unitName}>{unitName}</Text>
                    <Text style={styles.unitProgressSub}>
                      {unitCompleted}/{unitTopics.length} Topics Completed ({unitPercent}%)
                    </Text>
                  </View>
                  <ProgressBar
                    progress={unitTopics.length > 0 ? unitCompleted / unitTopics.length : 0}
                    color={unitPercent === 100 ? Palette.success : Palette.primary}
                    style={styles.unitProgressBar}
                  />
                </View>

                {unitTopics.map((topic) => {
                  const isDone = topic.is_completed === 1;
                  return (
                    <TouchableOpacity
                      key={topic.topic_id}
                      style={[styles.topicRow, isDone && styles.topicRowDone]}
                      onPress={() => toggleTopic(topic)}
                      activeOpacity={0.7}
                    >
                      <Checkbox.Android
                        status={isDone ? 'checked' : 'unchecked'}
                        color={Palette.primary}
                        onPress={() => toggleTopic(topic)}
                      />
                      <View style={{ flex: 1, marginLeft: ms(6) }}>
                        <Text style={[styles.topicTitle, isDone && styles.topicTitleDone]}>
                          {topic.topic_name}
                        </Text>
                        <Text style={styles.topicHours}>
                          Planned Duration: {topic.planned_hours || 1.5} hrs
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
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
    padding: ms(18),
    marginBottom: ms(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(10),
  },
  codeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: ms(12),
    paddingVertical: ms(4),
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  codeBadgeText: {
    fontSize: ms(14),
    fontWeight: '800',
    color: Palette.primary,
  },
  percentText: {
    fontSize: ms(14),
    fontWeight: '800',
    color: Palette.primary,
  },
  subjectTitle: {
    fontSize: ms(18),
    fontWeight: '900',
    color: Palette.textDark,
  },
  subjectSub: {
    fontSize: ms(12.5),
    color: Palette.textLight,
    marginTop: ms(2),
    marginBottom: ms(12),
  },
  headerProgressBar: {
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: '#E2E8F0',
    marginBottom: ms(16),
  },
  logBtn: {
    backgroundColor: Palette.primary,
    borderRadius: ms(12),
  },
  loader: {
    alignItems: 'center',
    paddingVertical: ms(40),
  },
  loaderText: {
    fontSize: ms(13),
    color: Palette.textLight,
    marginTop: ms(8),
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    padding: ms(20),
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: ms(16),
    fontWeight: '800',
    color: Palette.textDark,
    marginTop: ms(10),
  },
  emptySub: {
    fontSize: ms(13),
    color: Palette.textLight,
    textAlign: 'center',
    marginTop: ms(4),
  },
  unitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    marginBottom: ms(12),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
  },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: ms(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: ms(8),
  },
  unitName: {
    fontSize: ms(15),
    fontWeight: '800',
    color: Palette.textDark,
  },
  unitProgressSub: {
    fontSize: ms(11.5),
    color: Palette.textLight,
    marginTop: ms(2),
  },
  unitProgressBar: {
    width: ms(80),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: '#E2E8F0',
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ms(8),
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  topicRowDone: {
    backgroundColor: '#F8FAFC',
    borderRadius: ms(8),
    paddingHorizontal: ms(4),
  },
  topicTitle: {
    fontSize: ms(13.5),
    fontWeight: '600',
    color: Palette.textDark,
  },
  topicTitleDone: {
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  topicHours: {
    fontSize: ms(11),
    color: '#94A3B8',
    marginTop: ms(1),
  },
});

export default SubjectDetailScreen;
