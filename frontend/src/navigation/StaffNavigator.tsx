import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { EditorialColors, EditorialFonts } from '@theme/editorial';
import { EditorialTabBar } from '@components/editorial/EditorialTabBar';

// Screens
import { StaffDashboardScreen } from '@features/staff/screens/StaffDashboardScreen';
import { WeeklyTimetableScreen } from '@features/staff/screens/WeeklyTimetableScreen';
import { AssignedSubjectsScreen } from '@features/staff/screens/AssignedSubjectsScreen';
import { SubjectDetailScreen } from '@features/staff/screens/SubjectDetailScreen';
import { WeeklyPlanFormScreen } from '@features/staff/screens/WeeklyPlanFormScreen';
import { WeeklyProgressScreen } from '@features/staff/screens/WeeklyProgressScreen';
import { ExtraHoursRequestScreen } from '@features/staff/screens/ExtraHoursRequestScreen';
import { ReportHistoryScreen } from '@features/staff/screens/ReportHistoryScreen';
import { ApprovalStatusScreen } from '@features/staff/screens/ApprovalStatusScreen';
import { StaffProfileScreen } from '@features/staff/screens/StaffProfileScreen';
import { NotificationsScreen } from '@features/notifications/screens/NotificationsScreen';

// HOD Screens
import { HodDashboardScreen } from '@features/hod/screens/HodDashboardScreen';
import { DepartmentClassesScreen } from '@features/hod/screens/DepartmentClassesScreen';
import { ManageCoordinatorsScreen } from '@features/hod/screens/ManageCoordinatorsScreen';
import { FacultyProgressScreen } from '@features/hod/screens/FacultyProgressScreen';
import { SubjectReportsScreen } from '@features/hod/screens/SubjectReportsScreen';
import { CCReportsScreen } from '@features/hod/screens/CCReportsScreen';
import { RequestDetailsScreen } from '@features/hod/screens/RequestDetailsScreen';
import { ApprovalScreen } from '@features/hod/screens/ApprovalScreen';
import { ExtraHourRequestsScreen } from '@features/hod/screens/ExtraHourRequestsScreen';
import { DeptAnalyticsScreen } from '@features/hod/screens/DeptAnalyticsScreen';
import { HodProfileScreen } from '@features/hod/screens/HodProfileScreen';

// CC Screens
import { CCDashboardScreen } from '@features/cc/screens/CCDashboardScreen';
import { FacultyAllocationScreen } from '@features/cc/screens/FacultyAllocationScreen';
import { ClassProgressScreen } from '@features/cc/screens/ClassProgressScreen';
import { SubjectProgressDetailScreen } from '@features/cc/screens/SubjectProgressDetailScreen';
import { PendingSubmissionsScreen } from '@features/cc/screens/PendingSubmissionsScreen';
import { ConsolidatedReportScreen } from '@features/cc/screens/ConsolidatedReportScreen';
import { SubmitToHODScreen } from '@features/cc/screens/SubmitToHODScreen';
import { ReportExportScreen } from '@features/cc/screens/ReportExportScreen';

// Types
import { StaffStackParamList } from './types';

const Stack = createNativeStackNavigator<StaffStackParamList>();
const Tab = createBottomTabNavigator();

