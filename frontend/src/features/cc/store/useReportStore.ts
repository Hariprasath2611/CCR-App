import { create } from 'zustand';
import { apiClient } from '@services/api/apiClient';

export interface SubjectProgress {
  code: string;
  name: string;
  faculty: string;
  coverage: number; // Percentage, e.g. 80
  status: 'Pending' | 'Submitted';
  completedTopicsCount: number;
  totalTopicsCount: number;
  reasonsForPending?: string;
  extraHoursRequested?: boolean;
}

export interface ConsolidatedReport {
  id: string;
  classId: string; // e.g. 'CSE-B'
  weekNumber: number;
  overallCoverage: number; // Average of subjects, e.g. 71
  submittedBy: string;
  submittedAt: string;
  ccRemarks: string;
  status: 'PENDING_CC' | 'SUBMITTED_TO_HOD' | 'APPROVED_BY_HOD' | 'SENT_TO_ADMIN' | 'REJECTED_BY_HOD' | 'RETURNED_BY_HOD';
  subjects: SubjectProgress[];
  hodRemarks?: string;
  approvedAt?: string;
}

interface ReportStoreState {
  reports: ConsolidatedReport[];
  subjectProgressList: Record<string, SubjectProgress[]>; // Keyed by classId_weekNumber
  fetchReports: () => Promise<void>;
  fetchWeeklyProgress: (classId: string, weekNumber: number) => Promise<void>;
  addProgressLog: (
    classId: string,
    weekNumber: number,
    subjectCode: string,
    completedTopics: number,
    totalTopics: number,
    reasonsForPending?: string,
    extraHoursRequested?: boolean
  ) => void;
  compileWeeklyReport: (classId: string, weekNumber: number, ccRemarks: string, ccName: string) => Promise<string>;
  submitHODDecision: (reportId: string, decision: 'APPROVED' | 'RETURNED' | 'REJECTED', remarks: string) => Promise<void>;
  getReportById: (reportId: string) => ConsolidatedReport | undefined;
}

const INITIAL_SUBJECTS_PROGRESS: Record<string, SubjectProgress[]> = {
  'CSE-B_11': [
    { code: 'CS8501', name: 'Theory of Computation', faculty: 'Dr. Meena Kumari', coverage: 70, status: 'Submitted', completedTopicsCount: 7, totalTopicsCount: 10 },
    { code: 'CS8502', name: 'Database Systems', faculty: 'Prof. Karthick D', coverage: 55, status: 'Submitted', completedTopicsCount: 5, totalTopicsCount: 9 },
    { code: 'CS8503', name: 'Computer Networks', faculty: 'Prof. Rajesh K', coverage: 60, status: 'Submitted', completedTopicsCount: 6, totalTopicsCount: 10 },
    { code: 'CS8504', name: 'OS Principles', faculty: 'Dr. Anita S', coverage: 58, status: 'Submitted', completedTopicsCount: 5, totalTopicsCount: 8 },
  ],
  'CSE-B_12': [
    { code: 'CS8501', name: 'Theory of Computation', faculty: 'Dr. Meena Kumari', coverage: 80, status: 'Submitted', completedTopicsCount: 8, totalTopicsCount: 10 },
    { code: 'CS8502', name: 'Database Systems', faculty: 'Prof. Karthick D', coverage: 65, status: 'Submitted', completedTopicsCount: 6, totalTopicsCount: 9 },
    { code: 'CS8503', name: 'Computer Networks', faculty: 'Prof. Rajesh K', coverage: 70, status: 'Submitted', completedTopicsCount: 7, totalTopicsCount: 10 },
    { code: 'CS8504', name: 'OS Principles', faculty: 'Dr. Anita S', coverage: 60, status: 'Pending', completedTopicsCount: 5, totalTopicsCount: 8, reasonsForPending: 'Lab hours clashed with exams.', extraHoursRequested: true },
  ],
  'CSE-B_13': [
    { code: 'CS8501', name: 'Theory of Computation', faculty: 'Dr. Meena Kumari', coverage: 80, status: 'Pending', completedTopicsCount: 8, totalTopicsCount: 10 },
    { code: 'CS8502', name: 'Database Systems', faculty: 'Prof. Karthick D', coverage: 65, status: 'Pending', completedTopicsCount: 6, totalTopicsCount: 9 },
    { code: 'CS8503', name: 'Computer Networks', faculty: 'Prof. Rajesh K', coverage: 70, status: 'Pending', completedTopicsCount: 7, totalTopicsCount: 10 },
    { code: 'CS8504', name: 'OS Principles', faculty: 'Dr. Anita S', coverage: 60, status: 'Pending', completedTopicsCount: 5, totalTopicsCount: 8 },
  ],
};

const INITIAL_REPORTS: ConsolidatedReport[] = [
  {
    id: 'sample-report-001',
    classId: 'CSE-B',
    weekNumber: 11,
    overallCoverage: 61,
    submittedBy: 'Dr. Meena Kumari (Class Coordinator)',
    submittedAt: '2026-06-28',
    ccRemarks: 'All subjects are progressing well. Database systems lab coverage is slightly behind due to holidays.',
    status: 'SENT_TO_ADMIN',
    subjects: INITIAL_SUBJECTS_PROGRESS['CSE-B_11'],
    hodRemarks: 'Reviewed and found correct. Forwarded to principal.',
    approvedAt: '2026-06-29',
  },
  {
    id: 'sample-report-002',
    classId: 'CSE-B',
    weekNumber: 12,
    overallCoverage: 69,
    submittedBy: 'Dr. Meena Kumari (Class Coordinator)',
    submittedAt: '2026-07-05',
    ccRemarks: 'CS8504 faculty is running behind schedule due to lab sessions. Extra hour request raised.',
    status: 'SUBMITTED_TO_HOD',
    subjects: INITIAL_SUBJECTS_PROGRESS['CSE-B_12'],
  },
];

