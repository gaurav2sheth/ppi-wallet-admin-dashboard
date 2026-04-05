import { Card } from 'antd';
import {
  UserAddOutlined, SafetyCertificateOutlined, WarningOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import type { QuickStat } from '../../types/analytics.types';

const ICON_MAP: Record<string, React.ReactNode> = {
  UserAddOutlined: <UserAddOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
  WarningOutlined: <WarningOutlined />,
  ThunderboltOutlined: <ThunderboltOutlined />,
};

interface QuickStatsProps {
  stats: QuickStat[];
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <Card bordered={false} style={{ borderRadius: 12 }} bodyStyle={{ padding: '16px 20px' }}>
      <div className="flex items-center justify-between gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-base"
              style={{ backgroundColor: stat.color + '15', color: stat.color }}
            >
              {ICON_MAP[stat.icon] ?? <ThunderboltOutlined />}
            </div>
            <div>
              <div className="text-lg font-bold text-paytm-text">{stat.value}</div>
              <div className="text-xs text-paytm-muted">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