const StaffStackNavigator = () => {
  return (
    <Stack.Navigator
      id="staff-stack"
      screenOptions={{
        headerStyle: { backgroundColor: EditorialColors.bg },
        headerTintColor: EditorialColors.ink,
        headerTitleStyle: {
          fontFamily: EditorialFonts.heavy,
          fontSize: 13,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="StaffDashboard"
        component={StaffDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WeeklyTimetable"
        component={WeeklyTimetableScreen}
        options={{ title: 'TIMETABLE' }}
      />
      <Stack.Screen
        name="AssignedSubjects"
        component={AssignedSubjectsScreen}
        options={{ title: 'SUBJECTS' }}
      />
      <Stack.Screen
        name="SubjectDetail"
        component={SubjectDetailScreen}
        options={{ title: 'SYLLABUS DETAILS' }}
      />
      <Stack.Screen
        name="WeeklyPlanForm"
        component={WeeklyPlanFormScreen}
        options={{ title: 'TEACHING PLAN' }}
      />
      <Stack.Screen
        name="WeeklyProgress"
        component={WeeklyProgressScreen}
        options={{ title: 'LOG PROGRESS' }}
      />
      <Stack.Screen
        name="ExtraHoursRequest"
        component={ExtraHoursRequestScreen}
        options={{ title: 'REQUEST EXTRA HOURS' }}
      />
      <Stack.Screen
        name="ReportHistory"
        component={ReportHistoryScreen}
        options={{ title: 'REPORT HISTORY' }}
      />
      <Stack.Screen
        name="ApprovalStatus"
        component={ApprovalStatusScreen}
        options={{ title: 'APPROVALS TRACKER' }}
      />
      <Stack.Screen
        name="StaffProfile"
        component={StaffProfileScreen}
        options={{ title: 'PROFILE' }}
      />
      
      {/* HOD Screens integrated in the same stack */}
      <Stack.Screen
        name="HodDashboard"
        component={HodDashboardScreen}
        options={{ title: 'HOD DASHBOARD' }}
      />
      <Stack.Screen
        name="DepartmentClasses"
        component={DepartmentClassesScreen}
        options={{ title: 'CLASSES' }}
      />
      <Stack.Screen
        name="ManageCoordinators"
        component={ManageCoordinatorsScreen}
        options={{ title: 'CLASS COORDINATORS' }}
      />
      <Stack.Screen
        name="FacultyProgress"
        component={FacultyProgressScreen}
        options={{ title: 'FACULTY PROGRESS' }}
      />
      <Stack.Screen
        name="SubjectReports"
        component={SubjectReportsScreen}
        options={{ title: 'SUBJECT REPORTS' }}
      />
      <Stack.Screen
        name="CCReports"
        component={CCReportsScreen}
        options={{ title: 'CC CLASS REPORTS' }}
      />
      <Stack.Screen
        name="RequestDetails"
        component={RequestDetailsScreen}
        options={{ title: 'REQUEST DETAILS' }}
      />
      <Stack.Screen
        name="ApprovalScreen"
        component={ApprovalScreen}
        options={{ title: 'APPROVAL QUEUE' }}
      />
      <Stack.Screen
        name="ExtraHourRequests"
        component={ExtraHourRequestsScreen}
        options={{ title: 'EXTRA HOUR REQUESTS' }}
      />
      <Stack.Screen
        name="DeptAnalytics"
        component={DeptAnalyticsScreen}
        options={{ title: 'ANALYTICS' }}
      />
      <Stack.Screen
        name="HodProfile"
        component={HodProfileScreen}
        options={{ title: 'HOD PROFILE' }}
      />

      {/* CC Screens integrated in the same stack */}
      <Stack.Screen 
        name="CCDashboard" 
        component={CCDashboardScreen} 
        options={{ title: 'CLASS COORDINATOR' }} 
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

export const StaffTabNavigator = () => {
  const { user } = useAuthStore();
  const ProfileScreenComponent = user?.role === 'HOD' ? HodProfileScreen : StaffProfileScreen;

  return (
    <Tab.Navigator
      id="staff-tab"
      tabBar={(props) => <EditorialTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="StaffHome"
        component={StaffStackNavigator}
        options={{ title: 'FACULTY' }}
      />
      {(user?.isClassCoordinator || user?.role === 'HOD' || user?.role === 'ADMIN') && (
        <Tab.Screen
          name="CounselorTab"
          component={CCDashboardScreen}
          options={{ title: 'CC BOARD' }}
        />
      )}
      {user?.role === 'HOD' && (
        <Tab.Screen
          name="HodTab"
          component={HodDashboardScreen}
          options={{ title: 'HOD BOARD' }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreenComponent}
        options={{ title: 'PROFILE' }}
      />
    </Tab.Navigator>
  );
};

export default StaffTabNavigator;
