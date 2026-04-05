import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Descriptions, Table, Tag, Button, Spin, Modal, Space, Timeline } from 'antd';
import { ArrowLeftOutlined, StopOutlined, CheckCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusTag } from '../components/shared/StatusTag';
import { RbacGate } from '../components/shared/RbacGate';
import { useUsersStore } from '../store/users.store';
import { useAuthStore } from '../store/auth.store';
import { useUIStore } from '../store/ui.store';
import { WALLET_STATE_CONFIG, KYC_STATE_CONFIG, KYC_TIER_CONFIG } from '../utils/constants';
import { formatPaise, formatDate, formatDateShort, maskPhone, maskName, truncateId } from '../utils/format';
import type { WalletState } from '../types/user.types';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedUser: user, isDetailLoading, fetchUserDetail, updateUserStatus, clearSelectedUser } = useUsersStore();
  const { maskPII } = useAuthStore();
  const { setBreadcrumbs } = useUIStore();

  useEffect(() => {
    if (id) fetchUserDetail(id);
    return () => clearSelectedUser();
  }, [id, fetchUserDetail, clearSelectedUser]);

  useEffect(() => {
    setBreadcrumbs([
      { title: 'Dashboard', path: '/' },
      { title: 'Users', path: '/users' },
      { title: user?.name ?? 'Detail' },
    ]);
  }, [user, setBreadcrumbs]);

  if (isDetailLoading || !user) {
    return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  }

  const handleStatusChange = (newState: WalletState) => {
    Modal.confirm({
      title: `Change wallet status to ${newState}?`,
      content: `This will ${newState === 'SUSPENDED' ? 'suspend' : newState === 'ACTIVE' ? 'activate' : 'update'} the wallet for ${user.name}.`,
      onOk: () => updateUserStatus(user.id, newState),
    });
  };

  const displayName = maskPII ? maskName(user.name) : user.name;
  const displayPhone = maskPII ? maskPhone(user.phone) : user.phone;

  return (
    <div>
      <PageHeader
        title={displayName}
        subtitle={`Wallet: ${user.walletId}`}
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/users')}>Back to Users</Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card bordered={false} title="Profile Information" style={{ borderRadius: 12, marginBottom: 16 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Name">{displayName}</Descriptions.Item>
              <Descriptions.Item label="Phone">{displayPhone}</Descriptions.Item>
              <Descriptions.Item label="User ID">{truncateId(user.userId, 16)}</Descriptions.Item>
              <Descriptions.Item label="Wallet ID">{user.walletId}</Descriptions.Item>
              <Descriptions.Item label="Created">{formatDateShort(user.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Last Active">{user.lastActivityAt ? formatDate(user.lastActivityAt) : 'Never'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card bordered={false} title="Recent Transactions" style={{ borderRadius: 12 }}>
            <Table
              dataSource={user.recentTransactions}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                { title: 'Type', dataIndex: 'entryType', width: 80, render: (v: string) => <Tag color={v === 'CREDIT' ? 'green' : v === 'DEBIT' ? 'red' : 'default'}>{v}</Tag> },
                { title: 'Amount', dataIndex: 'amountPaise', width: 120, render: (v: string) => formatPaise(v) },
                { title: 'Description', dataIndex: 'description', ellipsis: true },
                { title: 'Date', dataIndex: 'createdAt', width: 150, render: (v: string) => formatDate(v) },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card bordered={false} title="Wallet Status" style={{ borderRadius: 12, marginBottom: 16 }}>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <StatusTag status={user.walletState} config={WALLET_STATE_CONFIG} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">KYC Tier</span>
                <StatusTag status={user.kycTier} config={KYC_TIER_CONFIG} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">KYC State</span>
                <StatusTag status={user.kycState} config={KYC_STATE_CONFIG} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Balance</span>
                <span className="font-semibold">{formatPaise(user.availablePaise)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Held</span>
                <span>{formatPaise(user.heldPaise)}</span>
              </div>
              {user.walletExpiryDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Expiry</span>
                  <span className="text-xs">{formatDateShort(user.walletExpiryDate)}</span>
                </div>
              )}
            </div>

            <RbacGate permission="users.edit">
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Space wrap>
                  {user.walletState !== 'ACTIVE' && (
                    <Button size="small" icon={<CheckCircleOutlined />} onClick={() => handleStatusChange('ACTIVE')}>
                      Activate
                    </Button>
                  )}
                  {user.walletState === 'ACTIVE' && (
                    <Button size="small" icon={<PauseCircleOutlined />} danger onClick={() => handleStatusChange('SUSPENDED')}>
                      Suspend
                    </Button>
                  )}
                </Space>
              </div>
            </RbacGate>
          </Card>

          {user.kycProfile && (
            <Card bordered={false} title="KYC Audit Trail" style={{ borderRadius: 12 }}>
              <Timeline
                items={user.kycProfile.auditLogs.map(log => ({
                  color: log.toState === 'FULL_KYC' ? 'green' : log.toState === 'REJECTED' ? 'red' : 'blue',
                  children: (
                    <div>
                      <div className="text-sm font-medium">{log.event.replace(/_/g, ' ')}</div>
                      {log.fromState && <div className="text-xs text-gray-400">{log.fromState} → {log.toState}</div>}
                      <div className="text-xs text-gray-400">{formatDate(log.createdAt)}</div>
                    </div>
                  ),
                }))}
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
