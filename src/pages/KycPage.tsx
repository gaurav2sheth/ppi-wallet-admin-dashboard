import { useEffect } from 'react';
import { Card, Row, Col, Spin } from 'antd';
import { PageHeader } from '../components/shared/PageHeader';
import { KycOverviewCards } from '../components/kyc/KycOverviewCards';
import { KycPieChart } from '../components/kyc/KycPieChart';
import { KycQueue } from '../components/kyc/KycQueue';
import { KycAlertPanel } from '../components/kyc/KycAlertPanel';
import { KycAgentPanel } from '../components/kyc/KycAgentPanel';
import { useKycStore } from '../store/kyc.store';
import { useUIStore } from '../store/ui.store';

export function KycPage() {
  const { stats, queue, isLoading, isQueueLoading, fetchStats, fetchQueue } = useKycStore();
  const { setBreadcrumbs } = useUIStore();

  useEffect(() => {
    setBreadcrumbs([{ title: 'Dashboard', path: '/' }, { title: 'KYC Management' }]);
    fetchStats();
    fetchQueue();
  }, [fetchStats, fetchQueue, setBreadcrumbs]);

  if (isLoading && !stats) {
    return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  }

  return (
    <div>
      <PageHeader title="KYC Management" subtitle="Monitor KYC verification status and manage the verification queue" />

      {stats && <KycOverviewCards stats={stats} />}

      {/* KYC Expiry Alert System — AI-powered outreach */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24}>
          <KycAlertPanel />
        </Col>
      </Row>

      {/* KYC Upgrade Agent — AI agent control panel */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <KycAgentPanel />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} lg={10}>
          <Card bordered={false} title="KYC Distribution" style={{ borderRadius: 12 }}>
            {stats && <KycPieChart distribution={stats.distribution} />}
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card bordered={false} title="Pending Verification Queue" style={{ borderRadius: 12 }}>
            <KycQueue queue={queue} loading={isQueueLoading} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
