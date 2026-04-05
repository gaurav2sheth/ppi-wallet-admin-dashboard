import { Card, Button, Select, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ROLE_LABELS, type AdminRole } from '../utils/permissions';

const { Title, Text } = Typography;

const ROLES: AdminRole[] = [
  'SUPER_ADMIN', 'BUSINESS_ADMIN', 'OPS_MANAGER',
  'CS_AGENT', 'COMPLIANCE_OFFICER', 'MARKETING_MANAGER',
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleLogin = (role: AdminRole) => {
    login(role);
    navigate('/');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #002E6E 0%, #004A8F 50%, #00B9F1 100%)' }}
    >
      <Card
        bordered={false}
        style={{ width: 420, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        bodyStyle={{ padding: 40 }}
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-[#002E6E] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <Title level={3} style={{ margin: 0, color: '#002E6E' }}>PPI Wallet Admin</Title>
          <Text type="secondary" className="mt-1 block">Select your role to access the dashboard</Text>
        </div>

        <div className="space-y-3">
          {ROLES.map(role => (
            <Button
              key={role}
              block
              size="large"
              onClick={() => handleLogin(role)}
              style={{
                height: 48,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left',
              }}
            >
              <span className="font-medium">{ROLE_LABELS[role]}</span>
              <span className="text-xs text-gray-400">{role.replace(/_/g, ' ')}</span>
            </Button>
          ))}
        </div>

        <div className="text-center mt-6">
          <Text type="secondary" style={{ fontSize: 12 }}>
            Demo mode \u2014 Select any role to explore the dashboard
          </Text>
        </div>
      </Card>
    </div>
  );
}
