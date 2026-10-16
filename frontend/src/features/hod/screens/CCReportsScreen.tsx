import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useReportStore } from '@features/cc/store/useReportStore';
import { getCCForSection } from '@config/facultyBoard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { Label } from '@components/editorial/Label';
import { ProgressBar } from '@components/editorial/ProgressBar';
import { EditorialChip } from '@components/editorial/EditorialChip';
import { Feather } from '@expo/vector-icons';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const CCReportsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const reports = useReportStore((state) => state.reports);

  const [selectedYear, setSelectedYear] = useState('1st Year');

  const yearReports = reports.filter((r) => r.classId.includes(selectedYear));

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
          <Label text="COORDINATOR SUBMISSIONS" />
          <Text style={styles.headerTitle}>CC Reports</Text>
          <Text style={styles.headerSubtitle}>
            Weekly consolidated course coverage spreadsheets submitted by section coordinators.
          </Text>
        </View>

        {/* Year Filter Chips */}
        <View style={styles.chipRow}>
          {YEARS.map((yr) => (
            <EditorialChip
              key={yr}
              label={yr.toUpperCase()}
              selected={selectedYear === yr}
              onPress={() => setSelectedYear(yr)}
            />
          ))}
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>
            {selectedYear.toUpperCase()} SUBMISSIONS
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{yearReports.length} REPORTS</Text>
          </View>
        </View>

        {/* Reports List */}
        {yearReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="file-text" size={24} color={DayRibbonColors.muted} />
            </View>
            <Text style={styles.emptyTitle}>No Submissions for {selectedYear}</Text>
            <Text style={styles.emptySub}>
              Coordinators have not submitted weekly reports for this academic year yet.
            </Text>
          </View>
        ) : (
          <View style={styles.reportList}>
            {yearReports.map((rep) => {
              const ccInfo = getCCForSection(rep.classId);
              const isLagging = rep.overallCoverage < 75;
              const isApproved = rep.status === 'APPROVED_BY_HOD' || rep.status === 'SENT_TO_ADMIN';
              const isPending = rep.status === 'SUBMITTED_TO_HOD';

              return (
                <View key={rep.id} style={styles.reportCard}>
                  <View style={styles.rowTop}>
                    <View style={styles.infoCol}>
                      <View style={styles.badgeRow}>
                        <View style={styles.classBadge}>
                          <Text style={styles.classBadgeText}>{rep.classId}</Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            isPending ? styles.lemonStatusBadge : styles.cobaltStatusBadge,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              isPending ? styles.lemonStatusText : styles.cobaltStatusText,
                            ]}
                          >
                            {isApproved ? 'Approved' : isPending ? 'Pending Audit' : 'Draft'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.reportTitle}>
                        Week {rep.weekNumber} Consolidated Report
                      </Text>
                      <Text style={styles.ccMetaLabel}>
                        Coordinator: {rep.submittedBy || ccInfo?.facultyName || 'CC'} • Submitted: {rep.submittedAt}
                      </Text>
                    </View>

                    <View style={styles.rightValueBox}>
                      <Text
                        style={[
                          styles.percentText,
                          isLagging ? styles.accentPercentText : null,
                        ]}
                      >
                        {rep.overallCoverage}%
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <ProgressBar
                    progress={rep.overallCoverage / 100}
                    isLagging={isLagging}
                    style={styles.progressSpacing}
                  />

                  {/* Row Action Button */}
                  <View style={styles.rowActions}>
                    <TouchableOpacity
                      style={styles.viewBtn}
                      onPress={() =>
                        navigation.navigate('RequestDetails', {
                          requestId: rep.id,
                          requestType: 'CC_REPORT',
                        })
                      }
                      activeOpacity={0.85}
                    >
                      <Text style={styles.viewBtnText}>View Report</Text>
                      <Feather name="arrow-right" size={14} color={DayRibbonColors.surface} />
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
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
    backgroundColor: DayRibbonColors.surface,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
  },
  countBadgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.muted,
  },
  reportList: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 16,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoCol: {
    flex: 1,
    marginRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  classBadge: {
    backgroundColor: DayRibbonColors.bg,
    borderRadius: DayRibbonShapes.chipRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  classBadgeText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 11,
    color: DayRibbonColors.ink,
  },
  statusBadge: {
    borderRadius: DayRibbonShapes.chipRadius,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  lemonStatusBadge: {
    backgroundColor: DayRibbonColors.lemon,
  },
  cobaltStatusBadge: {
    backgroundColor: 'rgba(43, 63, 224, 0.08)',
  },
  statusText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 10,
  },
  lemonStatusText: {
    color: DayRibbonColors.ink,
  },
  cobaltStatusText: {
    color: DayRibbonColors.cobalt,
  },
  reportTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 16,
    lineHeight: 22,
    color: DayRibbonColors.ink,
    marginBottom: 2,
  },
  ccMetaLabel: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: 12,
    color: DayRibbonColors.muted,
  },
  rightValueBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  percentText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: 26,
    lineHeight: 30,
    color: DayRibbonColors.cobalt,
  },
  accentPercentText: {
    color: DayRibbonColors.warn,
  },
  progressSpacing: {
    marginTop: 4,
    marginBottom: 10,
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  viewBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: DayRibbonColors.cobalt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewBtnText: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: 12,
    color: DayRibbonColors.surface,
  },
  emptyContainer: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
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
