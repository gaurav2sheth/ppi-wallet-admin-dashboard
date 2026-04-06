import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { paytmTheme } from './theme/paytm.theme';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminAuthGuard } from './components/layout/AdminAuthGuard';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { KycPage } from './pages/KycPage';
import { SettingsPage } from './pages/SettingsPage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <ConfigProvider theme={paytmTheme}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<AdminAuthGuard />}>
            <Route element={<AdminLayout />}>
              {/* Dashboard - all roles */}
              <Route path="/" element={<DashboardPage />} />

              {/* Users - requires users.view */}
              <Route element={<AdminAuthGuard permission="users.view" />}>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/:id" element={<UserDetailPage />} />
              </Route>

              {/* Transactions - requires transactions.view */}
              <Route element={<AdminAuthGuard permission="transactions.view" />}>
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/transactions/:id" element={<TransactionDetailPage />} />
              </Route>

              {/* KYC - requires kyc.view */}
              <Route element={<AdminAuthGuard permission="kyc.view" />}>
                <Route path="/kyc" element={<KycPage />} />
              </Route>

              {/* Settings - requires settings.view */}
              <Route element={<AdminAuthGuard permission="settings.view" />}>
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Error pages */}
              <Route path="/403" element={<ForbiddenPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
