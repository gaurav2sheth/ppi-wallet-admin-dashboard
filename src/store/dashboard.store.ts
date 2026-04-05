import { create } from 'zustand';
import type { DashboardOverview, DashboardMetric, QuickStat, DashboardAlert } from '../types/analytics.types';
import { adminApi } from '../api/admin.api';

interface DashboardState {
  metrics: DashboardMetric[];
  quickStats: QuickStat[];
  alerts: DashboardAlert[];
  isLoading: boolean;
  error: string | null;

  fetchOverview: () => Promise<void>;
  getSnapshot: () => { metrics: DashboardMetric[]; quickStats: QuickStat[]; alerts: DashboardAlert[] };
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  metrics: [],
  quickStats: [],
  alerts: [],
  isLoading: false,
  error: null,

  fetchOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const data: DashboardOverview = await adminApi.getDashboardOverview();
      set({ metrics: data.metrics, quickStats: data.quickStats, alerts: data.alerts, isLoading: false });
    } catch (err) {
      set({ error: (err as { message?: string })?.message ?? 'Failed to fetch dashboard', isLoading: false });
    }
  },

  getSnapshot: () => {
    const { metrics, quickStats, alerts } = get();
    return { metrics, quickStats, alerts };
  },
}));
