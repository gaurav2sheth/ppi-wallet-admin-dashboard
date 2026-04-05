import type { KycStats, KycDistributionItem, KycQueueItem } from '../../types/analytics.types';
import { mockGetAllUsers } from './users.mock';
import { resetSeed, generateUUID, generatePastDate, randomInt, seededRandom } from './generators';

export function mockGetKycStats(): KycStats {
  const users = mockGetAllUsers();
  const total = users.length;

  const counts: Record<string, number> = {};
  for (const u of users) {
    counts[u.kycState] = (counts[u.kycState] || 0) + 1;
  }

  const stateColors: Record<string, string> = {
    FULL_KYC: '#12B76A',
    MIN_KYC: '#00B9F1',
    FULL_KYC_PENDING: '#F79009',
    REJECTED: '#F04438',
    UNVERIFIED: '#98A2B3',
    SUSPENDED: '#F04438',
  };

  const distribution: KycDistributionItem[] = Object.entries(counts)
    .map(([state, count]) => ({
      state,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
      color: stateColors[state] || '#666666',
    }))
    .sort((a, b) => b.count - a.count);

  const pendingCount = counts['FULL_KYC_PENDING'] || 0;

  return {
    totalUsers: total,
    distribution,
    pendingCount,
    avgVerificationMinutes: 12,
    successRate: Math.round(((counts['FULL_KYC'] || 0) / total) * 1000) / 10,
    failureRate: Math.round(((counts['REJECTED'] || 0) / total) * 1000) / 10,
  };
}

export function mockGetKycQueue(): KycQueueItem[] {
  resetSeed(300);
  const users = mockGetAllUsers().filter(u => u.kycState === 'FULL_KYC_PENDING');
  return users.map(u => ({
    id: generateUUID(),
    userId: u.userId,
    userName: u.name,
    userPhone: u.phone,
    walletId: u.walletId,
    currentState: u.kycState,
    requestedTier: 'FULL',
    submittedAt: generatePastDate(30),
    aadhaarVerified: seededRandom() > 0.3,
    panMasked: seededRandom() > 0.4 ? `XXXXX${randomInt(1000, 9999)}X` : null,
  }));
}
