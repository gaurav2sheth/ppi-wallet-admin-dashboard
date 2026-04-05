import { Steps, Tag } from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, SyncOutlined,
  ClockCircleOutlined, UndoOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { SagaStep } from '../../types/transaction.types';
import { STEP_STATUS_CONFIG } from '../../utils/constants';
import { formatDate } from '../../utils/format';

interface SagaTimelineProps {
  steps: SagaStep[];
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  COMPLETED: <CheckCircleOutlined style={{ color: '#12B76A' }} />,
  RUNNING: <SyncOutlined spin style={{ color: '#00B9F1' }} />,
  PENDING: <ClockCircleOutlined style={{ color: '#98A2B3' }} />,
  FAILED: <CloseCircleOutlined style={{ color: '#F04438' }} />,
  COMPENSATED: <UndoOutlined style={{ color: '#F79009' }} />,
  COMPENSATION_FAILED: <ExclamationCircleOutlined style={{ color: '#F04438' }} />,
};

const STEP_STATUS_MAP: Record<string, 'finish' | 'process' | 'wait' | 'error'> = {
  COMPLETED: 'finish',
  RUNNING: 'process',
  PENDING: 'wait',
  FAILED: 'error',
  COMPENSATED: 'finish',
  COMPENSATION_FAILED: 'error',
};

export function SagaTimeline({ steps }: SagaTimelineProps) {
  return (
    <Steps
      direction="vertical"
      size="small"
      items={steps.map(step => ({
        title: (
          <div className="flex items-center gap-2">
            <span className="font-medium">{step.stepName.replace(/_/g, ' ')}</span>
            <Tag style={{
              color: STEP_STATUS_CONFIG[step.status]?.color,
              fontSize: 11,
              borderRadius: 4,
              lineHeight: '18px',
            }}>
              {STEP_STATUS_CONFIG[step.status]?.label ?? step.status}
            </Tag>
          </div>
        ),
        description: (
          <div className="text-xs text-gray-400">
            {step.executedAt && <span>Executed: {formatDate(step.executedAt)}</span>}
            {step.error && <div className="text-red-500 mt-1">Error: {step.error}</div>}
            {step.compensatedAt && <div className="text-orange-500 mt-1">Compensated: {formatDate(step.compensatedAt)}</div>}
          </div>
        ),
        icon: STATUS_ICONS[step.status],
        status: STEP_STATUS_MAP[step.status] ?? 'wait',
      }))}
    />
  );
}
