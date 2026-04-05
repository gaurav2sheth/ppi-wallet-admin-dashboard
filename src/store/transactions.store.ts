import { create } from 'zustand';
import type { Transaction, TransactionDetail, TransactionFilters } from '../types/transaction.types';
import { DEFAULT_TRANSACTION_FILTERS } from '../types/transaction.types';
import { adminApi } from '../api/admin.api';

interface TransactionsState {
  transactions: Transaction[];
  total: number;
  totalPages: number;
  filters: TransactionFilters;
  selectedTransaction: TransactionDetail | null;
  isLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;

  fetchTransactions: (filters?: Partial<TransactionFilters>) => Promise<void>;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  resetFilters: () => void;
  fetchTransactionDetail: (txnId: string) => Promise<void>;
  clearSelectedTransaction: () => void;
  getSnapshot: () => { transactions: Transaction[]; total: number; filters: TransactionFilters };
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  total: 0,
  totalPages: 0,
  filters: { ...DEFAULT_TRANSACTION_FILTERS },
  selectedTransaction: null,
  isLoading: false,
  isDetailLoading: false,
  error: null,

  fetchTransactions: async (overrides?: Partial<TransactionFilters>) => {
    const filters = { ...get().filters, ...overrides };
    set({ isLoading: true, error: null, filters });
    try {
      const res = await adminApi.getTransactions(filters);
      set({ transactions: res.data, total: res.total, totalPages: res.totalPages, isLoading: false });
    } catch (err) {
      set({ error: (err as { message?: string })?.message ?? 'Failed to fetch transactions', isLoading: false });
    }
  },

  setFilters: (partial: Partial<TransactionFilters>) => {
    const filters = { ...get().filters, ...partial, page: partial.page ?? 1 };
    set({ filters });
    get().fetchTransactions(filters);
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_TRANSACTION_FILTERS } });
    get().fetchTransactions(DEFAULT_TRANSACTION_FILTERS);
  },

  fetchTransactionDetail: async (txnId: string) => {
    set({ isDetailLoading: true });
    try {
      const detail = await adminApi.getTransactionDetail(txnId);
      set({ selectedTransaction: detail, isDetailLoading: false });
    } catch {
      set({ isDetailLoading: false });
    }
  },

  clearSelectedTransaction: () => set({ selectedTransaction: null }),

  getSnapshot: () => {
    const { transactions, total, filters } = get();
    return { transactions, total, filters };
  },
}));
