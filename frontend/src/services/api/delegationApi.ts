import { apiClient } from './apiClient';

export interface CoordinatorItem {
  classId: string;
  name: string;
  year: string;
  coverage: number;
  pendingCount: number;
  coordinator?: {
    id: string;
    name: string;
    email: string;
    department: string;
  } | null;
}

export interface SubjectAllocationItem {
  id: string;
  classId: string;
  subjectCode: string;
  subjectName: string;
  faculty: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
}

export const delegationApi = {
  // HOD APIs
  fetchCoordinators: async (): Promise<CoordinatorItem[]> => {
    const res = await apiClient.get('/v1/hod/coordinators');
    return res.data;
  },

  assignCoordinator: async (data: {
    classId: string;
    name: string;
    email: string;
    department: string;
    password?: string;
  }) => {
    const res = await apiClient.post('/v1/hod/coordinators', data);
    return res.data;
  },

  removeCoordinator: async (classId: string) => {
    const res = await apiClient.delete(`/v1/hod/coordinators/${encodeURIComponent(classId)}`);
    return res.data;
  },

  // CC APIs
  searchFaculty: async (query: string) => {
    const res = await apiClient.get(`/v1/cc/faculty-search?q=${encodeURIComponent(query)}`);
    return res.data;
  },

  fetchClassAllocations: async (classId: string) => {
    const res = await apiClient.get(`/v1/cc/allocations/${encodeURIComponent(classId)}`);
    return res.data;
  },

  allocateSubject: async (data: {
    classId: string;
    subjectCode: string;
    subjectName: string;
    facultyEmail: string;
    facultyName: string;
    department?: string;
    password?: string;
  }) => {
    const res = await apiClient.post('/v1/cc/allocate', data);
    return res.data;
  },

  removeAllocation: async (assignmentId: string) => {
    const res = await apiClient.delete(`/v1/cc/allocate/${encodeURIComponent(assignmentId)}`);
    return res.data;
  },
};
