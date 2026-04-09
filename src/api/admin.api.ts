import type { PaginatedResponse } from '../types/admin.types';
import type { WalletUser, UserDetail, UserFilters, WalletState } from '../types/user.types';
import type { Transaction, TransactionDetail, TransactionFilters } from '../types/transaction.types';
import type { DashboardOverview } from '../types/analytics.types';
import type { KycStats, KycQueueItem } from '../types/analytics.types';
import { api, apiReachable } from './client';
import axios from 'axios';
import { mockGetUsers, mockGetUserDetail, mockUpdateUserStatus } from './mock/users.mock';
import { mockGetTransactions, mockGetTransactionDetail } from './mock/transactions.mock';
import { mockGetDashboardOverview } from './mock/analytics.mock';
import { mockGetKycStats, mockGetKycQueue } from './mock/kyc.mock';

// Simulate network delay for mock data
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export const adminApi = {
  // ── Dashboard ──
  getDashboardOverview: async (): Promise<DashboardOverview> => {
    try {
      if (!apiReachable) throw new Error('mock');
      return await api.get('/admin/analytics/overview');
    } catch {
      await delay();
      return mockGetDashboardOverview();
    }
  },

  // ── Users ──
  getUsers: async (filters: UserFilters): Promise<PaginatedResponse<WalletUser>> => {
    try {
      if (!apiReachable) throw new Error('mock');
      return await api.get('/admin/users', { params: filters });
    } catch {
      await delay();
      return mockGetUsers(filters);
    }
  },

  getUserDetail: async (userId: string): Promise<UserDetail | null> => {
    try {
      if (!apiReachable) throw new Error('mock');
      return await api.get(`/admin/users/${userId}`);
    } catch {
      await delay(200);
      return mockGetUserDetail(userId);
    }
  },

  updateUserStatus: async (userId: string, newState: WalletState, reason?: string): Promise<WalletUser | null> => {
    try {
      if (!apiReachable) throw new Error('mock');
      return await api.patch(`/admin/users/${userId}/status`, { state: newState, reason });
    } catch {
      await delay(200);
      return mockUpdateUserStatus(userId, newState);
    }
  },

  // ── Transactions ──
  getTransactions: async (filters: TransactionFilters): Promise<PaginatedResponse<Transaction>> => {
    try {
      if (!apiReachable) throw new Error('mock');
      return await api.get('/admin/transactions', { params: filters });
    } catch {
      await delay();
      return mockGetTransactions(filters);
    }
  },

  getTransactionDetail: async (txnId: string): Promise<TransactionDetail | null> => {
    try {
      if (!apiReachable) throw new Error('mock');
      return await api.get(`/admin/transactions/${txnId}`);
    } catch {
      await delay(200);
      return mockGetTransactionDetail(txnId);
    }
  },

  // ── KYC ──
  getKycStats: async (): Promise<KycStats> => {
    try {
      if (!apiReachable) throw new Error('mock');
      return await api.get('/admin/kyc/stats');
    } catch {
      await delay();
      return mockGetKycStats();
    }
  },

  getKycQueue: async (): Promise<KycQueueItem[]> => {
    try {
      if (!apiReachable) throw new Error('mock');
      return await api.get('/admin/kyc/queue');
    } catch {
      await delay();
      return mockGetKycQueue();
    }
  },

  // ── AI Transaction Summariser ──
  summariseTransactions: async (transactions: Transaction[]): Promise<{ summary: string }> => {
    const payload = {
      transactions: transactions.map(t => ({
        id: t.id,
        sagaType: t.sagaType,
        status: t.status,
        amountPaise: t.amountPaise,
        userName: t.userName,
        description: t.description,
        createdAt: t.createdAt,
        counterparty: t.counterparty,
        error: t.error,
      })),
    };

    // Try backend first (port 3000), then fall back to local Vite middleware
    try {
      if (apiReachable) {
        const res = await api.post('/api/summarise-transactions', payload);
        return res as unknown as { summary: string };
      }
    } catch { /* fall through to local */ }

    // Fallback: call Vite dev server middleware (same origin)
    const res = await axios.post('/api/summarise-transactions', payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    return res.data;
  },
};
