export type WalletState = 'ACTIVE' | 'SUSPENDED' | 'DORMANT' | 'EXPIRED' | 'CLOSED';
export type KycTier = 'MINIMUM' | 'FULL';
export type KycState = 'UNVERIFIED' | 'MIN_KYC' | 'FULL_KYC_PENDING' | 'FULL_KYC' | 'REJECTED' | 'SUSPENDED';

export interface WalletUser {
  id: string;
  userId: string;
  walletId: string;
  name: string;
  phone: string;
  email?: string;
  kycTier: KycTier;
  kycState: KycState;
  walletState: WalletState;
  balancePaise: string;
  heldPaise: string;
  availablePaise: string;
  isActive: boolean;
  walletExpiryDate: string | null;
  lastActivityAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetail extends WalletUser {
  kycProfile: KycProfile | null;
  recentTransactions: UserTransaction[];
  totalTransactions: number;
  totalSpentPaise: string;
  totalReceivedPaise: string;
  totalCashbackPaise: string;
}

export interface KycProfile {
  id: string;
  state: KycState;
  aadhaarVerifiedAt: string | null;
  panMasked: string | null;
  ckycNumber: string | null;
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
  auditLogs: KycAuditEntry[];
}

export interface KycAuditEntry {
  id: string;
  fromState: KycState | null;
  toState: KycState;
  event: string;
  actor: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface UserTransaction {
  id: string;
  entryType: 'CREDIT' | 'DEBIT' | 'HOLD' | 'HOLD_RELEASE';
  amountPaise: string;
  balanceAfterPaise: string;
  transactionType: string;
  description: string | null;
  createdAt: string;
}

export interface UserFilters {
  search: string;
  kycTier: KycTier | null;
  kycState: KycState | null;
  walletState: WalletState | null;
  balanceMin: number | null;
  balanceMax: number | null;
  dateFrom: string | null;
  dateTo: string | null;
  page: number;
  pageSize: number;
  sortField: string;
  sortOrder: 'ascend' | 'descend';
}

export const DEFAULT_USER_FILTERS: UserFilters = {
  search: '',
  kycTier: null,
  kycState: null,
  walletState: null,
  balanceMin: null,
  balanceMax: null,
  dateFrom: null,
  dateTo: null,
  page: 1,
  pageSize: 20,
  sortField: 'createdAt',
  sortOrder: 'descend',
};
