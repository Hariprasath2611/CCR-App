import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Button, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useReportStore, ConsolidatedReport } from '@features/cc/store/useReportStore';
import { Palette } from '@theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { getCCForSection } from '@config/facultyBoard';
import { ms } from '@theme/responsive';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const CCReportsScreen = () => {
  const navigation = useNavigation<any>();
  const reports = useReportStore((state) => state.reports);

  const [selectedYear, setSelectedYear] = useState('1st Year');

  // Filter reports by selected year
  const yearReports = reports.filter((r) => r.classId.includes(selectedYear));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED_BY_HOD':
      case 'SENT_TO_ADMIN':
        return { label: 'APPROVED', color: Palette.success, bg: '#ECFDF5' };
      case 'SUBMITTED_TO_HOD':
        return { label: 'PENDING AUDIT', color: Palette.warning, bg: '#FFFBEB' };
      case 'RETURNED_BY_HOD':
        return { label: 'RETURNED', color: Palette.error, bg: '#FEF2F2' };
      default:
        return { label: 'DRAFT', color: Palette.textLight, bg: '#F8FAFC' };
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Class Coordinator Reports</Text>
        <Text style={styles.headerSub}>
          Weekly consolidated course coverage spreadsheets submitted by section coordinators.
        </Text>
      </View>

      {/* Year Filter Pills */}
      <View style={styles.yearsRow}>
        {YEARS.map((yr) => {
          const isSelected = selectedYear === yr;
          return (
            <TouchableOpacity
              key={yr}
              onPress={() => setSelectedYear(yr)}
              style={[styles.yearChip, isSelected && styles.yearChipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.yearText, isSelected && styles.yearTextActive]}>
                {yr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Reports List */}
      {yearReports.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <MaterialCommunityIcons name="folder-text-outline" size={56} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Submissions for {selectedYear}</Text>
            <Text style={styles.emptySub}>
              Coordinators have not submitted weekly reports for this academic year yet.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        yearReports.map((rep) => {
          const badge = getStatusBadge(rep.status);
          const ccInfo = getCCForSection(rep.classId);

          return (
            <Card key={rep.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.classPill}>
                    <Text style={styles.classPillText}>{rep.classId}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusText, { color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.reportTitle}>Week {rep.weekNumber} Consolidated Report</Text>
                <Text style={styles.ccName}>
                  Coordinator: <Text style={{ fontWeight: '700', color: Palette.textDark }}>{rep.submittedBy || ccInfo?.facultyName}</Text>
                </Text>

                <View style={styles.coverageRow}>
                  <Text style={styles.coverageLabel}>Class Syllabus Coverage:</Text>
                  <Text style={styles.coverageVal}>{rep.overallCoverage}%</Text>
                </View>

                <ProgressBar
                  progress={rep.overallCoverage / 100}
                  color={rep.overallCoverage >= 75 ? Palette.primary : Palette.warning}
                  style={styles.progressBar}
                />

                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>Submitted: {rep.submittedAt}</Text>
                  <Button
                    mode="contained-tonal"
                    compact
                    icon="eye"
                    style={styles.viewBtn}
                    onPress={() =>
                      navigation.navigate('RequestDetails', {
                        requestId: rep.id,
                        requestType: 'CC_REPORT',
                      })
                    }
                  >
                    View Report
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
  header: {
    marginBottom: ms(16),
  },
  headerTitle: {
    fontSize: ms(20),
    fontWeight: '900',
    color: Palette.textDark,
  },
  headerSub: {
    fontSize: ms(12.5),
    color: Palette.textLight,
    marginTop: ms(2),
    lineHeight: ms(18),
  },
  yearsRow: {
    flexDirection: 'row',
    marginBottom: ms(16),
  },
  yearChip: {
    paddingVertical: ms(6),
    paddingHorizontal: ms(14),
    borderRadius: ms(20),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: ms(8),
  },
  yearChipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  yearText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: Palette.textLight,
  },
  yearTextActive: {
    color: '#FFFFFF',
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(16),
    marginBottom: ms(14),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(8),
  },
  classPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: ms(10),
    paddingVertical: ms(3),
    borderRadius: ms(6),
  },
  classPillText: {
    fontSize: ms(12),
    fontWeight: '800',
    color: Palette.primary,
  },
  statusBadge: {
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(6),
  },
  statusText: {
    fontSize: ms(10.5),
    fontWeight: '800',
  },
  reportTitle: {
    fontSize: ms(15),
    fontWeight: '800',
    color: Palette.textDark,
  },
  ccName: {
    fontSize: ms(12.5),
    color: Palette.textLight,
    marginTop: ms(2),
  },
  coverageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: ms(10),
    marginBottom: ms(4),
  },
  coverageLabel: {
    fontSize: ms(12),
    color: Palette.textLight,
    fontWeight: '600',
  },
  coverageVal: {
    fontSize: ms(13),
    fontWeight: '800',
    color: Palette.primary,
  },
  progressBar: {
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: '#E2E8F0',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: ms(12),
    paddingTop: ms(8),
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  dateText: {
    fontSize: ms(11.5),
    color: '#94A3B8',
  },
  viewBtn: {
    borderRadius: ms(8),
  },
});

export default CCReportsScreen;
