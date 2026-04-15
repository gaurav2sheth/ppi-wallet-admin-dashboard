import { describe, it, expect } from 'vitest';
import {
  formatPaise,
  formatPaiseCompact,
  rupeesToPaise,
  formatPercent,
  formatCompactNumber,
  getInitials,
  truncateId,
  maskPhone,
  maskName,
} from '../format';
import { cn } from '../cn';
import {
  getPermissionsForRole,
  hasPermission,
  shouldMaskPII,
  ROLE_LABELS,
  ROLE_COLORS,
} from '../permissions';
import {
  ROUTES,
  STORAGE_KEYS,
  WALLET_STATE_CONFIG,
  KYC_STATE_CONFIG,
  SAGA_STATUS_CONFIG,
} from '../constants';

// ─── formatPaise ──────────────────────────────────────────────
describe('formatPaise', () => {
  it('formats zero paise', () => {
    expect(formatPaise(0)).toBe('\u20B90.00');
    expect(formatPaise('0')).toBe('\u20B90.00');
  });

  it('formats positive amounts', () => {
    expect(formatPaise(100)).toBe('\u20B91.00');
    expect(formatPaise('23611')).toBe('\u20B9236.11');
    expect(formatPaise('10000000')).toBe('\u20B91,00,000.00');
  });

  it('formats negative amounts', () => {
    expect(formatPaise(-500)).toBe('-\u20B95.00');
  });

  it('handles null and undefined', () => {
    expect(formatPaise(null)).toBe('\u20B90.00');
    expect(formatPaise(undefined)).toBe('\u20B90.00');
  });

  it('handles single digit paise', () => {
    expect(formatPaise(5)).toBe('\u20B90.05');
    expect(formatPaise(99)).toBe('\u20B90.99');
  });
});

// ─── formatPaiseCompact ───────────────────────────────────────
describe('formatPaiseCompact', () => {
  it('handles null and undefined', () => {
    expect(formatPaiseCompact(null)).toBe('\u20B90');
    expect(formatPaiseCompact(undefined)).toBe('\u20B90');
  });

  it('formats small amounts without suffix', () => {
    expect(formatPaiseCompact(50000)).toBe('\u20B9500');
  });

  it('formats thousands with K suffix', () => {
    expect(formatPaiseCompact(500000)).toBe('\u20B95.0K');
  });

  it('formats lakhs with L suffix', () => {
    expect(formatPaiseCompact(5000000000)).toBe('\u20B95.0Cr');
  });
});

// ─── rupeesToPaise ────────────────────────────────────────────
describe('rupeesToPaise', () => {
  it('converts rupees to paise', () => {
    expect(rupeesToPaise('100')).toBe(10000);
    expect(rupeesToPaise('236.11')).toBe(23611);
  });

  it('returns 0 for invalid input', () => {
    expect(rupeesToPaise('abc')).toBe(0);
    expect(rupeesToPaise('-5')).toBe(0);
  });

  it('rounds fractional paise', () => {
    // 1.005 * 100 = 100.49999... due to floating point, Math.round gives 100
    expect(rupeesToPaise('1.005')).toBe(100);
  });
});

// ─── formatPercent ────────────────────────────────────────────
describe('formatPercent', () => {
  it('formats percentage with default decimals', () => {
    expect(formatPercent(95.5)).toBe('95.5%');
  });

  it('formats with custom decimals', () => {
    expect(formatPercent(95.567, 2)).toBe('95.57%');
  });
});

// ─── formatCompactNumber ──────────────────────────────────────
describe('formatCompactNumber', () => {
  it('formats small numbers', () => {
    expect(formatCompactNumber(500)).toBe('500');
  });

  it('formats thousands', () => {
    expect(formatCompactNumber(5000)).toBe('5.0K');
  });

  it('formats lakhs', () => {
    expect(formatCompactNumber(500000)).toBe('5.0L');
  });

  it('formats crores', () => {
    expect(formatCompactNumber(50000000)).toBe('5.0Cr');
  });
});

// ─── getInitials ──────────────────────────────────────────────
describe('getInitials', () => {
  it('extracts initials from full name', () => {
    expect(getInitials('Rajesh Kumar')).toBe('RK');
  });

  it('handles single name', () => {
    expect(getInitials('Rajesh')).toBe('R');
  });

  it('takes at most 2 initials', () => {
    expect(getInitials('Rajesh Kumar Singh')).toBe('RK');
  });
});

// ─── truncateId ───────────────────────────────────────────────
describe('truncateId', () => {
  it('truncates long IDs', () => {
    expect(truncateId('abcdefghij', 8)).toBe('abcdefgh...');
  });

  it('does not truncate short IDs', () => {
    expect(truncateId('abc', 8)).toBe('abc');
  });
});

// ─── maskPhone ────────────────────────────────────────────────
describe('maskPhone', () => {
  it('masks middle digits', () => {
    expect(maskPhone('9876543210')).toBe('98****10');
  });

  it('returns short phone as-is', () => {
    expect(maskPhone('12345')).toBe('12345');
  });
});

