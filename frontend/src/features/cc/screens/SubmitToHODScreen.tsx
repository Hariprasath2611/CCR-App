import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppTextInput } from '@components/common/AppTextInput';
import { AppButton } from '@components/common/AppButton';
import { useReportStore } from '../store/useReportStore';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { CCStackParamList } from '@navigation/types';
import { Palette } from '@theme/colors';
import { Feather } from '@expo/vector-icons';

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
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.iconHeader}>
            <Feather name="send" size={32} color={Palette.primary} />
          </View>
          <Text style={styles.title}>Submit Report to HOD</Text>
          <Text style={styles.subtitle}>
            Submit the Week {weekNumber} consolidated syllabus completion audit for class {classId} to the HOD for review.
          </Text>

          <DividerHorizontal />

          <Controller
            control={control}
            name="ccRemarks"
            render={({ field: { onChange, value } }) => (
              <AppTextInput
                label="Class Coordinator Remarks"
                value={value}
                onChangeText={onChange}
                error={errors.ccRemarks?.message}
                multiline
                numberOfLines={4}
                style={styles.textInput}
              />
            )}
          />

          <AppButton
            mode="contained"
            title="Submit to HOD"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={styles.submitBtn}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const DividerHorizontal = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: ms(16),
    paddingBottom: ms(32),
    justifyContent: 'center',
    flexGrow: 1,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: ms(12),
    padding: ms(8),
    elevation: 2,
  },
  iconHeader: {
    alignItems: 'center',
    marginVertical: ms(12),
  },
  title: {
    fontSize: ms(20),
    fontWeight: 'bold',
    color: Palette.textDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: ms(13),
    color: Palette.textLight,
    textAlign: 'center',
    marginTop: ms(6),
    lineHeight: 18,
    paddingHorizontal: ms(8),
  },
  divider: {
    height: ms(1),
    backgroundColor: Palette.border,
    marginVertical: ms(20),
  },
  textInput: {
    marginTop: ms(8),
  },
  submitBtn: {
    marginTop: ms(20),
    backgroundColor: Palette.primary,
  },
});
