import { useEffect } from 'react';
import { Row, Col, Alert, Spin } from 'antd';
import { MetricCard } from '../components/dashboard/MetricCard';
import { QuickStats } from '../components/dashboard/QuickStats';
import { TransactionSummaryCard } from '../components/dashboard/TransactionSummaryCard';
import { AiChatCard } from '../components/dashboard/AiChatCard';
import { LoadGuardLog } from '../components/dashboard/LoadGuardLog';
import { PageHeader } from '../components/shared/PageHeader';
import { useDashboardStore } from '../store/dashboard.store';
import { useUIStore } from '../store/ui.store';

export function DashboardPage() {
  const { metrics, quickStats, alerts, isLoading, fetchOverview } = useDashboardStore();
  const { setBreadcrumbs } = useUIStore();

  useEffect(() => {
    setBreadcrumbs([{ title: 'Dashboard' }]);
    fetchOverview();
  }, [fetchOverview, setBreadcrumbs]);

  if (isLoading && metrics.length === 0) {
    return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  }

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your wallet ecosystem" />

      {alerts.map(alert => (
        <Alert
          key={alert.id}
          message={alert.title}
          description={alert.message}
          type={alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}
          showIcon
          closable
          className="mb-4"
          style={{ borderRadius: 10 }}
        />
      ))}

      <Row gutter={[16, 16]} className="mb-4">
        {metrics.map((metric) => (
          <Col key={metric.label} xs={24} sm={12} lg={8}>
            <MetricCard metric={metric} />
          </Col>
        ))}
      </Row>

      <QuickStats stats={quickStats} />

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={16}>
          <TransactionSummaryCard />
        </Col>
        <Col xs={24} lg={8}>
          <AiChatCard />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24}>
          <LoadGuardLog />
        </Col>
      </Row>
    </div>
  );
}
