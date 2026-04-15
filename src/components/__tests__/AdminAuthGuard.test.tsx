import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminAuthGuard } from '../layout/AdminAuthGuard';
import { useAuthStore } from '../../store/auth.store';

function renderWithRouter(permission?: string, initialPath = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/403" element={<div>Forbidden Page</div>} />
        <Route element={<AdminAuthGuard permission={permission as any} />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminAuthGuard', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      admin: null,
      role: null,
      permissions: [],
      maskPII: false,
    });
  });

  it('redirects to /login when not authenticated', () => {
    renderWithRouter();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated (no permission required)', () => {
    useAuthStore.getState().login('SUPER_ADMIN');
    renderWithRouter();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when authenticated with correct permission', () => {
    useAuthStore.getState().login('SUPER_ADMIN');
    renderWithRouter('users.view');
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /403 when authenticated but missing permission', () => {
    useAuthStore.getState().login('MARKETING_MANAGER');
    renderWithRouter('users.view'); // MARKETING_MANAGER does not have users.view
    expect(screen.getByText('Forbidden Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('CS_AGENT can access routes with transactions.view permission', () => {
    useAuthStore.getState().login('CS_AGENT');
    renderWithRouter('transactions.view');
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('CS_AGENT cannot access routes with users.edit permission', () => {
    useAuthStore.getState().login('CS_AGENT');
    renderWithRouter('users.edit');
    expect(screen.getByText('Forbidden Page')).toBeInTheDocument();
  });

  it('OPS_MANAGER can access routes with kyc.approve permission', () => {
    useAuthStore.getState().login('OPS_MANAGER');
    renderWithRouter('kyc.approve');
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('BUSINESS_ADMIN cannot access routes with kyc.approve permission', () => {
    useAuthStore.getState().login('BUSINESS_ADMIN');
    renderWithRouter('kyc.approve');
    expect(screen.getByText('Forbidden Page')).toBeInTheDocument();
  });
});
