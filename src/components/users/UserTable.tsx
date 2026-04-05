import { Table, Avatar } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useUsersStore } from '../../store/users.store';
import { useAuthStore } from '../../store/auth.store';
import { StatusTag } from '../shared/StatusTag';
import { WALLET_STATE_CONFIG, KYC_TIER_CONFIG } from '../../utils/constants';
import { formatPaise, formatDateShort, formatRelative, getInitials, maskPhone, maskName } from '../../utils/format';
import type { WalletUser } from '../../types/user.types';

export function UserTable() {
  const navigate = useNavigate();
  const { users, total, filters, isLoading, setFilters } = useUsersStore();
  const { maskPII } = useAuthStore();

  const columns: ColumnsType<WalletUser> = [
    {
      title: 'User',
      key: 'user',
      width: 220,
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <Avatar size={32} style={{ backgroundColor: '#002E6E', fontSize: 12 }}>
            {getInitials(r.name)}
          </Avatar>
          <div>
            <div className="font-medium text-sm">{maskPII ? maskName(r.name) : r.name}</div>
            <div className="text-xs text-gray-400">{maskPII ? maskPhone(r.phone) : r.phone}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Wallet ID',
      dataIndex: 'walletId',
      width: 150,
      render: (v: string) => <span className="text-xs font-mono">{v}</span>,
    },
    {
      title: 'KYC Tier',
      dataIndex: 'kycTier',
      width: 110,
      render: (v: string) => <StatusTag status={v} config={KYC_TIER_CONFIG} />,
    },
    {
      title: 'Balance',
      dataIndex: 'availablePaise',
      width: 130,
      sorter: true,
      render: (v: string) => <span className="font-medium">{formatPaise(v)}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'walletState',
      width: 120,
      render: (v: string) => <StatusTag status={v} config={WALLET_STATE_CONFIG} />,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      width: 120,
      sorter: true,
      render: (v: string) => <span className="text-xs">{formatDateShort(v)}</span>,
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActivityAt',
      width: 130,
      render: (v: string | null) => <span className="text-xs text-gray-500">{v ? formatRelative(v) : 'Never'}</span>,
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig, _: unknown, sorter: unknown) => {
    const s = sorter as { field?: string; order?: 'ascend' | 'descend' };
    setFilters({
      page: pagination.current ?? 1,
      pageSize: pagination.pageSize ?? 20,
      ...(s.field ? { sortField: s.field, sortOrder: s.order ?? 'descend' } : {}),
    });
  };

  return (
    <Table<WalletUser>
      columns={columns}
      dataSource={users}
      rowKey="id"
      loading={isLoading}
      pagination={{
        current: filters.page,
        pageSize: filters.pageSize,
        total,
        showSizeChanger: true,
        showTotal: (t) => `${t} users`,
      }}
      onChange={handleTableChange}
      onRow={(record) => ({
        onClick: () => navigate(`/users/${record.id}`),
        style: { cursor: 'pointer' },
      })}
      size="middle"
      scroll={{ x: 980 }}
    />
  );
}
