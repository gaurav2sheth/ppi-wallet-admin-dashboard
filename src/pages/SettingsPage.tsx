import { useEffect } from 'react';
import { Card, Descriptions, Tag } from 'antd';
import { PageHeader } from '../components/shared/PageHeader';
import { useAuthStore } from '../store/auth.store';
import { useUIStore } from '../store/ui.store';
import { ROLE_LABELS, ROLE_COLORS } from '../utils/permissions';

export function SettingsPage() {
  const { admin, role, permissions } = useAuthStore();
  const { setBreadcrumbs } = useUIStore();

  useEffect(() => {
    setBreadcrumbs([{ title: 'Dashboard', path: '/' }, { title: 'Settings' }]);
  }, [setBreadcrumbs]);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Admin account and system configuration" />

      <Card bordered={false} title="Admin Profile" style={{ borderRadius: 12, marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="Name">{admin?.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{admin?.email}</Descriptions.Item>
          <Descriptions.Item label="Role">
            <Tag color={role ? ROLE_COLORS[role] : undefined}>
              {role ? ROLE_LABELS[role] : 'Unknown'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color="success">Active</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card bordered={false} title="Permissions" style={{ borderRadius: 12 }}>
        <div className="flex flex-wrap gap-2">
          {permissions.map(p => (
            <Tag key={p} color="blue" style={{ borderRadius: 6 }}>{p}</Tag>
          ))}
        </div>
      </Card>
    </div>
  );
}
