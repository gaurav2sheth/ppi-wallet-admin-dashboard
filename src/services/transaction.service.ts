import { adminApi } from '../api/admin.api';
import type { PaginatedResponse } from '../types/admin.types';
import type { Transaction, TransactionDetail, TransactionFilters } from '../types/transaction.types';

export const transactionService = {
  searchTransactions: async (filters: TransactionFilters): Promise<PaginatedResponse<Transaction>> => {
    return adminApi.getTransactions(filters);
  },

  getTransactionDetail: async (txnId: string): Promise<TransactionDetail | null> => {
    return adminApi.getTransactionDetail(txnId);
  },
};