export const useReportStore = create<ReportStoreState>((set, get) => ({
  reports: INITIAL_REPORTS,
  subjectProgressList: INITIAL_SUBJECTS_PROGRESS,

  fetchReports: async () => {
    try {
      const response = await apiClient.get('/reports');
      set({ reports: response.data });
    } catch (err) {
      console.error('fetchReports error:', err);
    }
  },

  fetchWeeklyProgress: async (classId, weekNumber) => {
    try {
      const response = await apiClient.get(`/reports/weekly/${classId}/${weekNumber}`);
      const report = response.data;
      const key = `${classId}_${weekNumber}`;
      set((state) => ({
        subjectProgressList: {
          ...state.subjectProgressList,
          [key]: report.subjects,
        },
      }));
    } catch (err) {
      console.error('fetchWeeklyProgress error:', err);
    }
  },

  addProgressLog: (classId, weekNumber, subjectCode, completedTopics, totalTopics, reasonsForPending, extraHoursRequested) => {
    const key = `${classId}_${weekNumber}`;
    set((state) => {
      const currentList = state.subjectProgressList[key] || [
        { code: 'CS8501', name: 'Theory of Computation', faculty: 'Dr. Meena Kumari', coverage: 0, status: 'Pending', completedTopicsCount: 0, totalTopicsCount: 10 },
        { code: 'CS8502', name: 'Database Systems', faculty: 'Prof. Karthick D', coverage: 0, status: 'Pending', completedTopicsCount: 0, totalTopicsCount: 9 },
        { code: 'CS8503', name: 'Computer Networks', faculty: 'Prof. Rajesh K', coverage: 0, status: 'Pending', completedTopicsCount: 0, totalTopicsCount: 10 },
        { code: 'CS8504', name: 'OS Principles', faculty: 'Dr. Anita S', coverage: 0, status: 'Pending', completedTopicsCount: 0, totalTopicsCount: 8 },
      ];

      const updatedList = currentList.map((item) => {
        if (item.code === subjectCode) {
          const coveragePct = Math.round((completedTopics / totalTopics) * 100);
          return {
            ...item,
            coverage: coveragePct,
            status: 'Submitted' as const,
            completedTopicsCount: completedTopics,
            totalTopicsCount: totalTopics,
            reasonsForPending,
            extraHoursRequested,
          };
        }
        return item;
      });

      return {
        subjectProgressList: {
          ...state.subjectProgressList,
          [key]: updatedList,
        },
      };
    });
  },

  compileWeeklyReport: async (classId, weekNumber, ccRemarks, ccName) => {
    const key = `${classId}_${weekNumber}`;
    const subjects = get().subjectProgressList[key] || [];
    
    const submittedSubjects = subjects.filter((s) => s.status === 'Submitted');
    const totalCoverage = submittedSubjects.reduce((sum, s) => sum + s.coverage, 0);
    const overallCoverage = subjects.length > 0 ? Math.round(totalCoverage / subjects.length) : 0;

    const reportId = `report_${classId}_W${weekNumber}_${Date.now()}`;
    const newReport: ConsolidatedReport = {
      id: reportId,
      classId,
      weekNumber,
      overallCoverage,
      submittedBy: `${ccName} (Class Coordinator)`,
      submittedAt: new Date().toISOString().split('T')[0],
      ccRemarks,
      status: 'SUBMITTED_TO_HOD',
      subjects,
    };

    set((state) => ({
      reports: [newReport, ...state.reports],
    }));

    try {
      await apiClient.post('/reports/compile', newReport);
    } catch (err) {
      console.error('compileWeeklyReport backend post failed:', err);
    }

    return reportId;
  },

  submitHODDecision: async (reportId, decision, remarks) => {
    try {
      await apiClient.post('/hod/decision', {
        requestId: reportId,
        decision,
        remarks,
        isExtraHour: false,
      });
    } catch (err) {
      console.error('submitHODDecision backend post failed:', err);
    }

    set((state) => {
      const updatedReports = state.reports.map((report) => {
        if (report.id === reportId) {
          let nextStatus: ConsolidatedReport['status'] = 'SUBMITTED_TO_HOD';
          if (decision === 'APPROVED') {
            nextStatus = 'SENT_TO_ADMIN';
          } else if (decision === 'RETURNED') {
            nextStatus = 'RETURNED_BY_HOD';
          } else if (decision === 'REJECTED') {
            nextStatus = 'REJECTED_BY_HOD';
          }

          return {
            ...report,
            status: nextStatus,
            hodRemarks: remarks,
            approvedAt: nextStatus === 'SENT_TO_ADMIN' ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return report;
      });

      return { reports: updatedReports };
    });
  },

  getReportById: (reportId) => {
    return get().reports.find((r) => r.id === reportId);
  },
}));
