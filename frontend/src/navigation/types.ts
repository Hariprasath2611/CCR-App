export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  ForgotPassword: { email?: string } | undefined;
};

export type StaffStackParamList = {
  StaffDashboard: undefined;
  WeeklyTimetable: undefined;
  AssignedSubjects: undefined;
  SubjectDetail: { subjectCode: string };
  WeeklyPlanForm: { editId?: string } | undefined;
  WeeklyProgress: { subjectCode: string; weekNumber: number };
  ExtraHoursRequest: undefined;
  ReportHistory: undefined;
  ApprovalStatus: undefined;
  StaffProfile: undefined;
  // HOD routes
  HodDashboard: undefined;
  DepartmentClasses: undefined;
  FacultyProgress: { classId?: string } | undefined;
  SubjectReports: undefined;
  CCReports: undefined;
  RequestDetails: { requestId: string; requestType: 'PLAN' | 'PROGRESS' | 'CC_REPORT' | 'EXTRA_HOURS' };
  ApprovalScreen: undefined;
  ExtraHourRequests: undefined;
  DeptAnalytics: undefined;
  HodProfile: undefined;
  // CC routes
  CCDashboard: undefined;
  ClassProgress: { classId: string };
  SubjectProgressDetail: { progressId: string };
  PendingSubmissions: { classId: string };
  ConsolidatedReport: { classId: string; weekNumber: number };
  SubmitToHOD: { reportId: string };
  ReportExport: { reportId: string };
};

export type CCStackParamList = {
  CCDashboard: undefined;
  ClassProgress: { classId: string };
  SubjectProgressDetail: { progressId: string };
  PendingSubmissions: { classId: string };
  ConsolidatedReport: { classId: string; weekNumber: number };
  SubmitToHOD: { reportId: string };
  ReportExport: { reportId: string };
};

export type HodStackParamList = {
  HodDashboard: undefined;
  DepartmentClasses: undefined;
  FacultyProgress: { classId?: string } | undefined;
  SubjectReports: undefined;
  CCReports: undefined;
  RequestDetails: { requestId: string; requestType: 'PLAN' | 'PROGRESS' | 'CC_REPORT' | 'EXTRA_HOURS' };
  ApprovalScreen: undefined;
  ExtraHourRequests: undefined;
  DeptAnalytics: undefined;
  HodProfile: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  DeptSummary: { departmentId: string };
  WeeklyReports: undefined;
  InstitutionAnalytics: undefined;
  FacultyAnalytics: undefined;
  ReportExport: { scope: 'ADMIN'; departmentId?: string } | undefined;
  AdminProfile: undefined;
};

export type SharedStackParamList = {
  Notifications: undefined;
};
