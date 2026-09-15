import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'STAFF' | 'HOD' | 'ADMIN';
  isClassCoordinator: boolean;
  department: string;
  assignedClassId?: string; // e.g. 'CSE-B' — set for staff/CC users
  subjectAssignments?: Array<{
    id?: string;
    classId: string;
    subjectCode: string;
    subjectName: string;
  }>;
}

interface AuthState {
  user: UserSession | null;
  accessToken: string | null;
  refreshToken: string | null;
  rememberMe: boolean;
  setRememberMe: (rememberMe: boolean) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (user: UserSession, accessToken: string, refreshToken: string, rememberMe?: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      rememberMe: true,
      setRememberMe: (rememberMe) => set({ rememberMe }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      login: (user, accessToken, refreshToken, rememberMe = true) =>
        set({ user, accessToken, refreshToken, rememberMe }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'ccr-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
