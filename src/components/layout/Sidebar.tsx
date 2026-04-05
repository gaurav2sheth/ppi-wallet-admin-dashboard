import { Layout, Menu } from 'antd';
import {
  DashboardOutlined, UserOutlined, SwapOutlined, SafetyCertificateOutlined,
  BarChartOutlined, SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { ROUTES } from '../../utils/constants';
import type { Permission } from '../../utils/permissions';

const { Sider } = Layout;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  permission: Permission;
}

const MENU_ITEMS: MenuItem[] = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard', path: ROUTES.DASHBOARD, permission: 'dashboard.view' },
  { key: 'users', icon: <UserOutlined />, label: 'Users', path: ROUTES.USERS, permission: 'users.view' },
  { key: 'transactions', icon: <SwapOutlined />, label: 'Transactions', path: ROUTES.TRANSACTIONS, permission: 'transactions.view' },
  { key: 'kyc', icon: <SafetyCertificateOutlined />, label: 'KYC Management', path: ROUTES.KYC, permission: 'kyc.view' },
  { key: 'analytics', icon: <BarChartOutlined />, label: 'Analytics', path: ROUTES.ANALYTICS, permission: 'analytics.view' },
  { key: 'settings', icon: <SettingOutlined />, label: 'Settings', path: ROUTES.SETTINGS, permission: 'settings.view' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const filteredItems = MENU_ITEMS.filter(item => hasPermission(item.permission));

  const selectedKey = filteredItems.find(item =>
    item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
  )?.key ?? 'dashboard';

  return (
    <Sider
      collapsible
      collapsed={sidebarCollapsed}
      onCollapse={toggleSidebar}
      width={240}
      collapsedWidth={64}
      className="admin-sidebar"
      style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}
    >
      <div className="flex items-center justify-center py-4 px-3" style={{ height: 64 }}>
        {sidebarCollapsed ? (
          <div className="w-8 h-8 rounded-lg bg-[#00B9F1] flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00B9F1] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <div className="text-white font-semibold text-sm leading-tight">PPI Wallet</div>
              <div className="text-[#B0C4DE] text-[10px] leading-tight">Admin Dashboard</div>
            </div>
          </div>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={filteredItems.map(item => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
        }))}
        onClick={({ key }) => {
          const item = filteredItems.find(i => i.key === key);
          if (item) navigate(item.path);
        }}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
}
