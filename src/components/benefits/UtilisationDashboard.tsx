import { Card, Table, Tag, Statistic, Row, Col } from 'antd';
import {
  DollarOutlined, RiseOutlined, PercentageOutlined, ClockCircleOutlined,
} from '@ant-design/icons';

const SUB_WALLET_META: Record<string, { icon: string; color: string }> = {
  FOOD: { icon: '🍱', color: '#F97316' },
  'NCMC TRANSIT': { icon: '🚇', color: '#6366F1' },
  FASTAG: { icon: '🛣️', color: '#10B981' },
  GIFT: { icon: '🎁', color: '#EC4899' },
  FUEL: { icon: '⛽', color: '#EAB308' },
};

interface TypeBreakdown {
  type: string;
  loaded: number;
  spent: number;
  remaining: number;
  utilisation: number;
}

interface UtilisationDashboardProps {
  totalLoaded: number;
  totalSpent: number;
  utilisationRate: number;
  expiringThisMonth: number;
  byType: TypeBreakdown[];
}

function formatINR(paise: number): string {
  const rupees = Math.floor(paise / 100);
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}K`;
  return `₹${rupees.toLocaleString('en-IN')}`;
}

export function UtilisationDashboard({
  totalLoaded, totalSpent, utilisationRate, expiringThisMonth, byType,
}: UtilisationDashboardProps) {
  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const meta = SUB_WALLET_META[type];
        return (
          <span style={{ fontWeight: 600 }}>
            {meta?.icon} {type}
          </span>
        );
      },
    },
    {
      title: 'Loaded',
      dataIndex: 'loaded',
      key: 'loaded',
      render: (v: number) => formatINR(v),
    },
    {
      title: 'Spent',
      dataIndex: 'spent',
      key: 'spent',
      render: (v: number) => formatINR(v),
    },
    {
      title: 'Remaining',
      dataIndex: 'remaining',
      key: 'remaining',
      render: (v: number) => formatINR(v),
    },
    {
      title: 'Utilisation',
      dataIndex: 'utilisation',
      key: 'utilisation',
      render: (v: number) => {
        let color = '#12B76A';
        if (v < 30) color = '#F04438';
        else if (v < 60) color = '#F79009';
        return <Tag color={color}>{v}%</Tag>;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 4 Metric Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Benefits Loaded"
              value={formatINR(totalLoaded)}
              prefix={<DollarOutlined style={{ color: '#00B9F1' }} />}
              valueStyle={{ color: '#002E6E', fontSize: 22 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Benefits Spent"
              value={formatINR(totalSpent)}
              prefix={<RiseOutlined style={{ color: '#12B76A' }} />}
              valueStyle={{ color: '#12B76A', fontSize: 22 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Utilisation Rate"
              value={utilisationRate}
              suffix="%"
              prefix={<PercentageOutlined style={{ color: '#F97316' }} />}
              valueStyle={{ color: '#F97316', fontSize: 22 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Expiring This Month"
              value={formatINR(expiringThisMonth)}
              prefix={<ClockCircleOutlined style={{ color: '#F04438' }} />}
              valueStyle={{ color: '#F04438', fontSize: 22 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Utilisation Table */}
      <Card title="Utilisation by Sub-Wallet Type" style={{ borderRadius: 12 }}>
        <Table
          dataSource={byType}
          columns={columns}
          rowKey="type"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
