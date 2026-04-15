import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../auth.store';
import { getPermissionsForRole, shouldMaskPII } from '../../utils/permissions';

describe('authStore', () => {
  beforeEach(() => {
    // Reset the store to initial state
    useAuthStore.setState({
      isAuthenticated: false,
      admin: null,
      role: null,
      permissions: [],
      maskPII: false,
    });
    localStorage.clear();
  });

  it('has correct initial state (not authenticated)', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.admin).toBeNull();
    expect(state.role).toBeNull();
    expect(state.permissions).toEqual([]);
    expect(state.maskPII).toBe(false);
  });

  it('login with SUPER_ADMIN sets user and role correctly', () => {
    useAuthStore.getState().login('SUPER_ADMIN');
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.role).toBe('SUPER_ADMIN');
    expect(state.admin).not.toBeNull();
    expect(state.admin!.name).toBe('Rajesh Kumar');
    expect(state.admin!.email).toBe('rajesh.kumar@ppi-wallet.com');
    expect(state.admin!.role).toBe('SUPER_ADMIN');
    expect(state.admin!.isActive).toBe(true);
    expect(state.permissions).toEqual(getPermissionsForRole('SUPER_ADMIN'));
    expect(state.maskPII).toBe(false);
  });

  it('login with BUSINESS_ADMIN sets correct role and permissions', () => {
    useAuthStore.getState().login('BUSINESS_ADMIN');
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.role).toBe('BUSINESS_ADMIN');
    expect(state.admin!.name).toBe('Priya Sharma');
    expect(state.permissions).toEqual(getPermissionsForRole('BUSINESS_ADMIN'));
  });

  it('login with CS_AGENT masks PII', () => {
    useAuthStore.getState().login('CS_AGENT');
    const state = useAuthStore.getState();

    expect(state.maskPII).toBe(true);
    expect(shouldMaskPII('CS_AGENT')).toBe(true);
  });

  it('login with MARKETING_MANAGER masks PII', () => {
    useAuthStore.getState().login('MARKETING_MANAGER');
    const state = useAuthStore.getState();

    expect(state.maskPII).toBe(true);
  });

  it('login with OPS_MANAGER does not mask PII', () => {
    useAuthStore.getState().login('OPS_MANAGER');
    const state = useAuthStore.getState();

    expect(state.maskPII).toBe(false);
  });

  it('login with custom name overrides the default mock name', () => {
    useAuthStore.getState().login('SUPER_ADMIN', 'Custom Name');
    const state = useAuthStore.getState();

    expect(state.admin!.name).toBe('Custom Name');
  });

  it('login persists to localStorage', () => {
    useAuthStore.getState().login('SUPER_ADMIN');

    const stored = localStorage.getItem('ppi_admin_user');
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.role).toBe('SUPER_ADMIN');
    expect(parsed.admin.name).toBe('Rajesh Kumar');
  });

  it('logout clears all state', () => {
    useAuthStore.getState().login('SUPER_ADMIN');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().logout();
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.admin).toBeNull();
    expect(state.role).toBeNull();
    expect(state.permissions).toEqual([]);
    expect(state.maskPII).toBe(false);
  });

  it('logout removes from localStorage', () => {
    useAuthStore.getState().login('SUPER_ADMIN');
    expect(localStorage.getItem('ppi_admin_user')).not.toBeNull();

    useAuthStore.getState().logout();
    expect(localStorage.getItem('ppi_admin_user')).toBeNull();
  });

  it('hasPermission returns true for valid permission', () => {
    useAuthStore.getState().login('SUPER_ADMIN');
    expect(useAuthStore.getState().hasPermission('dashboard.view')).toBe(true);
    expect(useAuthStore.getState().hasPermission('admin.manage')).toBe(true);
  });

  it('hasPermission returns false for missing permission', () => {
    useAuthStore.getState().login('CS_AGENT');
    expect(useAuthStore.getState().hasPermission('admin.manage')).toBe(false);
    expect(useAuthStore.getState().hasPermission('users.edit')).toBe(false);
  });

  it('hasPermission returns false when not logged in', () => {
    expect(useAuthStore.getState().hasPermission('dashboard.view')).toBe(false);
  });

  it('hydrate restores state from localStorage', () => {
    // Login and store state
    useAuthStore.getState().login('OPS_MANAGER');
    const savedAdmin = useAuthStore.getState().admin;

    // Reset store in memory (simulating page refresh)
    useAuthStore.setState({
      isAuthenticated: false,
      admin: null,
      role: null,
      permissions: [],
      maskPII: false,
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    // Hydrate from localStorage
    useAuthStore.getState().hydrate();
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.role).toBe('OPS_MANAGER');
    expect(state.admin!.name).toBe(savedAdmin!.name);
    expect(state.permissions).toEqual(getPermissionsForRole('OPS_MANAGER'));
  });

  it('hydrate does nothing when localStorage is empty', () => {
    useAuthStore.getState().hydrate();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('getSnapshot returns current state shape', () => {
    useAuthStore.getState().login('COMPLIANCE_OFFICER');
    const snapshot = useAuthStore.getState().getSnapshot();

    expect(snapshot.isAuthenticated).toBe(true);
    expect(snapshot.role).toBe('COMPLIANCE_OFFICER');
    expect(snapshot.permissions).toEqual(getPermissionsForRole('COMPLIANCE_OFFICER'));
    expect(snapshot.maskPII).toBe(false);
  });

  it('each role gets correct mock admin data', () => {
    const roleNames: Record<string, string> = {
      SUPER_ADMIN: 'Rajesh Kumar',
      BUSINESS_ADMIN: 'Priya Sharma',
      OPS_MANAGER: 'Amit Singh',
      CS_AGENT: 'Neha Gupta',
      COMPLIANCE_OFFICER: 'Vikram Patel',
      MARKETING_MANAGER: 'Sakshi Jain',
    };

    for (const [role, expectedName] of Object.entries(roleNames)) {
      useAuthStore.getState().login(role as any);
      expect(useAuthStore.getState().admin!.name).toBe(expectedName);
      // Reset for next iteration
      useAuthStore.getState().logout();
    }
  });
});
