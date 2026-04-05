import { Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { SparklineChart } from './SparklineChart';
import type { DashboardMetric } from '../../types/analytics.types';

interface MetricCardProps {
  metric: DashboardMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  const isPositive = metric.change >= 0;

  return (
    <Card
      bordered={false}
      style={{ borderRadius: 12 }}
      bodyStyle={{ padding: 20 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-paytm-muted mb-1">{metric.label}</div>
          <div className="text-2xl font-bold text-paytm-text">{metric.value}</div>
          <div className="flex items-center gap-1 mt-2">
            <span
              className="flex items-center gap-0.5 text-xs font-medium"
              style={{ color: isPositive ? '#12B76A' : '#F04438' }}
            >
              {isPositive ? <ArrowUpOutlined style={{ fontSize: 10 }} /> : <ArrowDownOutlined style={{ fontSize: 10 }} />}
              {Math.abs(metric.change)}%
            </span>
            <span className="text-xs text-paytm-muted">{metric.changeLabel}</span>
          </div>
        </div>
        <SparklineChart data={metric.sparkData} color={metric.color} />
      </div>
    </Card>
  );
}
