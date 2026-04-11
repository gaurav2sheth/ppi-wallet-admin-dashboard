import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Tag, Empty } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import axios from 'axios';

interface BlockedAttempt {
  user_id: string;
  name: string;
  attempted_amount: number;
  blocked_by: string;
  max_allowed: number;
  timestamp: string;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export function LoadGuardLog() {
  const [attempts, setAttempts] = useState<BlockedAttempt[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLog = useCallback(async () => {
    setLoading(true);
    try {
      // Try vite dev middleware first, then API server
      let data;
      try {
        const res = await axios.get('/api/wallet/load-guard-log');
        data = res.data;
      } catch {
        if (API_BASE) {
          const res = await axios.get(`${API_BASE}/api/wallet/load-guard-log`);
          data = res.data;
        }
      }
      if (data?.attempts) setAttempts(data.attempts);
    } catch {
      // Silently fail — panel just shows empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLog(); }, [fetchLog]);

  const columns = [
    {
      title: 'User',
      key: 'user',
      width: 160,
      render: (_: unknown, r: BlockedAttempt) => (
        <div>
          <div className="font-medium text-sm">{r.name}</div>
          <div className="text-xs text-gray-400">{r.user_id}</div>
        </div>
      ),
    },
    {
      title: 'Attempted',
      dataIndex: 'attempted_amount',
      key: 'attempted_amount',
      width: 110,
      render: (v: number) => <span className="font-medium">₹{v.toLocaleString('en-IN')}</span>,
    },
    {
      title: 'Blocked By',
      dataIndex: 'blocked_by',
      key: 'blocked_by',
      width: 130,
      render: (v: string) => {
        const color = v === 'BALANCE_CAP' ? 'red' : v === 'MONTHLY_LOAD' ? 'orange' : 'volcano';
        const label = v === 'BALANCE_CAP' ? 'Balance Cap' : v === 'MONTHLY_LOAD' ? 'Monthly Limit' : 'Min KYC Cap';
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Max Allowed',
      dataIndex: 'max_allowed',
      key: 'max_allowed',
      width: 110,
      render: (v: number) => (
        <span className={v === 0 ? 'text-red-500 font-medium' : 'text-green-600 font-medium'}>
          {v === 0 ? 'None' : `₹${v.toLocaleString('en-IN')}`}
        </span>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (v: string) => (
        <span className="text-xs text-gray-500">
          {new Date(v).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
        </span>
      ),
    },
  ];

  return (
    <Card
      bordered={false}
      style={{ borderRadius: 12 }}
      title={
        <div className="flex items-center gap-2">
          <SafetyOutlined style={{ color: '#ff4d4f' }} />
          <span>Load Guard Log</span>
          <span className="text-xs text-gray-400 font-normal ml-1">Last 10 blocked attempts</span>
        </div>
      }
    >
      {attempts.length === 0 && !loading ? (
        <Empty description="No blocked load attempts yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Table
          dataSource={attempts}
          columns={columns}
          rowKey={(r) => `${r.user_id}-${r.timestamp}`}
          loading={loading}
          pagination={false}
          size="small"
          scroll={{ x: 600 }}
        />
      )}
    </Card>
  );
}
