import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import { useDashboardStore } from '../../store/dashboard.store';
import { useAuthStore } from '../../store/auth.store';
import type { DashboardMetric, QuickStat, DashboardAlert } from '../../types/analytics.types';

// Mock the API to prevent real network calls
vi.mock('../../api/admin.api', () => ({
  adminApi: {
    getDashboardOverview: vi.fn().mockResolvedValue({
      metrics: [],
      quickStats: [],
      alerts: [],
    }),
  },
}));

// Mock child components that may have complex dependencies
vi.mock('../../components/dashboard/TransactionSummaryCard', () => ({
  TransactionSummaryCard: () => <div data-testid="transaction-summary">Transaction Summary</div>,
}));

vi.mock('../../components/dashboard/AiChatCard', () => ({
  AiChatCard: () => <div data-testid="ai-chat">AI Chat</div>,
}));

vi.mock('../../components/dashboard/LoadGuardLog', () => ({
  LoadGuardLog: () => <div data-testid="load-guard-log">Load Guard Log</div>,
}));

const mockMetrics: DashboardMetric[] = [
  {
    label: 'Total Users',
    value: '12,450',
    change: 12.5,
    changeLabel: 'vs last month',
    sparkData: [10, 20, 30],
    color: '#002E6E',
  },
  {
    label: 'Active Wallets',
    value: '8,320',
    change: 8.2,
    changeLabel: 'vs last month',
    sparkData: [15, 25, 35],
    color: '#00B9F1',
  },
];

const mockQuickStats: QuickStat[] = [
  { label: 'Pending KYC', value: 42, color: '#F79009', icon: 'idcard' },
];

const mockAlerts: DashboardAlert[] = [
  {
    id: 'alert-1',
    type: 'warning',
    title: 'High transaction volume',
    message: 'Transaction volume is 30% higher than usual',
    createdAt: '2025-01-01T00:00:00Z',
  },
];

describe('DashboardPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: true,
      role: 'SUPER_ADMIN',
      admin: {
        id: 'admin_super_admin',
        email: 'rajesh.kumar@ppi-wallet.com',
        name: 'Rajesh Kumar',
        role: 'SUPER_ADMIN',
        permissions: [],
        lastLoginAt: new Date().toISOString(),
        createdAt: '2025-01-15T00:00:00Z',
        isActive: true,
      },
      permissions: [],
      maskPII: false,
    });
  });

  it('renders page header with "Dashboard" title', () => {
    // Pre-populate with metrics so it doesn't show loading spinner
    useDashboardStore.setState({
      metrics: mockMetrics,
      quickStats: mockQuickStats,
      alerts: [],
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Overview of your wallet ecosystem')).toBeInTheDocument();
  });

  it('renders metric cards', () => {
    useDashboardStore.setState({
      metrics: mockMetrics,
      quickStats: [],
      alerts: [],
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Wallets')).toBeInTheDocument();
  });

  it('renders alerts when present', () => {
    useDashboardStore.setState({
      metrics: mockMetrics,
      quickStats: [],
      alerts: mockAlerts,
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText('High transaction volume')).toBeInTheDocument();
  });

  it('shows loading spinner when loading with no metrics', () => {
    useDashboardStore.setState({
      metrics: [],
      quickStats: [],
      alerts: [],
      isLoading: true,
      error: null,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    // Ant Design Spin renders with ant-spin class
    expect(document.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('renders mocked child components', () => {
    useDashboardStore.setState({
      metrics: mockMetrics,
      quickStats: [],
      alerts: [],
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('transaction-summary')).toBeInTheDocument();
    expect(screen.getByTestId('ai-chat')).toBeInTheDocument();
    expect(screen.getByTestId('load-guard-log')).toBeInTheDocument();
  });
});
