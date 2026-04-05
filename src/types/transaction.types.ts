export type SagaType = 'ADD_MONEY' | 'MERCHANT_PAY' | 'P2P_TRANSFER' | 'WALLET_TO_BANK' | 'BILL_PAY' | 'REFUND';
export type SagaStatus = 'STARTED' | 'RUNNING' | 'COMPLETED' | 'COMPENSATING' | 'COMPENSATED' | 'DLQ';
export type StepStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'COMPENSATED' | 'COMPENSATION_FAILED';

export interface Transaction {
  id: string;
  sagaType: SagaType;
  status: SagaStatus;
  amountPaise: string;
  walletId: string;
  userName: string;
  userPhone: string;
  counterparty: string | null;
  description: string;
  idempotencyKey: string;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface SagaStep {
  id: string;
  stepIndex: number;
  stepName: string;
  status: StepStatus;
  result: Record<string, unknown> | null;
  error: string | null;
  compensated: boolean;
  compensateError: string | null;
  executedAt: string | null;
  compensatedAt: string | null;
}

export interface TransactionDetail extends Transaction {
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  steps: SagaStep[];
  retryCount: number;
}

export interface TransactionFilters {
  search: string;
  sagaType: SagaType | null;
  status: SagaStatus | null;
  amountMin: number | null;
  amountMax: number | null;
  dateFrom: string | null;
  dateTo: string | null;
  walletId: string | null;
  page: number;
  pageSize: number;
  sortField: string;
  sortOrder: 'ascend' | 'descend';
}

export const DEFAULT_TRANSACTION_FILTERS: TransactionFilters = {
  search: '',
  sagaType: null,
  status: null,
  amountMin: null,
  amountMax: null,
  dateFrom: null,
  dateTo: null,
  walletId: null,
  page: 1,
  pageSize: 20,
  sortField: 'createdAt',
  sortOrder: 'descend',
};
