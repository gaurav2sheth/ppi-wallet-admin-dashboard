import { create } from 'zustand';
import type { KycStats, KycQueueItem } from '../types/analytics.types';
import { adminApi } from '../api/admin.api';

interface KycStoreState {
  stats: KycStats | null;
  queue: KycQueueItem[];
  isLoading: boolean;
  isQueueLoading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  fetchQueue: () => Promise<void>;
  getSnapshot: () => { stats: KycStats | null; queue: KycQueueItem[] };
}

export const useKycStore = create<KycStoreState>((set, get) => ({
  stats: null,
  queue: [],
  isLoading: false,
  isQueueLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await adminApi.getKycStats();
      set({ stats, isLoading: false });
    } catch (err) {
      set({ error: (err as { message?: string })?.message ?? 'Failed to fetch KYC stats', isLoading: false });
    }
  },

  fetchQueue: async () => {
    set({ isQueueLoading: true });
    try {
      const queue = await adminApi.getKycQueue();
      set({ queue, isQueueLoading: false });
    } catch {
      set({ isQueueLoading: false });
    }
  },

  getSnapshot: () => {
    const { stats, queue } = get();
    return { stats, queue };
  },
}));
