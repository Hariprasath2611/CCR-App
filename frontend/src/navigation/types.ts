export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: { email?: string } | undefined;
};

export type StaffStackParamList = {
  StaffDashboard: undefined;
  WeeklyPlanForm: { editId?: string } | undefined;
  ProgressLog: { subjectCode: string } | undefined;
  ExtraHoursRequest: undefined;
  CCDashboard?: undefined;
  ReviewStaffSubmissions?: { sectionId: string };
  ReportExporter?: undefined;
};

export type HodStackParamList = {
  HodDashboard: undefined;
  RequestDetails: { requestId: string; requestType: 'PLAN' | 'EXTRA_HOURS' };
  AnalyticsDashboard: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  InstitutionAnalytics: undefined;
};
