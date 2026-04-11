import { useState, useEffect } from 'react';
import { Card, Button, Spin } from 'antd';
import { BulbOutlined, ReloadOutlined } from '@ant-design/icons';

interface AiBenefitsInsightProps {
  utilisationData: {
    totalLoaded: number;
    totalSpent: number;
    utilisationRate: number;
    expiringThisMonth: number;
    byType: { type: string; loaded: number; spent: number; remaining: number; utilisation: number }[];
  };
}

function formatINR(paise: number): string {
  const rupees = Math.floor(paise / 100);
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}K`;
  return `₹${rupees.toLocaleString('en-IN')}`;
}

export function AiBenefitsInsight({ utilisationData }: AiBenefitsInsightProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const generateInsights = async () => {
    setLoading(true);

    // Build prompt data
    const summaryText = utilisationData.byType.map(t =>
      `${t.type}: Loaded ${formatINR(t.loaded)}, Spent ${formatINR(t.spent)}, Remaining ${formatINR(t.remaining)}, Utilisation ${t.utilisation}%`
    ).join('\n');

    const prompt = `Analyse this corporate benefits utilisation data and give 3 actionable insights for the HR/Finance team. Focus on: underutilised wallets, expiry risk, and employee engagement with benefits.\n\nOverall: Loaded ${formatINR(utilisationData.totalLoaded)}, Spent ${formatINR(utilisationData.totalSpent)}, Utilisation ${utilisationData.utilisationRate}%, Expiring this month: ${formatINR(utilisationData.expiringThisMonth)}\n\nBy Type:\n${summaryText}\n\nReturn exactly 3 bullet points, each starting with a clear action verb. Keep each under 2 sentences.`;

    try {
      // Try the API endpoint
      const RENDER_URL = import.meta.env.VITE_API_URL || '';
      const apiBase = RENDER_URL || 'http://localhost:3000';
      const res = await fetch(`${apiBase}/api/chat?role=admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });

      if (res.ok) {
        const data = await res.json();
        const lines = (data.reply || '')
          .split('\n')
          .filter((l: string) => l.trim().length > 10)
          .map((l: string) => l.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
          .filter((l: string) => l.length > 0)
          .slice(0, 3);

        if (lines.length > 0) {
          setInsights(lines);
          setHasLoaded(true);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fall through to fallback
    }

    // Fallback insights based on data
    const fallbackInsights: string[] = [];

    // Find most underutilised
    const sorted = [...utilisationData.byType].sort((a, b) => a.utilisation - b.utilisation);
    if (sorted.length > 0 && sorted[0].utilisation < 50) {
      fallbackInsights.push(
        `Increase ${sorted[0].type} wallet adoption — only ${sorted[0].utilisation}% utilised. Consider sending push notifications or running awareness campaigns about eligible merchants.`
      );
    } else {
      fallbackInsights.push(
        `Overall benefits utilisation is ${utilisationData.utilisationRate}% — strong engagement. Focus on maintaining this through regular reminders and new merchant partnerships.`
      );
    }

    if (utilisationData.expiringThisMonth > 0) {
      fallbackInsights.push(
        `Alert: ${formatINR(utilisationData.expiringThisMonth)} in Gift wallets expiring this month. Send reminders to affected employees to use their balance before expiry.`
      );
    } else {
      fallbackInsights.push(
        `No Gift wallet balances expiring this month. Schedule a proactive notification 30 days before next batch expiry to maximise usage.`
      );
    }

    const fuelData = utilisationData.byType.find(t => t.type === 'FUEL');
    if (fuelData && fuelData.utilisation > 80) {
      fallbackInsights.push(
        `Fuel wallet shows ${fuelData.utilisation}% utilisation — consider increasing the monthly limit from ₹2,500 to ₹3,500 based on high demand from employees.`
      );
    } else {
      fallbackInsights.push(
        `Review monthly limits across all benefit types quarterly. Adjust based on actual usage patterns to optimise budget allocation and employee satisfaction.`
      );
    }

    setInsights(fallbackInsights);
    setHasLoaded(true);
    setLoading(false);
  };

  useEffect(() => {
    if (!hasLoaded) {
      generateInsights();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BulbOutlined style={{ color: '#F97316' }} />
          <span>AI Benefits Insight</span>
        </div>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          size="small"
          onClick={generateInsights}
          loading={loading}
        >
          Refresh
        </Button>
      }
      style={{ borderRadius: 12 }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Spin />
          <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>Analysing benefits data...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {insights.map((insight, i) => (
            <div key={i} style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: i === 0 ? '#FFF7ED' : i === 1 ? '#FEF3F2' : '#F0FDF4',
              borderLeft: `3px solid ${i === 0 ? '#F97316' : i === 1 ? '#F04438' : '#12B76A'}`,
            }}>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: '#333', margin: 0 }}>
                {insight}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
