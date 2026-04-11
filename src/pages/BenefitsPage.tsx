import { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { PageHeader } from '../components/shared/PageHeader';
import { BulkLoadPanel } from '../components/benefits/BulkLoadPanel';
import { UtilisationDashboard } from '../components/benefits/UtilisationDashboard';
import { AiBenefitsInsight } from '../components/benefits/AiBenefitsInsight';
import { useUIStore } from '../store/ui.store';

// Mock utilisation data (matches backend sub-wallet-service.js getBenefitsUtilisationSummary)
function getMockUtilisation() {
  return {
    totalLoaded: 48500000,   // ₹4.85L
    totalSpent: 32100000,    // ₹3.21L
    utilisationRate: 66,
    expiringThisMonth: 850000, // ₹8,500
    byType: [
      { type: 'FOOD', loaded: 15000000, spent: 11200000, remaining: 3800000, utilisation: 75 },
      { type: 'NCMC TRANSIT', loaded: 8000000, spent: 4800000, remaining: 3200000, utilisation: 60 },
      { type: 'FASTAG', loaded: 6000000, spent: 3900000, remaining: 2100000, utilisation: 65 },
      { type: 'GIFT', loaded: 10000000, spent: 6500000, remaining: 3500000, utilisation: 65 },
      { type: 'FUEL', loaded: 9500000, spent: 5700000, remaining: 3800000, utilisation: 60 },
    ],
  };
}

export function BenefitsPage() {
  const { setBreadcrumbs } = useUIStore();
  const [utilisation, setUtilisation] = useState(getMockUtilisation());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setBreadcrumbs([{ title: 'Dashboard', path: '/' }, { title: 'Benefits Management' }]);
  }, [setBreadcrumbs]);

  const handleLoadComplete = () => {
    // Refresh utilisation data
    const data = getMockUtilisation();
    // Simulate slight increase in loaded amounts
    data.totalLoaded += 500000;
    data.byType[0].loaded += 300000;
    setUtilisation(data);
    setRefreshKey(k => k + 1);
  };

  return (
    <div>
      <PageHeader
        title="Benefits Management"
        subtitle="Manage corporate sub-wallets — Food, Transit, FASTag, Gift, Fuel"
      />

      <Row gutter={[16, 16]}>
        {/* Left: Bulk Load Panel */}
        <Col xs={24} lg={8}>
          <BulkLoadPanel totalUsers={147} onLoadComplete={handleLoadComplete} />
        </Col>

        {/* Right: AI Insight */}
        <Col xs={24} lg={16}>
          <AiBenefitsInsight key={refreshKey} utilisationData={utilisation} />
        </Col>
      </Row>

      {/* Utilisation Dashboard */}
      <div style={{ marginTop: 16 }}>
        <UtilisationDashboard
          totalLoaded={utilisation.totalLoaded}
          totalSpent={utilisation.totalSpent}
          utilisationRate={utilisation.utilisationRate}
          expiringThisMonth={utilisation.expiringThisMonth}
          byType={utilisation.byType}
        />
      </div>
    </div>
  );
}
