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
import { EditorialColors, EditorialFonts, EditorialSpacing } from '@theme/editorial';
import { Rule } from '@components/editorial/Rule';
import { Label } from '@components/editorial/Label';
import { StatRow } from '@components/editorial/StatRow';
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
        <Text style={styles.headingText}>SUBMIT TO HOD.</Text>
        <Text style={styles.subHeadingText}>
          CONSOLIDATED SYLLABUS AUDIT READY FOR EXECUTIVE DEPARTMENTAL REVIEW
        </Text>
      </View>
      <Rule thick style={styles.heroRule} />

      {/* ── METRIC SNAPSHOT ── */}
      <View style={styles.statBox}>
        <StatRow
          columns={[
            { label: 'CLASS', value: classId },
            { label: 'ACADEMIC WEEK', value: `W${weekNumber}` },
            { label: 'REVIEWER', value: 'HOD CSE' },
          ]}
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
    backgroundColor: EditorialColors.bg,
  },
  content: {
    paddingHorizontal: EditorialSpacing.screenHorizontal,
    paddingTop: EditorialSpacing.topSafeArea,
    paddingBottom: ms(48),
  },
  headerBox: {
    marginBottom: ms(8),
  },
  headingText: {
    fontFamily: EditorialFonts.display,
    fontSize: ms(24),
    lineHeight: ms(28),
    color: EditorialColors.ink,
    marginTop: ms(4),
  },
  subHeadingText: {
    fontFamily: EditorialFonts.semibold,
    fontSize: ms(11),
    color: EditorialColors.muted,
    letterSpacing: 0.5,
    marginTop: ms(4),
  },
  heroRule: {
    marginBottom: ms(20),
  },
  statBox: {
    marginBottom: ms(20),
  },
  formBlock: {
    backgroundColor: EditorialColors.white,
    borderWidth: 1.5,
    borderColor: EditorialColors.ink,
    padding: ms(16),
    marginBottom: ms(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderBottomWidth: 1,
    borderBottomColor: EditorialColors.ink,
    paddingBottom: ms(8),
    marginBottom: ms(12),
  },
  sectionNumber: {
    fontFamily: EditorialFonts.display,
    fontSize: ms(18),
    color: EditorialColors.accent,
    marginRight: ms(8),
  },
  sectionTitle: {
    fontFamily: EditorialFonts.bold,
    fontSize: ms(13),
    letterSpacing: 1,
    color: EditorialColors.ink,
  },
  instructionText: {
    fontFamily: EditorialFonts.regular,
    fontSize: ms(12),
    lineHeight: ms(18),
    color: EditorialColors.muted,
    marginBottom: ms(16),
  },
  textInput: {
    marginTop: ms(8),
  },
  buttonContainer: {
    marginTop: ms(8),
  },
});

