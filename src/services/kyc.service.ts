import { adminApi } from '../api/admin.api';
import type { KycStats, KycQueueItem } from '../types/analytics.types';

export const kycService = {
  getStats: async (): Promise<KycStats> => {
    return adminApi.getKycStats();
  },

  getQueue: async (): Promise<KycQueueItem[]> => {
    return adminApi.getKycQueue();
  },
};
