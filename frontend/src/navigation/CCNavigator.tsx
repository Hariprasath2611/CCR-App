import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CCDashboardScreen } from '@features/cc/screens/CCDashboardScreen';
import { ClassProgressScreen } from '@features/cc/screens/ClassProgressScreen';
import { SubjectProgressDetailScreen } from '@features/cc/screens/SubjectProgressDetailScreen';
import { PendingSubmissionsScreen } from '@features/cc/screens/PendingSubmissionsScreen';
import { ConsolidatedReportScreen } from '@features/cc/screens/ConsolidatedReportScreen';
import { SubmitToHODScreen } from '@features/cc/screens/SubmitToHODScreen';
import { ReportExportScreen } from '@features/cc/screens/ReportExportScreen';
import { CCStackParamList } from './types';
import { Palette } from '@theme/colors';

const Stack = createNativeStackNavigator<CCStackParamList>();

export const CCNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Palette.primary },
        headerTintColor: Palette.surface,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="CCDashboard" 
        component={CCDashboardScreen} 
        options={{ title: 'CC Dashboard' }} 
      />
      <Stack.Screen 
        name="ClassProgress" 
        component={ClassProgressScreen} 
        options={{ title: 'Class Progress' }} 
      />
      <Stack.Screen 
        name="SubjectProgressDetail" 
        component={SubjectProgressDetailScreen} 
        options={{ title: 'Subject Progress' }} 
      />
      <Stack.Screen 
        name="PendingSubmissions" 
        component={PendingSubmissionsScreen} 
        options={{ title: 'Pending Submissions' }} 
      />
      <Stack.Screen 
        name="ConsolidatedReport" 
        component={ConsolidatedReportScreen} 
        options={{ title: 'Consolidated Report' }} 
      />
      <Stack.Screen 
        name="SubmitToHOD" 
        component={SubmitToHODScreen} 
        options={{ title: 'Submit to HOD' }} 
      />
      <Stack.Screen 
        name="ReportExport" 
        component={ReportExportScreen} 
        options={{ title: 'Export Report' }} 
      />
    </Stack.Navigator>
  );
};
export default CCNavigator;
