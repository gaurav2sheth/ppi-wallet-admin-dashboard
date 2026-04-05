import type { DashboardOverview, DashboardMetric, QuickStat, DashboardAlert } from '../../types/analytics.types';
import { mockGetAllUsers } from './users.mock';
import { resetSeed, randomInt, seededRandom } from './generators';

function generateSparkline(baseValue: number, trend: number, points = 7): number[] {
  resetSeed(baseValue);
  const data: number[] = [];
  let v = baseValue;
  for (let i = 0; i < points; i++) {
    v = v + trend + (seededRandom() - 0.5) * baseValue * 0.05;
    data.push(Math.round(v));
  }
  return data;
}

export function mockGetDashboardOverview(): DashboardOverview {
  const users = mockGetAllUsers();
  const totalUsers = users.length;
  const activeWallets = users.filter(u => u.walletState === 'ACTIVE').length;
  const totalBalancePaise = users.reduce((sum, u) => sum + BigInt(u.balancePaise), 0n);
  const fullKycUsers = users.filter(u => u.kycState === 'FULL_KYC').length;
  const kycRate = Math.round((fullKycUsers / totalUsers) * 1000) / 10;

  const metrics: DashboardMetric[] = [
    {
      label: 'Total Users',
      value: totalUsers.toLocaleString('en-IN'),
      change: 4.2,
      changeLabel: 'vs last week',
      sparkData: generateSparkline(totalUsers - 30, 4),
      color: '#002E6E',
    },
    {
      label: 'Active Wallets',
      value: activeWallets.toLocaleString('en-IN'),
      change: 2.8,
      changeLabel: 'vs last week',
      sparkData: generateSparkline(activeWallets - 20, 3),
      color: '#12B76A',
    },
    {
      label: 'Total Balance',
      value: formatCompactCr(totalBalancePaise),
      change: 5.1,
      changeLabel: 'vs last week',
      sparkData: generateSparkline(Number(totalBalancePaise / 100n) - 50000, 7000),
      prefix: '\u20B9',
      color: '#00B9F1',
    },
    {
      label: "Today's Transactions",
      value: `${randomInt(800, 1500).toLocaleString('en-IN')}`,
      change: -1.3,
      changeLabel: 'vs yesterday',
      sparkData: generateSparkline(1100, 20),
      color: '#F79009',
    },
    {
      label: 'KYC Completion',
      value: `${kycRate}%`,
      change: 1.5,
      changeLabel: 'vs last week',
      sparkData: generateSparkline(kycRate - 3, 0.4),
      suffix: '%',
      color: '#7C3AED',
    },
    {
      label: 'Revenue (MDR)',
      value: `\u20B9${randomInt(8000, 15000).toLocaleString('en-IN')}`,
      change: 6.7,
      changeLabel: 'vs last week',
      sparkData: generateSparkline(10000, 500),
      prefix: '\u20B9',
      color: '#EC4899',
    },
  ];

  const quickStats: QuickStat[] = [
    { label: 'New Signups Today', value: randomInt(15, 45), color: '#12B76A', icon: 'UserAddOutlined' },
    { label: 'Pending KYC', value: users.filter(u => u.kycState === 'FULL_KYC_PENDING').length, color: '#F79009', icon: 'SafetyCertificateOutlined' },
    { label: 'Failed Txns (24h)', value: randomInt(3, 12), color: '#F04438', icon: 'WarningOutlined' },
    { label: 'Active Sessions', value: randomInt(50, 200), color: '#00B9F1', icon: 'ThunderboltOutlined' },
  ];

  const alerts: DashboardAlert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'KYC Expiry Alert',
      message: `${randomInt(5, 15)} wallets have KYC expiring in the next 7 days`,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'info',
      title: 'System Health',
      message: 'All services operational. API latency: 45ms avg',
      createdAt: new Date().toISOString(),
    },
  ];

  return { metrics, quickStats, alerts };
}

function formatCompactCr(paise: bigint): string {
  const rupees = Number(paise / 100n);
  if (rupees >= 10000000) return `\u20B9${(rupees / 10000000).toFixed(2)} Cr`;
  if (rupees >= 100000) return `\u20B9${(rupees / 100000).toFixed(2)} L`;
  return `\u20B9${rupees.toLocaleString('en-IN')}`;
}
