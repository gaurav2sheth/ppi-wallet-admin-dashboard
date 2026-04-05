import { Tag } from 'antd';

interface StatusTagProps {
  status: string;
  config: Record<string, { color: string; bg: string; label: string }>;
}

export function StatusTag({ status, config }: StatusTagProps) {
  const cfg = config[status];
  if (!cfg) return <Tag>{status}</Tag>;

  return (
    <Tag
      style={{
        color: cfg.color,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.color}20`,
        borderRadius: 6,
        fontWeight: 500,
        fontSize: 12,
      }}
    >
      {cfg.label}
    </Tag>
  );
}
