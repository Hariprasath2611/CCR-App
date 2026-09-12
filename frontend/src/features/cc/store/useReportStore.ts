import { create } from 'zustand';
import { apiClient } from '@services/api/apiClient';
import { getSectionTemplate, filterNonAcademicSubjects } from '@config/sectionTemplates';

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
  completedOnPlan?: 'YES' | 'NO';
  periodsPlanned?: number | null;
  periodsHandled?: number | null;
  periodsRequired?: number | null;
  topicsCoveredText?: string;
  plannedTopicsText?: string;
  fromDate?: string;
  toDate?: string;
  cumulativePercent?: string;
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
    extraHoursRequested?: boolean,
    periodsPlanned?: number | null,
    periodsHandled?: number | null,
    periodsRequired?: number | null,
    topicsCoveredText?: string,
    plannedTopicsText?: string,
    fromDate?: string,
    toDate?: string,
    cumulativePercent?: string,
    completedOnPlan?: 'YES' | 'NO'
  ) => void;
  compileWeeklyReport: (classId: string, weekNumber: number, ccRemarks: string, ccName: string) => Promise<string>;
  submitHODDecision: (reportId: string, decision: 'APPROVED' | 'RETURNED' | 'REJECTED', remarks: string) => Promise<void>;
  getReportById: (reportId: string) => ConsolidatedReport | undefined;
}

export const getDefaultSubjectsForClass = (classId: string): SubjectProgress[] => {
  const upper = (classId || '').toUpperCase();
  if (upper.includes('1ST YEAR') || upper.includes('SEC-') || upper.includes('SEC ')) {
    const template = getSectionTemplate(classId);
    return template.subjects.map((s) => ({
      code: s.subjectCode,
      name: s.subjectName,
      faculty: s.staffInCharge,
      coverage: 0,
      status: 'Pending',
      completedTopicsCount: 0,
      totalTopicsCount: 5,
      periodsPlanned: s.periodsPlannedDefault || 6,
    }));
  }

  // Default fallback for 3rd Year / CSE
  return [
    { code: 'CS3591', name: 'Computer Networks', faculty: 'Ms.E Uva Shakthi', coverage: 0, status: 'Pending', completedTopicsCount: 0, totalTopicsCount: 5 },
    { code: 'CS3501', name: 'Compiler Design', faculty: 'Mr.J Lin Eby Chandra', coverage: 0, status: 'Pending', completedTopicsCount: 0, totalTopicsCount: 5 },
    { code: 'CB3491', name: 'Cryptography and Cyber Security', faculty: 'Mr.S Faizal Mukthar Hussain', coverage: 0, status: 'Pending', completedTopicsCount: 0, totalTopicsCount: 5 },
    { code: 'CS3551', name: 'Distributed Computing', faculty: 'Ms.R Rajalakshmi', coverage: 0, status: 'Pending', completedTopicsCount: 0, totalTopicsCount: 5 },
    { code: 'CCS375', name: 'Web Technologies', faculty: 'Ms.P Divya', coverage: 0, status: 'Pending', completedTopicsCount: 0, totalTopicsCount: 5 },
    { code: 'CCS370', name: 'UI and UX Design', faculty: 'Ms.Punitha EM', coverage: 0, status: 'Pending', completedTopicsCount: 0, totalTopicsCount: 5 },
    { code: 'MX3084', name: 'Disaster Management', faculty: 'Ms.Arun Kamala', coverage: 0, status: 'Pending', completedTopicsCount: 0, totalTopicsCount: 5 },
  ];
};

export const useReportStore = create<ReportStoreState>((set, get) => ({
  reports: [],
  subjectProgressList: {},

  fetchReports: async () => {
    try {
      const response = await apiClient.get('/reports');
      set({ reports: response.data });
    } catch (err) {
      console.error('fetchReports error:', err);
    }
  },

  fetchWeeklyProgress: async (classId, weekNumber) => {
    const key = `${classId}_${weekNumber}`;
    try {
      const response = await apiClient.get(`/reports/weekly/${classId}/${weekNumber}`);
      const report = response.data;
      set((state) => ({
        subjectProgressList: {
          ...state.subjectProgressList,
          [key]: report.subjects,
        },
      }));
    } catch (err) {
      console.error('fetchWeeklyProgress error, using template defaults:', err);
      set((state) => {
        if (!state.subjectProgressList[key]) {
          return {
            subjectProgressList: {
              ...state.subjectProgressList,
              [key]: getDefaultSubjectsForClass(classId),
            },
          };
        }
        return state;
      });
    }
  },

  addProgressLog: (
    classId,
    weekNumber,
    subjectCode,
    completedTopics,
    totalTopics,
    reasonsForPending,
    extraHoursRequested,
    periodsPlanned,
    periodsHandled,
    periodsRequired,
    topicsCoveredText,
    plannedTopicsText,
    fromDate,
    toDate,
    cumulativePercent,
    completedOnPlan
  ) => {
    const key = `${classId}_${weekNumber}`;
    set((state) => {
      const currentList = state.subjectProgressList[key] || getDefaultSubjectsForClass(classId);

      const updatedList = currentList.map((item) => {
        if (item.code === subjectCode) {
          let coveragePct = Math.round((completedTopics / totalTopics) * 100);
          if (cumulativePercent) {
            const pctMatch = cumulativePercent.match(/(\d+)\s*%/);
            if (pctMatch) {
              coveragePct = parseInt(pctMatch[1]);
            } else {
              const numMatch = cumulativePercent.match(/(\d+)/);
              if (numMatch) {
                coveragePct = parseInt(numMatch[1]);
              }
            }
          }

          return {
            ...item,
            coverage: coveragePct,
            status: 'Submitted' as const,
            completedTopicsCount: completedTopics,
            totalTopicsCount: totalTopics,
            reasonsForPending,
            extraHoursRequested,
            completedOnPlan,
            periodsPlanned,
            periodsHandled,
            periodsRequired,
            topicsCoveredText,
            plannedTopicsText,
            fromDate,
            toDate,
            cumulativePercent,
          };
        }
        return item;
      });

      // Carry forward progress to subsequent weeks (e.g. weekNumber + 1 through 16) if not already explicitly submitted
      const nextProgressList = { ...state.subjectProgressList, [key]: updatedList };
      const updatedSubjectItem = updatedList.find(s => s.code === subjectCode);

      if (updatedSubjectItem) {
        for (let w = weekNumber + 1; w <= 16; w++) {
          const futureKey = `${classId}_${w}`;
          const futureList = nextProgressList[futureKey];
          if (!futureList) {
            nextProgressList[futureKey] = updatedList.map(s => {
              if (s.code === subjectCode) {
                return {
                  ...s,
                  status: 'Pending' as const, // Future week starts with current week's cumulative progress pre-populated
                };
              }
              return s;
            });
          } else {
            nextProgressList[futureKey] = futureList.map(s => {
              if (s.code === subjectCode && s.status === 'Pending') {
                return {
                  ...s,
                  coverage: updatedSubjectItem.coverage,
                  completedTopicsCount: updatedSubjectItem.completedTopicsCount,
                  topicsCoveredText: updatedSubjectItem.topicsCoveredText,
                  cumulativePercent: updatedSubjectItem.cumulativePercent,
                };
              }
              return s;
            });
          }
        }
      }

      return {
        subjectProgressList: nextProgressList,
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
