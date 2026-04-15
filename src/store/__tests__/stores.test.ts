import { describe, it, expect, beforeEach } from 'vitest';
import { useDashboardStore } from '../dashboard.store';
import { useKycStore } from '../kyc.store';
import { useTransactionsStore } from '../transactions.store';
import { useUIStore } from '../ui.store';
import { useUsersStore } from '../users.store';
import { DEFAULT_TRANSACTION_FILTERS } from '../../types/transaction.types';
import { DEFAULT_USER_FILTERS } from '../../types/user.types';

describe('dashboardStore', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      metrics: [],
      quickStats: [],
      alerts: [],
      isLoading: false,
      error: null,
    });
  });

  it('has correct initial state', () => {
    const state = useDashboardStore.getState();
    expect(state.metrics).toEqual([]);
    expect(state.quickStats).toEqual([]);
    expect(state.alerts).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('getSnapshot returns metrics, quickStats, and alerts', () => {
    const snapshot = useDashboardStore.getState().getSnapshot();
    expect(snapshot).toHaveProperty('metrics');
    expect(snapshot).toHaveProperty('quickStats');
    expect(snapshot).toHaveProperty('alerts');
  });
});

describe('kycStore', () => {
  beforeEach(() => {
    useKycStore.setState({
      stats: null,
      queue: [],
      isLoading: false,
      isQueueLoading: false,
      error: null,
    });
  });

  it('has correct initial state', () => {
    const state = useKycStore.getState();
    expect(state.stats).toBeNull();
    expect(state.queue).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.isQueueLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('getSnapshot returns stats and queue', () => {
    const snapshot = useKycStore.getState().getSnapshot();
    expect(snapshot).toEqual({ stats: null, queue: [] });
  });
});

describe('transactionsStore', () => {
  beforeEach(() => {
    useTransactionsStore.setState({
      transactions: [],
      total: 0,
      totalPages: 0,
      filters: { ...DEFAULT_TRANSACTION_FILTERS },
      selectedTransaction: null,
      isLoading: false,
      isDetailLoading: false,
      error: null,
    });
  });

  it('has correct initial state', () => {
    const state = useTransactionsStore.getState();
    expect(state.transactions).toEqual([]);
    expect(state.total).toBe(0);
    expect(state.totalPages).toBe(0);
    expect(state.filters).toEqual(DEFAULT_TRANSACTION_FILTERS);
    expect(state.selectedTransaction).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('default filters have correct values', () => {
    const { filters } = useTransactionsStore.getState();
    expect(filters.search).toBe('');
    expect(filters.sagaType).toBeNull();
    expect(filters.status).toBeNull();
    expect(filters.page).toBe(1);
    expect(filters.pageSize).toBe(20);
    expect(filters.sortField).toBe('createdAt');
    expect(filters.sortOrder).toBe('descend');
  });

  it('clearSelectedTransaction sets selectedTransaction to null', () => {
    useTransactionsStore.setState({
      selectedTransaction: { id: 'test' } as any,
    });
    useTransactionsStore.getState().clearSelectedTransaction();
    expect(useTransactionsStore.getState().selectedTransaction).toBeNull();
  });

  it('getSnapshot returns transactions, total, and filters', () => {
    const snapshot = useTransactionsStore.getState().getSnapshot();
    expect(snapshot).toHaveProperty('transactions');
    expect(snapshot).toHaveProperty('total');
    expect(snapshot).toHaveProperty('filters');
  });
});

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarCollapsed: false,
      breadcrumbs: [{ title: 'Dashboard' }],
    });
    localStorage.clear();
  });

  it('has correct initial state', () => {
    const state = useUIStore.getState();
    expect(state.sidebarCollapsed).toBe(false);
    expect(state.breadcrumbs).toEqual([{ title: 'Dashboard' }]);
  });

  it('toggleSidebar flips collapsed state', () => {
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
  });

  it('toggleSidebar persists to localStorage', () => {
    useUIStore.getState().toggleSidebar();
    expect(localStorage.getItem('ppi_sidebar_collapsed')).toBe('true');
    useUIStore.getState().toggleSidebar();
    expect(localStorage.getItem('ppi_sidebar_collapsed')).toBe('false');
  });

  it('setSidebarCollapsed sets state and persists', () => {
    useUIStore.getState().setSidebarCollapsed(true);
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    expect(localStorage.getItem('ppi_sidebar_collapsed')).toBe('true');
  });

  it('setBreadcrumbs updates breadcrumb items', () => {
    useUIStore.getState().setBreadcrumbs([{ title: 'Users' }, { title: 'Detail' }]);
    expect(useUIStore.getState().breadcrumbs).toEqual([
      { title: 'Users' },
      { title: 'Detail' },
    ]);
  });

  it('hydrate restores sidebar state from localStorage', () => {
    localStorage.setItem('ppi_sidebar_collapsed', 'true');
    useUIStore.setState({ sidebarCollapsed: false });

    useUIStore.getState().hydrate();
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
  });

  it('hydrate does nothing when localStorage has no value', () => {
    useUIStore.setState({ sidebarCollapsed: false });
    useUIStore.getState().hydrate();
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
  });

  it('getSnapshot returns sidebarCollapsed and breadcrumbs', () => {
    const snapshot = useUIStore.getState().getSnapshot();
    expect(snapshot).toHaveProperty('sidebarCollapsed');
    expect(snapshot).toHaveProperty('breadcrumbs');
  });
});

describe('usersStore', () => {
  beforeEach(() => {
    useUsersStore.setState({
      users: [],
      total: 0,
      totalPages: 0,
      filters: { ...DEFAULT_USER_FILTERS },
      selectedUser: null,
      isLoading: false,
      isDetailLoading: false,
      error: null,
    });
  });

  it('has correct initial state', () => {
    const state = useUsersStore.getState();
    expect(state.users).toEqual([]);
    expect(state.total).toBe(0);
    expect(state.totalPages).toBe(0);
    expect(state.filters).toEqual(DEFAULT_USER_FILTERS);
    expect(state.selectedUser).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('default filters have correct values', () => {
    const { filters } = useUsersStore.getState();
    expect(filters.search).toBe('');
    expect(filters.kycTier).toBeNull();
    expect(filters.kycState).toBeNull();
    expect(filters.walletState).toBeNull();
    expect(filters.page).toBe(1);
    expect(filters.pageSize).toBe(20);
    expect(filters.sortField).toBe('createdAt');
    expect(filters.sortOrder).toBe('descend');
  });

  it('clearSelectedUser sets selectedUser to null', () => {
    useUsersStore.setState({
      selectedUser: { id: 'test' } as any,
    });
    useUsersStore.getState().clearSelectedUser();
    expect(useUsersStore.getState().selectedUser).toBeNull();
  });

  it('getSnapshot returns users, total, filters, and selectedUser', () => {
    const snapshot = useUsersStore.getState().getSnapshot();
    expect(snapshot).toHaveProperty('users');
    expect(snapshot).toHaveProperty('total');
    expect(snapshot).toHaveProperty('filters');
    expect(snapshot).toHaveProperty('selectedUser');
  });
});
