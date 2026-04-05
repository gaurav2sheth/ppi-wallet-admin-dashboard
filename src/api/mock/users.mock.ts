import type { WalletUser, UserDetail, KycProfile, KycAuditEntry, UserTransaction, KycState, KycTier, WalletState } from '../../types/user.types';
import type { UserFilters } from '../../types/user.types';
import type { PaginatedResponse } from '../../types/admin.types';
import {
  resetSeed, generateUUID, generateName, generatePhone, generateEmail,
  generatePastDate, generateRecentDate, pickWeighted, randomBigIntPaise,
  randomInt, seededRandom, pickRandom, generateMerchantName,
} from './generators';

let _users: WalletUser[] | null = null;

function generateUsers(): WalletUser[] {
  resetSeed(100);
  const users: WalletUser[] = [];

  for (let i = 0; i < 200; i++) {
    const name = generateName();
    const phone = generatePhone();
    const id = generateUUID();
    const userId = `USR_${generateUUID().slice(0, 12)}`;
    const walletId = `WAL_${generateUUID().slice(0, 12)}`;

    const kycTier = pickWeighted<KycTier>(['FULL', 'MINIMUM'], [40, 60]);
    const kycState = pickWeighted<KycState>(
      ['FULL_KYC', 'MIN_KYC', 'FULL_KYC_PENDING', 'REJECTED', 'UNVERIFIED', 'SUSPENDED'],
      [35, 40, 10, 5, 7, 3]
    );
    const walletState = pickWeighted<WalletState>(
      ['ACTIVE', 'DORMANT', 'SUSPENDED', 'EXPIRED', 'CLOSED'],
      [75, 10, 5, 5, 5]
    );

    const maxBalance = kycTier === 'FULL' ? 200000 : 10000;
    const balancePaise = randomBigIntPaise(0, maxBalance);
    const heldPaise = randomBigIntPaise(0, Math.min(500, Number(balancePaise) / 100));
    const availablePaise = String(BigInt(balancePaise) - BigInt(heldPaise));

    const createdAt = generatePastDate(365);
    const isActive = walletState === 'ACTIVE';
    const lastActivityAt = isActive
      ? generateRecentDate(30)
      : walletState === 'DORMANT'
        ? generatePastDate(180)
        : null;

    const walletExpiryDate = kycTier === 'MINIMUM'
      ? new Date(Date.parse(createdAt) + 365 * 86400000).toISOString()
      : null;

    users.push({
      id, userId, walletId, name, phone,
      email: generateEmail(name),
      kycTier, kycState, walletState,
      balancePaise, heldPaise, availablePaise,
      isActive, walletExpiryDate, lastActivityAt,
      createdAt, updatedAt: lastActivityAt ?? createdAt,
    });
  }

  return users.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

function getUsers(): WalletUser[] {
  if (!_users) _users = generateUsers();
  return _users;
}

export function mockGetUsers(filters: UserFilters): PaginatedResponse<WalletUser> {
  let data = [...getUsers()];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    data = data.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.walletId.toLowerCase().includes(q) ||
      u.userId.toLowerCase().includes(q)
    );
  }

  if (filters.kycTier) data = data.filter(u => u.kycTier === filters.kycTier);
  if (filters.kycState) data = data.filter(u => u.kycState === filters.kycState);
  if (filters.walletState) data = data.filter(u => u.walletState === filters.walletState);
  if (filters.balanceMin !== null) data = data.filter(u => Number(u.balancePaise) >= filters.balanceMin! * 100);
  if (filters.balanceMax !== null) data = data.filter(u => Number(u.balancePaise) <= filters.balanceMax! * 100);
  if (filters.dateFrom) data = data.filter(u => u.createdAt >= filters.dateFrom!);
  if (filters.dateTo) data = data.filter(u => u.createdAt <= filters.dateTo!);

  const dir = filters.sortOrder === 'ascend' ? 1 : -1;
  data.sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[filters.sortField];
    const bVal = (b as unknown as Record<string, unknown>)[filters.sortField];
    if (typeof aVal === 'string' && typeof bVal === 'string') return aVal.localeCompare(bVal) * dir;
    return 0;
  });

  const total = data.length;
  const start = (filters.page - 1) * filters.pageSize;
  const paged = data.slice(start, start + filters.pageSize);

  return {
    data: paged,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.ceil(total / filters.pageSize),
  };
}