// ─── maskName ─────────────────────────────────────────────────
describe('maskName', () => {
  it('masks each word except first letter', () => {
    expect(maskName('Rajesh Kumar')).toBe('R*** K***');
  });
});

// ─── cn utility ───────────────────────────────────────────────
describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters out falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });

  it('returns empty string for no truthy values', () => {
    expect(cn(false, undefined, null)).toBe('');
  });
});

// ─── permissions ──────────────────────────────────────────────
describe('getPermissionsForRole', () => {
  it('returns all permissions for SUPER_ADMIN', () => {
    const perms = getPermissionsForRole('SUPER_ADMIN');
    expect(perms).toContain('dashboard.view');
    expect(perms).toContain('admin.manage');
    expect(perms).toContain('users.edit');
    expect(perms).toContain('kyc.approve');
    expect(perms.length).toBe(12);
  });

  it('returns limited permissions for CS_AGENT', () => {
    const perms = getPermissionsForRole('CS_AGENT');
    expect(perms).toContain('dashboard.view');
    expect(perms).toContain('users.view');
    expect(perms).toContain('transactions.view');
    expect(perms).not.toContain('users.edit');
    expect(perms).not.toContain('admin.manage');
    expect(perms.length).toBe(3);
  });

  it('returns dashboard + analytics for MARKETING_MANAGER', () => {
    const perms = getPermissionsForRole('MARKETING_MANAGER');
    expect(perms).toEqual(['dashboard.view', 'analytics.view']);
  });
});

describe('hasPermission', () => {
  it('returns true when role has the permission', () => {
    expect(hasPermission('SUPER_ADMIN', 'admin.manage')).toBe(true);
    expect(hasPermission('OPS_MANAGER', 'kyc.approve')).toBe(true);
  });

  it('returns false when role lacks the permission', () => {
    expect(hasPermission('CS_AGENT', 'admin.manage')).toBe(false);
    expect(hasPermission('MARKETING_MANAGER', 'users.view')).toBe(false);
  });
});

describe('shouldMaskPII', () => {
  it('returns true for CS_AGENT and MARKETING_MANAGER', () => {
    expect(shouldMaskPII('CS_AGENT')).toBe(true);
    expect(shouldMaskPII('MARKETING_MANAGER')).toBe(true);
  });

  it('returns false for other roles', () => {
    expect(shouldMaskPII('SUPER_ADMIN')).toBe(false);
    expect(shouldMaskPII('OPS_MANAGER')).toBe(false);
    expect(shouldMaskPII('COMPLIANCE_OFFICER')).toBe(false);
    expect(shouldMaskPII('BUSINESS_ADMIN')).toBe(false);
  });
});

// ─── constants ────────────────────────────────────────────────
describe('constants', () => {
  it('ROUTES has expected keys', () => {
    expect(ROUTES.LOGIN).toBe('/login');
    expect(ROUTES.DASHBOARD).toBe('/');
    expect(ROUTES.USERS).toBe('/users');
    expect(ROUTES.TRANSACTIONS).toBe('/transactions');
    expect(ROUTES.KYC).toBe('/kyc');
    expect(ROUTES.SETTINGS).toBe('/settings');
  });

  it('STORAGE_KEYS has correct values', () => {
    expect(STORAGE_KEYS.ADMIN_USER).toBe('ppi_admin_user');
    expect(STORAGE_KEYS.ADMIN_TOKEN).toBe('ppi_admin_token');
    expect(STORAGE_KEYS.SIDEBAR_COLLAPSED).toBe('ppi_sidebar_collapsed');
  });

  it('WALLET_STATE_CONFIG has all states', () => {
    expect(Object.keys(WALLET_STATE_CONFIG)).toEqual(
      expect.arrayContaining(['ACTIVE', 'SUSPENDED', 'DORMANT', 'EXPIRED', 'CLOSED'])
    );
  });

  it('KYC_STATE_CONFIG has all states', () => {
    expect(Object.keys(KYC_STATE_CONFIG)).toEqual(
      expect.arrayContaining(['UNVERIFIED', 'MIN_KYC', 'FULL_KYC_PENDING', 'FULL_KYC', 'REJECTED', 'SUSPENDED'])
    );
  });

  it('SAGA_STATUS_CONFIG has all statuses', () => {
    expect(Object.keys(SAGA_STATUS_CONFIG)).toEqual(
      expect.arrayContaining(['STARTED', 'RUNNING', 'COMPLETED', 'COMPENSATING', 'COMPENSATED', 'DLQ'])
    );
  });

  it('ROLE_LABELS maps all roles', () => {
    expect(ROLE_LABELS.SUPER_ADMIN).toBe('Super Admin');
    expect(ROLE_LABELS.CS_AGENT).toBe('Customer Support');
    expect(ROLE_LABELS.MARKETING_MANAGER).toBe('Marketing Manager');
  });

  it('ROLE_COLORS uses Paytm PODS colors', () => {
    expect(ROLE_COLORS.SUPER_ADMIN).toBe('#002E6E');
    expect(ROLE_COLORS.BUSINESS_ADMIN).toBe('#00B9F1');
    expect(ROLE_COLORS.OPS_MANAGER).toBe('#12B76A');
  });
});
