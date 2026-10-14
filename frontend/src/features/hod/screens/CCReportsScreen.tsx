import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useReportStore } from '@features/cc/store/useReportStore';
import { getCCForSection } from '@config/facultyBoard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialFonts, EditorialRules, EditorialSpacing } from '@theme/editorial';
import { Label } from '@components/editorial/Label';
import { Rule } from '@components/editorial/Rule';
import { SegBar } from '@components/editorial/SegBar';
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
          <Label text="COORDINATOR SUBMISSIONS" />
          <Text style={styles.headerTitle}>
            CC REPORTS<Text style={styles.accentDot}>.</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Weekly consolidated course coverage spreadsheets submitted by section coordinators.
          </Text>
        </View>

        {/* 4px Heavy Section Rule */}
        <Rule thickness="heavy" style={styles.heavySpacer} />

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
          <Label text={`${yearReports.length} REPORTS`} />
        </View>

        {/* Reports List */}
        {yearReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>NO SUBMISSIONS FOR {selectedYear.toUpperCase()}</Text>
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
                <View key={rep.id} style={styles.reportRow}>
                  <View style={styles.rowTop}>
                    <View style={styles.infoCol}>
                      <View style={styles.badgeRow}>
                        <View style={styles.classBadge}>
                          <Text style={styles.classBadgeText}>{rep.classId}</Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            isPending ? styles.accentStatusBadge : null,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              isPending ? styles.accentStatusText : null,
                            ]}
                          >
                            {isApproved ? 'APPROVED' : isPending ? 'PENDING AUDIT' : 'DRAFT'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.reportTitle}>
                        Week {rep.weekNumber} Consolidated Report
                      </Text>
                      <Label
                        text={`COORDINATOR: ${(rep.submittedBy || ccInfo?.facultyName || 'CC').toUpperCase()} • SUBMITTED: ${rep.submittedAt}`}
                        style={styles.ccMetaLabel}
                      />
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

                  {/* 25-Segment Bar */}
                  <View style={styles.segBarWrapper}>
                    <SegBar
                      totalSegments={25}
                      filledSegments={Math.round((rep.overallCoverage / 100) * 25)}
                      isLagging={isLagging}
                    />
                  </View>

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
                      <Text style={styles.viewBtnText}>VIEW REPORT</Text>
                      <Feather name="arrow-right" size={14} color={EditorialColors.white} />
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
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
  reportList: {
    borderTopWidth: EditorialRules.hairline,
    borderTopColor: EditorialColors.ink,
  },
  reportRow: {
    borderBottomWidth: EditorialRules.hairline,
    borderBottomColor: EditorialColors.ink,
    paddingVertical: 16,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
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
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  classBadgeText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 10,
    color: EditorialColors.ink,
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: EditorialColors.ink,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  accentStatusBadge: {
    borderColor: EditorialColors.accent,
  },
  statusText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 9,
    letterSpacing: 1,
    color: EditorialColors.ink,
  },
  accentStatusText: {
    color: EditorialColors.accent,
  },
  reportTitle: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 16,
    lineHeight: 20,
    color: EditorialColors.ink,
    marginBottom: 4,
  },
  ccMetaLabel: {
    letterSpacing: 1.5,
  },
  rightValueBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  percentText: {
    fontFamily: EditorialFonts.display,
    fontSize: 28,
    lineHeight: 32,
    color: EditorialColors.ink,
  },
  accentPercentText: {
    color: EditorialColors.accent,
  },
  segBarWrapper: {
    marginTop: 2,
    marginBottom: 12,
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewBtn: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: EditorialColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewBtnText: {
    fontFamily: EditorialFonts.heavy,
    fontSize: 11,
    letterSpacing: 1.5,
    color: EditorialColors.white,
  },
  emptyContainer: {
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
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
