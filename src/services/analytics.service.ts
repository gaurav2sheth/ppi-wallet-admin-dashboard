import { adminApi } from '../api/admin.api';
import type { DashboardOverview } from '../types/analytics.types';

export const analyticsService = {
  getDashboardOverview: async (): Promise<DashboardOverview> => {
    return adminApi.getDashboardOverview();
  },
};
