import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import { useAuthStore } from '../../store/auth.store';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      admin: null,
      role: null,
      permissions: [],
      maskPII: false,
    });
    mockNavigate.mockClear();
  });

  it('renders the login page with title', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText('PPI Wallet Admin')).toBeInTheDocument();
    expect(screen.getByText(/Select your role/i)).toBeInTheDocument();
  });

  it('renders a button for each admin role', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByText('Business Admin')).toBeInTheDocument();
    expect(screen.getByText('Operations Manager')).toBeInTheDocument();
    expect(screen.getByText('Customer Support')).toBeInTheDocument();
    expect(screen.getByText('Compliance Officer')).toBeInTheDocument();
    expect(screen.getByText('Marketing Manager')).toBeInTheDocument();
  });

  it('clicking a role button calls login and navigates to /', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.click(screen.getByText('Super Admin'));

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.role).toBe('SUPER_ADMIN');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('clicking CS Agent role logs in with correct role', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.click(screen.getByText('Customer Support'));

    const state = useAuthStore.getState();
    expect(state.role).toBe('CS_AGENT');
    expect(state.admin!.name).toBe('Neha Gupta');
  });

  it('redirects to / if already authenticated', () => {
    useAuthStore.setState({ isAuthenticated: true, role: 'SUPER_ADMIN' });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('shows demo mode text', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Demo mode/i)).toBeInTheDocument();
  });
});
