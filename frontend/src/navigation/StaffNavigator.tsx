import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
import { ClassProgressScreen } from '@features/cc/screens/ClassProgressScreen';
import { SubjectProgressDetailScreen } from '@features/cc/screens/SubjectProgressDetailScreen';
import { PendingSubmissionsScreen } from '@features/cc/screens/PendingSubmissionsScreen';
import { ConsolidatedReportScreen } from '@features/cc/screens/ConsolidatedReportScreen';
import { SubmitToHODScreen } from '@features/cc/screens/SubmitToHODScreen';
import { ReportExportScreen } from '@features/cc/screens/ReportExportScreen';

// Navigators
import { CCNavigator } from './CCNavigator';

// Types
import { StaffStackParamList } from './types';
import { Palette } from '@theme/colors';

const Stack = createNativeStackNavigator<StaffStackParamList>();
const Tab = createBottomTabNavigator();

const StaffStackNavigator = () => {
  return (
    <Stack.Navigator
      id="staff-stack"
      screenOptions={{
        headerStyle: { backgroundColor: Palette.primary },
        headerTintColor: Palette.surface,
        headerTitleStyle: { fontWeight: 'bold' },
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
        options={{ title: 'Timetable' }}
      />
      <Stack.Screen
        name="AssignedSubjects"
        component={AssignedSubjectsScreen}
        options={{ title: 'Subjects' }}
      />
      <Stack.Screen
        name="SubjectDetail"
        component={SubjectDetailScreen}
        options={{ title: 'Syllabus Details' }}
      />
      <Stack.Screen
        name="WeeklyPlanForm"
        component={WeeklyPlanFormScreen}
        options={{ title: 'Weekly Teaching Plan' }}
      />
      <Stack.Screen
        name="WeeklyProgress"
        component={WeeklyProgressScreen}
        options={{ title: 'Log Progress' }}
      />
      <Stack.Screen
        name="ExtraHoursRequest"
        component={ExtraHoursRequestScreen}
        options={{ title: 'Request Extra Hours' }}
      />
      <Stack.Screen
        name="ReportHistory"
        component={ReportHistoryScreen}
        options={{ title: 'Report History' }}
      />
      <Stack.Screen
        name="ApprovalStatus"
        component={ApprovalStatusScreen}
        options={{ title: 'Approvals Tracker' }}
      />
      <Stack.Screen
        name="StaffProfile"
        component={StaffProfileScreen}
        options={{ title: 'Profile' }}
      />
      
      {/* HOD Screens integrated in the same stack */}
      <Stack.Screen
        name="HodDashboard"
        component={HodDashboardScreen}
        options={{ title: 'HOD Dashboard' }}
      />
      <Stack.Screen
        name="DepartmentClasses"
        component={DepartmentClassesScreen}
        options={{ title: 'Classes' }}
      />
      <Stack.Screen
        name="FacultyProgress"
        component={FacultyProgressScreen}
        options={{ title: 'Faculty Progress' }}
      />
      <Stack.Screen
        name="SubjectReports"
        component={SubjectReportsScreen}
        options={{ title: 'Subject Reports' }}
      />
      <Stack.Screen
        name="CCReports"
        component={CCReportsScreen}
        options={{ title: 'CC Class Reports' }}
      />
      <Stack.Screen
        name="RequestDetails"
        component={RequestDetailsScreen}
        options={{ title: 'Request Details' }}
      />
      <Stack.Screen
        name="ApprovalScreen"
        component={ApprovalScreen}
        options={{ title: 'Approval Queue' }}
      />
      <Stack.Screen
        name="ExtraHourRequests"
        component={ExtraHourRequestsScreen}
        options={{ title: 'Extra Hour Requests' }}
      />
      <Stack.Screen
        name="DeptAnalytics"
        component={DeptAnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
      <Stack.Screen
        name="HodProfile"
        component={HodProfileScreen}
        options={{ title: 'HOD Profile' }}
      />

      {/* CC Screens integrated in the same stack */}
      <Stack.Screen 
        name="CCDashboard" 
        component={CCDashboardScreen} 
        options={{ title: 'Class Counselor Dashboard' }} 
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

export const StaffTabNavigator = () => {
  const { user } = useAuthStore();
  const ProfileScreenComponent = user?.role === 'HOD' ? HodProfileScreen : StaffProfileScreen;

  return (
    <Tab.Navigator
      id="staff-tab"
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: Palette.primary },
        headerTintColor: Palette.surface,
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.textLight,
        tabBarStyle: { backgroundColor: Palette.surface },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'help-circle';
          if (route.name === 'StaffHome') {
            iconName = 'home';
          } else if (route.name === 'CounselorTab') {
            iconName = 'shield-account';
          } else if (route.name === 'HodTab') {
            iconName = 'shield-star';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }
          return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="StaffHome"
        component={StaffStackNavigator}
        options={{ title: 'Home', headerShown: false }}
      />
      {user?.isClassCoordinator && (
        <Tab.Screen
          name="CounselorTab"
          component={CCDashboardScreen}
          options={{ title: 'Counselor', headerTitle: 'Class Counselor Dashboard' }}
        />
      )}
      {user?.role === 'HOD' && (
        <Tab.Screen
          name="HodTab"
          component={HodDashboardScreen}
          options={{ title: 'HOD Board', headerTitle: 'HOD Dashboard' }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreenComponent}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default StaffTabNavigator;
