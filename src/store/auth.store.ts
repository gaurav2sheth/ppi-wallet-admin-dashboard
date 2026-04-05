import { create } from 'zustand';
import type { AdminUser } from '../types/admin.types';
import type { AdminRole, Permission } from '../utils/permissions';
import { getPermissionsForRole, hasPermission as checkPermission, shouldMaskPII as checkMaskPII } from '../utils/permissions';
import { STORAGE_KEYS } from '../utils/constants';

interface AuthState {
  isAuthenticated: boolean;
  admin: AdminUser | null;
  role: AdminRole | null;
  permissions: Permission[];
  maskPII: boolean;

  login: (role: AdminRole, name?: string) => void;
  logout: () => void;
  hasPermission: (p: Permission) => boolean;
  hydrate: () => void;
  getSnapshot: () => { isAuthenticated: boolean; role: AdminRole | null; permissions: Permission[]; maskPII: boolean };
}

const MOCK_ADMINS: Record<AdminRole, { name: string; email: string }> = {
  SUPER_ADMIN: { name: 'Rajesh Kumar', email: 'rajesh.kumar@ppi-wallet.com' },
  BUSINESS_ADMIN: { name: 'Priya Sharma', email: 'priya.sharma@ppi-wallet.com' },
  OPS_MANAGER: { name: 'Amit Singh', email: 'amit.singh@ppi-wallet.com' },
  CS_AGENT: { name: 'Neha Gupta', email: 'neha.gupta@ppi-wallet.com' },
  COMPLIANCE_OFFICER: { name: 'Vikram Patel', email: 'vikram.patel@ppi-wallet.com' },
  MARKETING_MANAGER: { name: 'Sakshi Jain', email: 'sakshi.jain@ppi-wallet.com' },
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  admin: null,
  role: null,
  permissions: [],
  maskPII: false,

  login: (role: AdminRole, name?: string) => {
    const mock = MOCK_ADMINS[role];
    const permissions = getPermissionsForRole(role);
    const admin: AdminUser = {
      id: `admin_${role.toLowerCase()}`,
      email: mock.email,
      name: name ?? mock.name,
      role,
      permissions,
      lastLoginAt: new Date().toISOString(),
      createdAt: '2025-01-15T00:00:00Z',
      isActive: true,
    };
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify({ role, admin }));
    set({
      isAuthenticated: true,
      admin,
      role,
      permissions,
      maskPII: checkMaskPII(role),
    });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    set({
      isAuthenticated: false,
      admin: null,
      role: null,
      permissions: [],
      maskPII: false,
    });
  },

  hasPermission: (p: Permission) => {
    const { role } = get();
    return role ? checkPermission(role, p) : false;
  },

  hydrate: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
      if (stored) {
        const { role, admin } = JSON.parse(stored);
        const permissions = getPermissionsForRole(role);
        set({
          isAuthenticated: true,
          admin,
          role,
          permissions,
          maskPII: checkMaskPII(role),
        });
      }
    } catch { /* ignore */ }
  },

  getSnapshot: () => {
    const { isAuthenticated, role, permissions, maskPII } = get();
    return { isAuthenticated, role, permissions, maskPII };
  },
}));
