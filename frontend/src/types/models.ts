export type UserRole = 'STAFF' | 'HOD' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isClassCoordinator: boolean;
  departmentId: string;
  department: string;
  assignedClassId?: string;       // e.g. 'CSE-B' — set for staff/CC users
  assignedSubjectCodes?: string[]; // e.g. ['CS8501', 'CS8502']
  profilePhotoUrl?: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch milliseconds
}

// ── Academic Structure ────────────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  code: string;
  hodId: string;
  createdAt: string;
}

export interface AcademicClass {
  id: string;
  name: string;           // e.g. "III CSE-B"
  section: string;        // e.g. "B"
  year: number;           // 1 | 2 | 3 | 4
  semester: number;       // 1–8
  departmentId: string;
  classCoordinatorId?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  classId: string;
  staffId: string;
  totalPeriods: number;
  completedPeriods: number;
  completionPercent: number;
}

export interface FacultyAssignment {
  id: string;
  staffId: string;
  subjectCode: string;
  subjectName: string;
  classId: string;
  semester: number;
}

// ── Timetable ─────────────────────────────────────────────────────────────────

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';

export interface TimetableEntry {
  id: string;
  dayOfWeek: DayOfWeek;
  period: number;
  subjectCode: string;
  subjectName: string;
  classSection: string;
  roomNo: string;
  startTime: string;
  endTime: string;
}

// ── Syllabus ──────────────────────────────────────────────────────────────────

export interface Topic {
  id: string;
  unitId: string;
  title: string;
  estimatedPeriods: number;
  isCompleted: boolean;
  completedDate?: string;
}

export interface Unit {
  id: string;
  subjectCode: string;
  unitNumber: number;
  title: string;
  topics: Topic[];
}

export interface Syllabus {
  subjectCode: string;
  units: Unit[];
}

// ── Weekly Plan ───────────────────────────────────────────────────────────────

export type PlanStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RETURNED';

export type SyncStatus = 'LOCAL' | 'SYNCED' | 'FAILED';

export interface WeeklyPlan {
  id: string;
  staffId: string;
  subjectCode: string;
  classId: string;
  academicWeekNumber: number;
  weekStartDate: string;
  weekEndDate: string;
  targetTopicIds: string[];
  targetTopics?: Topic[];
  status: PlanStatus;
  submittedAt?: string;
  isDraft: boolean;
  syncStatus: SyncStatus;
}

// ── Weekly Progress ───────────────────────────────────────────────────────────

export type ProgressStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'APPROVED';

export interface WeeklyProgress {
  id: string;
  staffId: string;
  subjectCode: string;
  classId: string;
  academicWeekNumber: number;
  weekStartDate: string;
  weekEndDate: string;
  plannedTopicIds: string[];
  actualTopicIds: string[];
  completionPercent: number;
  remarks?: string;
  pendingTopicIds: string[];
  status: ProgressStatus;
  submittedAt?: string;
  syncStatus: SyncStatus;
}

// ── Extra Hour Request ────────────────────────────────────────────────────────

export type ExtraHourStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ExtraHourRequest {
  id: string;
  staffId: string;
  subjectCode: string;
  classId: string;
  pendingTopicIds: string[];
  reason: string;
  proposedDates: string[]; // dates proposed by faculty
  periodsRequested: number;
  status: ExtraHourStatus;
  hodRemarks?: string;
  submittedAt: string;
  syncStatus: SyncStatus;
}

// ── CC Report ─────────────────────────────────────────────────────────────────

export type CCReportStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RETURNED';

export interface SubjectSummary {
  subjectCode: string;
  subjectName: string;
  staffName: string;
  completionPercent: number;
  progressStatus: ProgressStatus;
  weeklyProgressId?: string;
}

export interface CCWeeklyReport {
  id: string;
  ccId: string;
  classId: string;
  academicWeekNumber: number;
  weekStartDate: string;
  weekEndDate: string;
  subjectSummaries: SubjectSummary[];
  pendingSubjectCodes: string[];
  ccRemarks: string;
  status: CCReportStatus;
  submittedAt?: string;
  hodRemarks?: string;
  syncStatus: SyncStatus;
}

// ── Approval ──────────────────────────────────────────────────────────────────

export type ApprovalItemType = 'WEEKLY_PLAN' | 'WEEKLY_PROGRESS' | 'CC_REPORT' | 'EXTRA_HOURS';
export type ApprovalAction = 'APPROVED' | 'REJECTED' | 'RETURNED';

export interface Approval {
  id: string;
  itemId: string;
  itemType: ApprovalItemType;
  reviewerId: string;
  action: ApprovalAction;
  remarks?: string;
  actionedAt: string;
}

// ── Notification ──────────────────────────────────────────────────────────────

export type NotificationCategory =
  | 'PLAN_APPROVED'
  | 'PLAN_RETURNED'
  | 'PROGRESS_REMINDER'
  | 'EXTRA_HOURS_APPROVED'
  | 'EXTRA_HOURS_REJECTED'
  | 'HOD_PENDING_ALERT'
  | 'DEPT_COMPLETION_ALERT';

export interface Notification {
  id: string;
  userId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

// ── Sync ──────────────────────────────────────────────────────────────────────

export type SyncActionType = 'CREATE_PLAN' | 'SUBMIT_PROGRESS' | 'REQUEST_EXTRA_HOURS' | 'SUBMIT_CC_REPORT';

export interface SyncQueueItem {
  id: string;
  actionType: SyncActionType;
  payload: string; // JSON stringified
  createdAt: number;
  retryCount: number;
  status: 'PENDING' | 'PROCESSING' | 'FAILED';
}

// ── Dashboard / Analytics ─────────────────────────────────────────────────────

export interface StaffDashboardSummary {
  todayPeriods: TimetableEntry[];
  activeWeekPlan?: WeeklyPlan;
  weekProgressPercent: number;
  pendingExtraHoursCount: number;
  unreadNotificationCount: number;
}

export interface HodDashboardSummary {
  pendingReportsCount: number;
  pendingExtraHoursCount: number;
  deptSyllabusPercent: number;
  classCount: number;
}

export interface AdminDashboardSummary {
  departmentCount: number;
  institutionSyllabusPercent: number;
  activeWeekNumber: number;
  totalPendingReports: number;
}

export interface DeptAnalytics {
  classId: string;
  className: string;
  overallPercent: number;
  weeklyTrend: { weekNumber: number; percent: number }[];
  subjectBreakdown: { subjectCode: string; subjectName: string; percent: number }[];
}
