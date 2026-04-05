import ReactECharts from 'echarts-for-react';
import type { KycDistributionItem } from '../../types/analytics.types';

const KYC_STATE_LABELS: Record<string, string> = {
  FULL_KYC: 'Full KYC',
  MIN_KYC: 'Minimum KYC',
  FULL_KYC_PENDING: 'Pending',
  REJECTED: 'Rejected',
  UNVERIFIED: 'Unverified',
  SUSPENDED: 'Suspended',
};

interface KycPieChartProps {
  distribution: KycDistributionItem[];
}

export function KycPieChart({ distribution }: KycPieChartProps) {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { fontSize: 12 },
    },
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' },
      },
      data: distribution.map(d => ({
        name: KYC_STATE_LABELS[d.state] ?? d.state,
        value: d.count,
        itemStyle: { color: d.color },
      })),
    }],
  };

  return <ReactECharts option={option} style={{ height: 280 }} opts={{ renderer: 'svg' }} />;
}
