import { Card, Row, Col, Statistic } from 'antd';
import { SafetyCertificateOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { KycStats } from '../../types/analytics.types';

interface KycOverviewCardsProps {
  stats: KycStats;
}

export function KycOverviewCards({ stats }: KycOverviewCardsProps) {
  return (
    <Row gutter={[16, 16]} className="mb-4">
      <Col xs={12} lg={6}>
        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Statistic
            title="Total Users"
            value={stats.totalUsers}
            prefix={<SafetyCertificateOutlined style={{ color: '#002E6E' }} />}
          />
        </Card>
      </Col>
      <Col xs={12} lg={6}>
        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Statistic
            title="Pending Verification"
            value={stats.pendingCount}
            prefix={<ClockCircleOutlined style={{ color: '#F79009' }} />}
            valueStyle={{ color: '#F79009' }}
          />
        </Card>
      </Col>
      <Col xs={12} lg={6}>
        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Statistic
            title="Full KYC Rate"
            value={stats.successRate}
            suffix="%"
            prefix={<CheckCircleOutlined style={{ color: '#12B76A' }} />}
            valueStyle={{ color: '#12B76A' }}
          />
        </Card>
      </Col>
      <Col xs={12} lg={6}>
        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Statistic
            title="Rejection Rate"
            value={stats.failureRate}
            suffix="%"
            prefix={<CloseCircleOutlined style={{ color: '#F04438' }} />}
            valueStyle={{ color: '#F04438' }}
          />
        </Card>
      </Col>
    </Row>
  );
}
