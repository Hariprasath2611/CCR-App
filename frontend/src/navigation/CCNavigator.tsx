import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CCDashboardScreen } from '@features/cc/screens/CCDashboardScreen';
import { FacultyAllocationScreen } from '@features/cc/screens/FacultyAllocationScreen';
import { ClassProgressScreen } from '@features/cc/screens/ClassProgressScreen';
import { SubjectProgressDetailScreen } from '@features/cc/screens/SubjectProgressDetailScreen';
import { PendingSubmissionsScreen } from '@features/cc/screens/PendingSubmissionsScreen';
import { ConsolidatedReportScreen } from '@features/cc/screens/ConsolidatedReportScreen';
import { SubmitToHODScreen } from '@features/cc/screens/SubmitToHODScreen';
import { ReportExportScreen } from '@features/cc/screens/ReportExportScreen';
import { CCStackParamList } from './types';
import { EditorialColors, EditorialFonts } from '@theme/editorial';

const Stack = createNativeStackNavigator<CCStackParamList>();

export const CCNavigator = () => {
  return (
    <Stack.Navigator
      id="cc-stack"
      screenOptions={{
        headerStyle: { backgroundColor: EditorialColors.bg },
        headerTintColor: EditorialColors.ink,
        headerTitleStyle: {
          fontFamily: EditorialFonts.heavy,
          fontSize: 13,
          letterSpacing: 1.5,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="CCDashboard" 
        component={CCDashboardScreen} 
        options={{ title: 'CC DASHBOARD' }} 
      />
      <Stack.Screen 
        name="FacultyAllocation" 
        component={FacultyAllocationScreen} 
        options={{ title: 'SUBJECT ALLOCATION' }} 
      />

      <Stack.Screen 
        name="ClassProgress" 
        component={ClassProgressScreen} 
        options={{ title: 'CLASS PROGRESS' }} 
      />
      <Stack.Screen 
        name="SubjectProgressDetail" 
        component={SubjectProgressDetailScreen} 
        options={{ title: 'SUBJECT PROGRESS' }} 
      />
      <Stack.Screen 
        name="PendingSubmissions" 
        component={PendingSubmissionsScreen} 
        options={{ title: 'PENDING SUBMISSIONS' }} 
      />
      <Stack.Screen 
        name="ConsolidatedReport" 
        component={ConsolidatedReportScreen} 
        options={{ title: 'CONSOLIDATED REPORT' }} 
      />
      <Stack.Screen 
        name="SubmitToHOD" 
        component={SubmitToHODScreen} 
        options={{ title: 'SUBMIT TO HOD' }} 
      />
      <Stack.Screen 
        name="ReportExport" 
        component={ReportExportScreen} 
        options={{ title: 'EXPORT REPORT' }} 
      />
    </Stack.Navigator>
  );
};
export default CCNavigator;