export function mockGetUserDetail(userId: string): UserDetail | null {
  const user = getUsers().find(u => u.id === userId);
  if (!user) return null;

  resetSeed(userId.charCodeAt(0) * 100 + userId.charCodeAt(4));

  const kycProfile: KycProfile = {
    id: generateUUID(),
    state: user.kycState,
    aadhaarVerifiedAt: user.kycState === 'FULL_KYC' ? generatePastDate(60) : null,
    panMasked: seededRandom() > 0.3 ? `XXXXX${randomInt(1000, 9999)}X` : null,
    ckycNumber: seededRandom() > 0.5 ? `${randomInt(10000000000000, 99999999999999)}` : null,
    rejectedReason: user.kycState === 'REJECTED' ? pickRandom([
      'Document mismatch', 'Blurry Aadhaar photo', 'Name mismatch with records',
      'Invalid date of birth', 'Duplicate account detected'
    ]) : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    auditLogs: generateKycAuditLogs(user.kycState),
  };

  const recentTransactions: UserTransaction[] = [];
  for (let i = 0; i < randomInt(5, 15); i++) {
    const entryType = pickWeighted<'CREDIT' | 'DEBIT' | 'HOLD' | 'HOLD_RELEASE'>(
      ['CREDIT', 'DEBIT', 'HOLD', 'HOLD_RELEASE'], [30, 50, 10, 10]
    );
    const txnType = pickRandom(['ADD_MONEY', 'MERCHANT_PAY', 'P2P_TRANSFER', 'WALLET_TO_BANK', 'BILL_PAY']);
    recentTransactions.push({
      id: generateUUID(),
      entryType,
      amountPaise: randomBigIntPaise(10, 5000),
      balanceAfterPaise: randomBigIntPaise(0, 10000),
      transactionType: txnType,
      description: entryType === 'DEBIT' ? `Payment to ${generateMerchantName()}` : `${txnType.replace(/_/g, ' ')}`,
      createdAt: generateRecentDate(90),
    });
  }
  recentTransactions.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return {
    ...user,
    kycProfile,
    recentTransactions,
    totalTransactions: randomInt(10, 500),
    totalSpentPaise: randomBigIntPaise(1000, 100000),
    totalReceivedPaise: randomBigIntPaise(500, 50000),
    totalCashbackPaise: randomBigIntPaise(10, 2000),
  };
}

function generateKycAuditLogs(currentState: KycState): KycAuditEntry[] {
  const logs: KycAuditEntry[] = [];
  const stateFlow: { from: KycState | null; to: KycState; event: string }[] = [
    { from: null, to: 'UNVERIFIED', event: 'ACCOUNT_CREATED' },
    { from: 'UNVERIFIED', to: 'MIN_KYC', event: 'AADHAAR_OTP_VERIFIED' },
  ];

  if (currentState === 'FULL_KYC' || currentState === 'FULL_KYC_PENDING') {
    stateFlow.push({ from: 'MIN_KYC', to: 'FULL_KYC_PENDING', event: 'VIDEO_KYC_INITIATED' });
    if (currentState === 'FULL_KYC') {
      stateFlow.push({ from: 'FULL_KYC_PENDING', to: 'FULL_KYC', event: 'VIDEO_KYC_COMPLETED' });
    }
  }
  if (currentState === 'REJECTED') {
    stateFlow.push({ from: 'FULL_KYC_PENDING', to: 'REJECTED', event: 'VIDEO_KYC_FAILED' });
  }

  let daysAgo = 300;
  for (const step of stateFlow) {
    logs.push({
      id: generateUUID(),
      fromState: step.from,
      toState: step.to,
      event: step.event,
      actor: step.event.startsWith('ADMIN') ? 'admin@ppi-wallet.com' : 'system',
      createdAt: generatePastDate(daysAgo),
    });
    daysAgo -= randomInt(10, 60);
    if (daysAgo < 0) daysAgo = 0;
  }

  return logs;
}

export function mockUpdateUserStatus(userId: string, newState: WalletState): WalletUser | null {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  users[idx] = {
    ...users[idx],
    walletState: newState,
    isActive: newState === 'ACTIVE',
    updatedAt: new Date().toISOString(),
  };
  return users[idx];
}

export function mockGetAllUsers(): WalletUser[] {
  return getUsers();
}
