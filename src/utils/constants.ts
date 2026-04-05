export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  TRANSACTIONS: '/transactions',
  TRANSACTION_DETAIL: '/transactions/:id',
  KYC: '/kyc',
  ANALYTICS: '/analytics',
  CAMPAIGNS: '/campaigns',
  SETTINGS: '/settings',
  FORBIDDEN: '/403',
} as const;

export const STORAGE_KEYS = {
  ADMIN_TOKEN: 'ppi_admin_token',
  ADMIN_USER: 'ppi_admin_user',
  SIDEBAR_COLLAPSED: 'ppi_sidebar_collapsed',
} as const;

export const WALLET_STATE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  ACTIVE: { color: '#12B76A', bg: '#ECFDF3', label: 'Active' },
  SUSPENDED: { color: '#F04438', bg: '#FEF3F2', label: 'Suspended' },
  DORMANT: { color: '#F79009', bg: '#FFFAEB', label: 'Dormant' },
  EXPIRED: { color: '#666666', bg: '#F2F4F7', label: 'Expired' },
  CLOSED: { color: '#344054', bg: '#F2F4F7', label: 'Closed' },
};

export const KYC_STATE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  UNVERIFIED: { color: '#666666', bg: '#F2F4F7', label: 'Unverified' },
  MIN_KYC: { color: '#00B9F1', bg: '#E8F4FD', label: 'Minimum KYC' },
  FULL_KYC_PENDING: { color: '#F79009', bg: '#FFFAEB', label: 'Full KYC Pending' },
  FULL_KYC: { color: '#12B76A', bg: '#ECFDF3', label: 'Full KYC' },
  REJECTED: { color: '#F04438', bg: '#FEF3F2', label: 'Rejected' },
  SUSPENDED: { color: '#F04438', bg: '#FEF3F2', label: 'Suspended' },
};

export const KYC_TIER_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  MINIMUM: { color: '#F79009', bg: '#FFFAEB', label: 'Minimum' },
  FULL: { color: '#12B76A', bg: '#ECFDF3', label: 'Full' },
};

export const SAGA_STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  STARTED: { color: '#00B9F1', bg: '#E8F4FD', label: 'Started' },
  RUNNING: { color: '#00B9F1', bg: '#E8F4FD', label: 'Running' },
  COMPLETED: { color: '#12B76A', bg: '#ECFDF3', label: 'Completed' },
  COMPENSATING: { color: '#F79009', bg: '#FFFAEB', label: 'Compensating' },
  COMPENSATED: { color: '#F79009', bg: '#FFFAEB', label: 'Compensated' },
  DLQ: { color: '#F04438', bg: '#FEF3F2', label: 'DLQ' },
};

export const STEP_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING: { color: '#666666', label: 'Pending' },
  RUNNING: { color: '#00B9F1', label: 'Running' },
  COMPLETED: { color: '#12B76A', label: 'Completed' },
  FAILED: { color: '#F04438', label: 'Failed' },
  COMPENSATED: { color: '#F79009', label: 'Compensated' },
  COMPENSATION_FAILED: { color: '#F04438', label: 'Compensation Failed' },
};

export const SAGA_TYPE_LABELS: Record<string, string> = {
  ADD_MONEY: 'Add Money',
  MERCHANT_PAY: 'Merchant Payment',
  P2P_TRANSFER: 'P2P Transfer',
  WALLET_TO_BANK: 'Bank Transfer',
  BILL_PAY: 'Bill Payment',
  REFUND: 'Refund',
};

export const LEDGER_ENTRY_TYPE_LABELS: Record<string, string> = {
  CREDIT: 'Credit',
  DEBIT: 'Debit',
  HOLD: 'Hold',
  HOLD_RELEASE: 'Hold Release',
};
