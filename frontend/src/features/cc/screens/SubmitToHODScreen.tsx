import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppTextInput } from '@components/common/AppTextInput';
import { AppButton } from '@components/common/AppButton';
import { useReportStore } from '../store/useReportStore';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { CCStackParamList } from '@navigation/types';
import { DayRibbonColors, DayRibbonFonts, DayRibbonShapes, DayRibbonSpacing } from '@theme/dayRibbon';
import { Label } from '@components/editorial/Label';
import { StatTile } from '@components/editorial/StatTile';
import { ms } from '@theme/responsive';

type RouteParams = RouteProp<CCStackParamList, 'SubmitToHOD'>;

const submissionSchema = z.object({
  ccRemarks: z.string().min(5, 'Remarks must be at least 5 characters'),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

export const SubmitToHODScreen = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const compileWeeklyReport = useReportStore((state) => state.compileWeeklyReport);
  const user = useAuthStore((state) => state.user);

  const reportId = route.params?.reportId || 'CSE-B_W13';
  const [classId, weekStr] = reportId.split('_W');
  const weekNumber = parseInt(weekStr) || 13;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      ccRemarks: '',
    },
  });

  const onSubmit = async (data: SubmissionFormData) => {
    setIsSubmitting(true);
    try {
      const ccName = user?.name || 'Class Coordinator';
      await compileWeeklyReport(classId, weekNumber, data.ccRemarks, ccName);

      Alert.alert(
        'Report Submitted',
        `Weekly Consolidated Report for ${classId} Week ${weekNumber} has been submitted to the HOD.`,
        [{ text: 'OK', onPress: () => navigation.getParent()?.goBack() }] // Go back to CC Dashboard
      );
    } catch (err) {
      console.error('Failed to submit report to HOD:', err);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── HEADER ── */}
      <View style={styles.headerBox}>
        <Label text="COORDINATOR FORWARDING" />
        <Text style={styles.headingText}>Submit to HOD</Text>
        <Text style={styles.subHeadingText}>
          Consolidated syllabus audit ready for executive departmental review.
        </Text>
      </View>

      {/* ── METRIC SNAPSHOT ── */}
      <View style={styles.statGrid}>
        <StatTile
          label="Class"
          value={classId}
          style={styles.statTileItem}
        />
        <StatTile
          label="Week"
          value={`W${weekNumber}`}
          style={styles.statTileItem}
        />
        <StatTile
          label="Reviewer"
          value="HOD CSE"
          style={styles.statTileItem}
        />
      </View>

      {/* ── FORM CONTAINER ── */}
      <View style={styles.formBlock}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionNumber}>01</Text>
          <Text style={styles.sectionTitle}>AUDIT REMARKS & OBSERVATIONS</Text>
        </View>

        <Text style={styles.instructionText}>
          Provide executive notes on syllabus pacing, faculty attendance compliance, and recommended compensatory hours for pending units.
        </Text>

        <Controller
          control={control}
          name="ccRemarks"
          render={({ field: { onChange, value } }) => (
            <AppTextInput
              label="Class Coordinator Remarks *"
              value={value}
              onChangeText={onChange}
              error={errors.ccRemarks?.message}
              multiline
              numberOfLines={4}
              placeholder="e.g. All core theory courses are on schedule. Unit 3 completion rate is 82%. Recommending 2 extra hours for CS8501."
              style={styles.textInput}
            />
          )}
        />
      </View>

      <View style={styles.buttonContainer}>
        <AppButton
          mode="contained"
          title="FORWARD REPORT TO HOD"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  content: {
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
    paddingTop: DayRibbonSpacing.topSafeArea,
    paddingBottom: ms(48),
  },
  headerBox: {
    marginBottom: ms(16),
  },
  headingText: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(28),
    lineHeight: ms(34),
    color: DayRibbonColors.ink,
    marginTop: ms(4),
  },
  subHeadingText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(13),
    color: DayRibbonColors.muted,
    lineHeight: 18,
    marginTop: ms(4),
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: ms(16),
  },
  statTileItem: {
    flex: 1,
  },
  formBlock: {
    backgroundColor: DayRibbonColors.surface,
    borderRadius: DayRibbonShapes.cardRadius,
    borderWidth: 1,
    borderColor: DayRibbonColors.line,
    padding: ms(16),
    marginBottom: ms(20),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: DayRibbonColors.line,
    paddingBottom: ms(10),
    marginBottom: ms(12),
  },
  sectionNumber: {
    fontFamily: DayRibbonFonts.display,
    fontSize: ms(18),
    color: DayRibbonColors.cobalt,
    marginRight: ms(8),
  },
  sectionTitle: {
    fontFamily: DayRibbonFonts.body700,
    fontSize: ms(13),
    letterSpacing: 1,
    color: DayRibbonColors.ink,
  },
  instructionText: {
    fontFamily: DayRibbonFonts.body500,
    fontSize: ms(12),
    lineHeight: ms(18),
    color: DayRibbonColors.muted,
    marginBottom: ms(16),
  },
  textInput: {
    marginTop: ms(4),
  },
  buttonContainer: {
    marginTop: ms(8),
    marginBottom: ms(24),
  },
});
