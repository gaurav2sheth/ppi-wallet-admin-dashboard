import { Table, Tag, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { KycQueueItem } from '../../types/analytics.types';
import { RbacGate } from '../shared/RbacGate';
import { useAuthStore } from '../../store/auth.store';
import { formatDate, maskPhone, maskName } from '../../utils/format';

interface KycQueueProps {
  queue: KycQueueItem[];
  loading: boolean;
}

export function KycQueue({ queue, loading }: KycQueueProps) {
  const { maskPII } = useAuthStore();

  const columns: ColumnsType<KycQueueItem> = [
    {
      title: 'User',
      key: 'user',
      width: 180,
      render: (_, r) => (
        <div>
          <div className="font-medium text-sm">{maskPII ? maskName(r.userName) : r.userName}</div>
          <div className="text-xs text-gray-400">{maskPII ? maskPhone(r.userPhone) : r.userPhone}</div>
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
      title: 'Aadhaar Verified',
      dataIndex: 'aadhaarVerified',
      width: 130,
      render: (v: boolean) => v
        ? <Tag color="success">Verified</Tag>
        : <Tag color="warning">Pending</Tag>,
    },
    {
      title: 'PAN',
      dataIndex: 'panMasked',
      width: 130,
      render: (v: string | null) => v ? <span className="font-mono text-xs">{v}</span> : <Tag>Not provided</Tag>,
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      width: 160,
      render: (v: string) => <span className="text-xs">{formatDate(v)}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: () => (
        <RbacGate permission="kyc.approve">
          <Space>
            <Button size="small" type="primary" icon={<CheckOutlined />} style={{ borderRadius: 6 }}>
              Approve
            </Button>
            <Button size="small" danger icon={<CloseOutlined />} style={{ borderRadius: 6 }}>
              Reject
            </Button>
          </Space>
        </RbacGate>
      ),
    },
  ];

  return (
    <Table<KycQueueItem>
      columns={columns}
      dataSource={queue}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: false }}
      size="middle"
      scroll={{ x: 910 }}
    />
  );
}
