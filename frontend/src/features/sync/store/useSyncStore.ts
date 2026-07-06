import { create } from 'zustand';

interface SyncState {
  isSyncing: boolean;
  lastSyncedAt: number | null;
  pendingCount: number;
  setSyncing: (isSyncing: boolean) => void;
  setLastSyncedAt: (timestamp: number) => void;
  setPendingCount: (count: number) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  lastSyncedAt: null,
  pendingCount: 0,
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
}));
