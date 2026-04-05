export interface DashboardMetric {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  sparkData: number[];
  prefix?: string;
  suffix?: string;
  color: string;
}

export interface QuickStat {
  label: string;
  value: number;
  color: string;
  icon: string;
}

export interface DashboardOverview {
  metrics: DashboardMetric[];
  quickStats: QuickStat[];
  alerts: DashboardAlert[];
}

export interface DashboardAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  createdAt: string;
}

export interface KycStats {
  totalUsers: number;
  distribution: KycDistributionItem[];
  pendingCount: number;
  avgVerificationMinutes: number;
  successRate: number;
  failureRate: number;
}

export interface KycDistributionItem {
  state: string;
  count: number;
  percentage: number;
  color: string;
}

export interface KycQueueItem {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  walletId: string;
  currentState: string;
  requestedTier: string;
  submittedAt: string;
  aadhaarVerified: boolean;
  panMasked: string | null;
}

export interface SpendCategory {
  category: string;
  amountPaise: string;
  transactionCount: number;
  percentage: number;
  color: string;
}

export interface RevenueMetrics {
  totalGmvPaise: string;
  totalMdrPaise: string;
  arpuPaise: string;
  transactionCount: number;
  successRate: number;
}
