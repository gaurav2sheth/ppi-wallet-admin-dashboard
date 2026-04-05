import { useEffect } from 'react';
import { Card, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { PageHeader } from '../components/shared/PageHeader';
import { UserFiltersBar } from '../components/users/UserFiltersBar';
import { UserTable } from '../components/users/UserTable';
import { RbacGate } from '../components/shared/RbacGate';
import { useUsersStore } from '../store/users.store';
import { useUIStore } from '../store/ui.store';

export function UsersPage() {
  const { fetchUsers } = useUsersStore();
  const { setBreadcrumbs } = useUIStore();

  useEffect(() => {
    setBreadcrumbs([{ title: 'Dashboard', path: '/' }, { title: 'Users' }]);
    fetchUsers();
  }, [fetchUsers, setBreadcrumbs]);

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="View and manage all wallet users"
        actions={
          <RbacGate permission="users.export">
            <Button icon={<DownloadOutlined />}>Export CSV</Button>
          </RbacGate>
        }
      />
      <Card bordered={false} style={{ borderRadius: 12 }} bodyStyle={{ padding: '16px 20px' }}>
        <UserFiltersBar />
        <UserTable />
      </Card>
    </div>
  );
}
