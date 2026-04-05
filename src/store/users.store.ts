import { create } from 'zustand';
import type { WalletUser, UserDetail, UserFilters, WalletState } from '../types/user.types';
import { DEFAULT_USER_FILTERS } from '../types/user.types';
import { adminApi } from '../api/admin.api';

interface UsersState {
  users: WalletUser[];
  total: number;
  totalPages: number;
  filters: UserFilters;
  selectedUser: UserDetail | null;
  isLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;

  fetchUsers: (filters?: Partial<UserFilters>) => Promise<void>;
  setFilters: (filters: Partial<UserFilters>) => void;
  resetFilters: () => void;
  fetchUserDetail: (userId: string) => Promise<void>;
  updateUserStatus: (userId: string, newState: WalletState, reason?: string) => Promise<boolean>;
  clearSelectedUser: () => void;
  getSnapshot: () => { users: WalletUser[]; total: number; filters: UserFilters; selectedUser: UserDetail | null };
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  total: 0,
  totalPages: 0,
  filters: { ...DEFAULT_USER_FILTERS },
  selectedUser: null,
  isLoading: false,
  isDetailLoading: false,
  error: null,

  fetchUsers: async (overrides?: Partial<UserFilters>) => {
    const filters = { ...get().filters, ...overrides };
    set({ isLoading: true, error: null, filters });
    try {
      const res = await adminApi.getUsers(filters);
      set({ users: res.data, total: res.total, totalPages: res.totalPages, isLoading: false });
    } catch (err) {
      set({ error: (err as { message?: string })?.message ?? 'Failed to fetch users', isLoading: false });
    }
  },

  setFilters: (partial: Partial<UserFilters>) => {
    const filters = { ...get().filters, ...partial, page: partial.page ?? 1 };
    set({ filters });
    get().fetchUsers(filters);
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_USER_FILTERS } });
    get().fetchUsers(DEFAULT_USER_FILTERS);
  },

  fetchUserDetail: async (userId: string) => {
    set({ isDetailLoading: true });
    try {
      const detail = await adminApi.getUserDetail(userId);
      set({ selectedUser: detail, isDetailLoading: false });
    } catch {
      set({ isDetailLoading: false });
    }
  },

  updateUserStatus: async (userId: string, newState: WalletState, reason?: string): Promise<boolean> => {
    try {
      const updated = await adminApi.updateUserStatus(userId, newState, reason);
      if (updated) {
        const users = get().users.map(u => u.id === userId ? { ...u, walletState: newState, isActive: newState === 'ACTIVE' } : u);
        set({ users });
        if (get().selectedUser?.id === userId) {
          set({ selectedUser: { ...get().selectedUser!, walletState: newState, isActive: newState === 'ACTIVE' } });
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  clearSelectedUser: () => set({ selectedUser: null }),

  getSnapshot: () => {
    const { users, total, filters, selectedUser } = get();
    return { users, total, filters, selectedUser };
  },
}));
