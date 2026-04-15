import { describe, it, expect } from 'vitest';
import {
  getPermissionsForRole,
  hasPermission,
  shouldMaskPII,
  type AdminRole,
  type Permission,
} from '../../utils/permissions';

const ALL_ROLES: AdminRole[] = [
  'SUPER_ADMIN',
  'BUSINESS_ADMIN',
  'OPS_MANAGER',
  'CS_AGENT',
  'COMPLIANCE_OFFICER',
  'MARKETING_MANAGER',
];

const ALL_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'users.view',
  'users.edit',
  'users.export',
  'transactions.view',
  'transactions.export',
  'kyc.view',
  'kyc.approve',
  'analytics.view',
  'analytics.export',
  'settings.view',
  'admin.manage',
];

describe('RBAC configuration', () => {
  it('every role returns a non-empty permission array', () => {
    for (const role of ALL_ROLES) {
      const perms = getPermissionsForRole(role);
      expect(perms.length).toBeGreaterThan(0);
    }
  });

  it('SUPER_ADMIN has ALL permissions', () => {
    const perms = getPermissionsForRole('SUPER_ADMIN');
    for (const p of ALL_PERMISSIONS) {
      expect(perms).toContain(p);
    }
    expect(perms.length).toBe(ALL_PERMISSIONS.length);
  });

  it('BUSINESS_ADMIN has dashboard, users.view, transactions.view, analytics', () => {
    const perms = getPermissionsForRole('BUSINESS_ADMIN');
    expect(perms).toContain('dashboard.view');
    expect(perms).toContain('users.view');
    expect(perms).toContain('transactions.view');
    expect(perms).toContain('analytics.view');
    expect(perms).toContain('analytics.export');
    // Should NOT have edit/approve permissions
    expect(perms).not.toContain('users.edit');
    expect(perms).not.toContain('kyc.approve');
    expect(perms).not.toContain('admin.manage');
  });

  it('OPS_MANAGER has users (full), transactions (full), KYC approve', () => {
    const perms = getPermissionsForRole('OPS_MANAGER');
    expect(perms).toContain('users.view');
    expect(perms).toContain('users.edit');
    expect(perms).toContain('users.export');
    expect(perms).toContain('transactions.view');
    expect(perms).toContain('transactions.export');
    expect(perms).toContain('kyc.view');
    expect(perms).toContain('kyc.approve');
    // Should NOT have analytics or admin
    expect(perms).not.toContain('analytics.view');
    expect(perms).not.toContain('admin.manage');
  });

  it('CS_AGENT only has dashboard, users.view, transactions.view', () => {
    const perms = getPermissionsForRole('CS_AGENT');
    expect(perms).toEqual(['dashboard.view', 'users.view', 'transactions.view']);
    // Verify no write permissions
    expect(perms).not.toContain('users.edit');
    expect(perms).not.toContain('users.export');
    expect(perms).not.toContain('transactions.export');
    expect(perms).not.toContain('kyc.approve');
    expect(perms).not.toContain('admin.manage');
  });

  it('COMPLIANCE_OFFICER has dashboard, transactions.view, kyc.view, kyc.approve', () => {
    const perms = getPermissionsForRole('COMPLIANCE_OFFICER');
    expect(perms).toContain('dashboard.view');
    expect(perms).toContain('transactions.view');
    expect(perms).toContain('kyc.view');
    expect(perms).toContain('kyc.approve');
    expect(perms).not.toContain('users.edit');
    expect(perms).not.toContain('admin.manage');
  });

  it('MARKETING_MANAGER only has dashboard.view and analytics.view', () => {
    const perms = getPermissionsForRole('MARKETING_MANAGER');
    expect(perms).toEqual(['dashboard.view', 'analytics.view']);
    expect(perms).not.toContain('users.view');
    expect(perms).not.toContain('transactions.view');
    expect(perms).not.toContain('admin.manage');
  });

  it('all roles have dashboard.view', () => {
    for (const role of ALL_ROLES) {
      expect(hasPermission(role, 'dashboard.view')).toBe(true);
    }
  });

  it('only SUPER_ADMIN has admin.manage', () => {
    for (const role of ALL_ROLES) {
      if (role === 'SUPER_ADMIN') {
        expect(hasPermission(role, 'admin.manage')).toBe(true);
      } else {
        expect(hasPermission(role, 'admin.manage')).toBe(false);
      }
    }
  });

  it('only SUPER_ADMIN has settings.view', () => {
    for (const role of ALL_ROLES) {
      if (role === 'SUPER_ADMIN') {
        expect(hasPermission(role, 'settings.view')).toBe(true);
      } else {
        expect(hasPermission(role, 'settings.view')).toBe(false);
      }
    }
  });

  it('PII masking is applied to CS_AGENT and MARKETING_MANAGER only', () => {
    expect(shouldMaskPII('CS_AGENT')).toBe(true);
    expect(shouldMaskPII('MARKETING_MANAGER')).toBe(true);
    expect(shouldMaskPII('SUPER_ADMIN')).toBe(false);
    expect(shouldMaskPII('BUSINESS_ADMIN')).toBe(false);
    expect(shouldMaskPII('OPS_MANAGER')).toBe(false);
    expect(shouldMaskPII('COMPLIANCE_OFFICER')).toBe(false);
  });

  it('hasPermission returns false for non-assigned permissions', () => {
    // CS_AGENT should not be able to edit users
    expect(hasPermission('CS_AGENT', 'users.edit')).toBe(false);
    // MARKETING_MANAGER should not view users
    expect(hasPermission('MARKETING_MANAGER', 'users.view')).toBe(false);
    // BUSINESS_ADMIN should not approve KYC
    expect(hasPermission('BUSINESS_ADMIN', 'kyc.approve')).toBe(false);
  });
});
