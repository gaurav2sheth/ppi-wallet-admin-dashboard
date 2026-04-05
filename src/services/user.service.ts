import { adminApi } from '../api/admin.api';
import type { PaginatedResponse } from '../types/admin.types';
import type { WalletUser, UserDetail, UserFilters, WalletState } from '../types/user.types';

export const userService = {
  searchUsers: async (filters: UserFilters): Promise<PaginatedResponse<WalletUser>> => {
    return adminApi.getUsers(filters);
  },

  getUserDetail: async (userId: string): Promise<UserDetail | null> => {
    return adminApi.getUserDetail(userId);
  },

  updateUserStatus: async (userId: string, newState: WalletState, reason?: string): Promise<WalletUser | null> => {
    return adminApi.updateUserStatus(userId, newState, reason);
  },
};
