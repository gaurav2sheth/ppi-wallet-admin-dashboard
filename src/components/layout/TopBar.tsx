import { Layout, Breadcrumb, Avatar, Dropdown, Tag } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { ROLE_LABELS, ROLE_COLORS } from '../../utils/permissions';
import { getInitials } from '../../utils/format';

const { Header } = Layout;

export function TopBar() {
  const navigate = useNavigate();
  const { admin, role, logout } = useAuthStore();
  const { breadcrumbs } = useUIStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dropdownItems = {
    items: [
      {
        key: 'role',
        label: (
          <div className="px-1 py-1">
            <div className="text-xs text-gray-500">Logged in as</div>
            <div className="font-medium">{admin?.name}</div>
            <Tag color={role ? ROLE_COLORS[role] : undefined} className="mt-1" style={{ fontSize: 11 }}>
              {role ? ROLE_LABELS[role] : ''}
            </Tag>
          </div>
        ),
        disabled: true,
      },
      { type: 'divider' as const },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Header
      className="flex items-center justify-between px-6"
      style={{
        background: '#fff',
        borderBottom: '1px solid #D0D5DD',
        height: 64,
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 99,
      }}
    >
      <Breadcrumb
        items={breadcrumbs.map(b => ({
          title: b.path ? <a onClick={() => navigate(b.path!)}>{b.title}</a> : b.title,
        }))}
      />

      <div className="flex items-center gap-3">
        {role && (
          <Tag
            color={ROLE_COLORS[role]}
            style={{ fontSize: 11, margin: 0, borderRadius: 6 }}
          >
            {ROLE_LABELS[role]}
          </Tag>
        )}
        <Dropdown menu={dropdownItems} trigger={['click']} placement="bottomRight">
          <Avatar
            size={36}
            style={{ backgroundColor: role ? ROLE_COLORS[role] : '#002E6E', cursor: 'pointer' }}
            icon={admin ? undefined : <UserOutlined />}
          >
            {admin ? getInitials(admin.name) : ''}
          </Avatar>
        </Dropdown>
      </div>
    </Header>
  );
}
