import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Row, Col, Statistic, Table, Tag, Button, Badge, Space,
  Typography, Tabs, Progress, Modal, Input, message,
} from 'antd';
import {
  CustomerServiceOutlined, AlertOutlined, CheckCircleOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined, SyncOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { formatDate, truncateId } from '../../utils/format';

const { Text } = Typography;

const API_BASE = import.meta.env.VITE_API_URL || '';

// -- Types -------------------------------------------------------------------

interface SupportAnalytics {
  total_chats_today: number;
  resolved_by_agent: number;
  escalated: number;
  intent_counts: Record<string, number>;
  sentiment_counts: Record<string, number>;
  resolution_rate: number;
  avg_turns_to_resolve: number;
}

interface Ticket {
  ticket_id: string;
  user_id: string;
  user_name: string;
  issue_type: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  sla_deadline: string;
  is_overdue: boolean;
  created_at: string;
}

interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  overdue: number;
  by_priority: Record<string, number>;
  by_type: Record<string, number>;
}

interface Escalation {
  escalation_id: string;
  user_id: string;
  name: string;
  priority: string;
  escalation_reason: string;
  status: string;
  created_at: string;
}

// -- Mock fallback data ------------------------------------------------------

const MOCK_ANALYTICS: SupportAnalytics = {
  total_chats_today: 147,
  resolved_by_agent: 119,
  escalated: 12,
  intent_counts: {
    'Balance Inquiry': 34,
    'Transaction Failed': 28,
    'KYC Help': 22,
    'Refund Request': 18,
    'Add Money Issue': 15,
    'Account Locked': 12,
    'Sub-wallet Query': 10,
    'Other': 8,
  },
  sentiment_counts: { FRUSTRATED: 18, NEUTRAL: 94, POSITIVE: 35 },
  resolution_rate: 80.9,
  avg_turns_to_resolve: 3.2,
};

const MOCK_TICKETS: Ticket[] = [
  {
    ticket_id: 'TKT-001',
    user_id: 'u-4a1f',
    user_name: 'Rahul Sharma',
    issue_type: 'Transaction Failed',
    priority: 'HIGH',
    status: 'OPEN',
    sla_deadline: '2026-04-15T18:00:00Z',
    is_overdue: false,
    created_at: '2026-04-15T09:12:00Z',
  },
  {
    ticket_id: 'TKT-002',
    user_id: 'u-7b3c',
    user_name: 'Priya Patel',
    issue_type: 'Refund Request',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    sla_deadline: '2026-04-15T14:00:00Z',
    is_overdue: true,
    created_at: '2026-04-14T16:45:00Z',
  },
  {
    ticket_id: 'TKT-003',
    user_id: 'u-2e9d',
    user_name: 'Amit Kumar',
    issue_type: 'Account Locked',
    priority: 'HIGH',
    status: 'OPEN',
    sla_deadline: '2026-04-15T20:00:00Z',
    is_overdue: false,
    created_at: '2026-04-15T11:30:00Z',
  },
  {
    ticket_id: 'TKT-004',
    user_id: 'u-8f2a',
    user_name: 'Sneha Reddy',
    issue_type: 'KYC Help',
    priority: 'LOW',
    status: 'OPEN',
    sla_deadline: '2026-04-16T12:00:00Z',
    is_overdue: false,
    created_at: '2026-04-15T10:00:00Z',
  },
];

const MOCK_TICKET_STATS: TicketStats = {
  total: 42,
  open: 14,
  in_progress: 8,
  resolved: 20,
  overdue: 3,
  by_priority: { HIGH: 8, MEDIUM: 18, LOW: 16 },
  by_type: {
    'Transaction Failed': 12,
    'Refund Request': 9,
    'KYC Help': 7,
    'Account Locked': 5,
    'Add Money Issue': 5,
    'Sub-wallet Query': 4,
  },
};

const MOCK_ESCALATIONS: Escalation[] = [
  {
    escalation_id: 'ESC-S001',
    user_id: 'u-4a1f',
    name: 'Rahul Sharma',
    priority: 'P1_CRITICAL',
    escalation_reason: 'Repeated failed transactions exceeding 5 in 24h',
    status: 'OPEN',
    created_at: '2026-04-15T09:20:00Z',
  },
  {
    escalation_id: 'ESC-S002',
    user_id: 'u-7b3c',
    name: 'Priya Patel',
    priority: 'P2_HIGH',
    escalation_reason: 'Refund not processed after 7 business days',
    status: 'OPEN',
    created_at: '2026-04-14T17:00:00Z',
  },
];

// -- Constants ---------------------------------------------------------------

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'red',
  MEDIUM: 'orange',
  LOW: 'blue',
  P1_CRITICAL: 'red',
  P2_HIGH: 'orange',
  P3_MEDIUM: 'gold',
  P4_LOW: 'default',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'blue',
  IN_PROGRESS: 'orange',
  RESOLVED: 'green',
  CLOSED: 'default',
};

const ISSUE_TYPE_COLORS: Record<string, string> = {
  'Transaction Failed': 'red',
  'Refund Request': 'volcano',
  'Account Locked': 'magenta',
  'KYC Help': 'purple',
  'Add Money Issue': 'orange',
  'Sub-wallet Query': 'cyan',
  'Balance Inquiry': 'blue',
  Other: 'default',
};

const SENTIMENT_CONFIG: Record<string, { color: string; label: string }> = {
  FRUSTRATED: { color: '#F04438', label: 'Frustrated' },
  NEUTRAL: { color: '#1677ff', label: 'Neutral' },
  POSITIVE: { color: '#12B76A', label: 'Positive' },
};

// -- Component ---------------------------------------------------------------

export function SupportAgentPanel() {
  const [analytics, setAnalytics] = useState<SupportAnalytics>(MOCK_ANALYTICS);
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [ticketStats, setTicketStats] = useState<TicketStats>(MOCK_TICKET_STATS);
  const [escalations, setEscalations] = useState<Escalation[]>(MOCK_ESCALATIONS);
  const [activeTab, setActiveTab] = useState('tickets');
  const [resolveModalTicket, setResolveModalTicket] = useState<Ticket | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const [escalationNotes, setEscalationNotes] = useState<Record<string, string>>({});
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // -- Data fetching ---------------------------------------------------------

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/support/analytics`);
      setAnalytics(res.data);
    } catch {
      // API unavailable, keep mock data
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/support/tickets`);
      setTickets(res.data?.tickets ?? []);
      if (res.data?.stats) setTicketStats(res.data.stats);
    } catch {
      // API unavailable, keep mock data
    }
  }, []);

  const fetchEscalations = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/kyc-agent/escalations`, {
        params: { status: 'OPEN' },
      });
      setEscalations(res.data?.escalations ?? res.data ?? []);
    } catch {
      // API unavailable, keep mock data
    }
  }, []);

  const fetchAll = useCallback(() => {
    fetchAnalytics();
    fetchTickets();
    fetchEscalations();
  }, [fetchAnalytics, fetchTickets, fetchEscalations]);

  // -- Mount & auto-refresh --------------------------------------------------

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    refreshTimerRef.current = setInterval(fetchAll, 30000);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [fetchAll]);

  // -- Ticket resolve --------------------------------------------------------

  const handleResolveTicket = async () => {
    if (!resolveModalTicket) return;
    setResolving(true);
    try {
      await axios.patch(
        `${API_BASE}/api/support/tickets/${resolveModalTicket.ticket_id}`,
        { resolved_by: 'admin', notes: resolveNotes || 'Resolved via admin dashboard' },
      );
      message.success(`Ticket ${resolveModalTicket.ticket_id} resolved`);
      setResolveModalTicket(null);
      setResolveNotes('');
      fetchTickets();
    } catch {
      // Fallback: update locally
      setTickets((prev) =>
        prev.map((t) =>
          t.ticket_id === resolveModalTicket.ticket_id
            ? { ...t, status: 'RESOLVED', is_overdue: false }
            : t,
        ),
      );
      message.success(`Ticket ${resolveModalTicket.ticket_id} resolved (local)`);
      setResolveModalTicket(null);
      setResolveNotes('');
    } finally {
      setResolving(false);
    }
  };

  // -- Escalation resolve ----------------------------------------------------

  const handleResolveEscalation = async (escalationId: string) => {
    try {
      await axios.patch(`${API_BASE}/api/kyc-agent/escalations/${escalationId}`, {
        status: 'RESOLVED',
        resolved_by: 'admin',
        notes: escalationNotes[escalationId] || 'Resolved via admin dashboard',
      });
      message.success('Escalation resolved');
      fetchEscalations();
    } catch {
      setEscalations((prev) => prev.filter((e) => e.escalation_id !== escalationId));
      message.success('Escalation resolved (local)');
    }
  };

  // -- Status Bar (Section 1) ------------------------------------------------

  const statusBar = (
    <Row gutter={16} style={{ marginBottom: 20 }}>
      <Col xs={24} sm={12} md={4} lg={4}>
        <Card bordered={false} style={{ borderRadius: 12, background: '#FAFBFC' }} bodyStyle={{ padding: '16px 20px' }}>
          <Statistic
            title="Total Chats Today"
            value={analytics.total_chats_today}
            prefix={<CustomerServiceOutlined style={{ color: '#002E6E' }} />}
            valueStyle={{ color: '#002E6E', fontSize: 28 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={5} lg={5}>
        <Card bordered={false} style={{ borderRadius: 12, background: '#FAFBFC' }} bodyStyle={{ padding: '16px 20px' }}>
          <Statistic
            title="Resolved by Agent"
            value={analytics.resolved_by_agent}
            prefix={<CheckCircleOutlined style={{ color: '#12B76A' }} />}
            valueStyle={{ color: '#12B76A', fontSize: 28 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={5} lg={5}>
        <Card bordered={false} style={{ borderRadius: 12, background: '#FAFBFC' }} bodyStyle={{ padding: '16px 20px' }}>
          <Statistic
            title="Escalated"
            value={analytics.escalated}
            prefix={<AlertOutlined style={{ color: '#F79009' }} />}
            valueStyle={{ color: '#F79009', fontSize: 28 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={5} lg={5}>
        <Card bordered={false} style={{ borderRadius: 12, background: '#FAFBFC' }} bodyStyle={{ padding: '16px 20px' }}>
          <Statistic
            title="Resolution Rate"
            value={analytics.resolution_rate}
            suffix="%"
            prefix={<TeamOutlined style={{ color: analytics.resolution_rate > 80 ? '#12B76A' : '#F79009' }} />}
            valueStyle={{ color: analytics.resolution_rate > 80 ? '#12B76A' : '#F79009', fontSize: 28 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={5} lg={5}>
        <Card bordered={false} style={{ borderRadius: 12, background: '#FAFBFC' }} bodyStyle={{ padding: '16px 20px' }}>
          <Statistic
            title="Avg Turns to Resolve"
            value={analytics.avg_turns_to_resolve}
            prefix={<ClockCircleOutlined style={{ color: '#002E6E' }} />}
            valueStyle={{ color: '#002E6E', fontSize: 28 }}
          />
        </Card>
      </Col>
    </Row>
  );

  // -- Tab 1: Open Tickets ---------------------------------------------------

  const ticketColumns: ColumnsType<Ticket> = [
    {
      title: 'Ticket ID',
      dataIndex: 'ticket_id',
      key: 'ticket_id',
      width: 110,
      render: (id: string) => <Text code style={{ fontSize: 12 }}>{id}</Text>,
    },
    {
      title: 'User',
      key: 'user',
      width: 160,
      render: (_: unknown, record: Ticket) => (
        <div>
          <Text strong>{record.user_name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{truncateId(record.user_id)}</Text>
        </div>
      ),
    },
    {
      title: 'Issue Type',
      dataIndex: 'issue_type',
      key: 'issue_type',
      width: 160,
      render: (type: string) => (
        <Tag color={ISSUE_TYPE_COLORS[type] ?? 'default'}>{type}</Tag>
      ),
      filters: Object.keys(ISSUE_TYPE_COLORS).map((t) => ({ text: t, value: t })),
      onFilter: (value, record) => record.issue_type === value,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (p: string) => (
        <Tag color={PRIORITY_COLORS[p] ?? 'default'} style={{ fontWeight: 600 }}>{p}</Tag>
      ),
      sorter: (a: Ticket, b: Ticket) => {
        const order = ['HIGH', 'MEDIUM', 'LOW'];
        return order.indexOf(a.priority) - order.indexOf(b.priority);
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s: string) => <Tag color={STATUS_COLORS[s] ?? 'default'}>{s}</Tag>,
    },
    {
      title: 'SLA Deadline',
      dataIndex: 'sla_deadline',
      key: 'sla_deadline',
      width: 180,
      render: (d: string) => <Text style={{ fontSize: 12 }}>{formatDate(d)}</Text>,
      sorter: (a: Ticket, b: Ticket) =>
        new Date(a.sla_deadline).getTime() - new Date(b.sla_deadline).getTime(),
    },
    {
      title: 'Overdue?',
      dataIndex: 'is_overdue',
      key: 'is_overdue',
      width: 90,
      align: 'center',
      render: (overdue: boolean) =>
        overdue ? (
          <Badge
            status="error"
            text={<Text type="danger" style={{ fontSize: 12, fontWeight: 600 }}>OVERDUE</Text>}
          />
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>On time</Text>
        ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (d: string) => <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(d)}</Text>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_: unknown, record: Ticket) =>
        record.status !== 'RESOLVED' && record.status !== 'CLOSED' ? (
          <Button
            size="small"
            type="primary"
            icon={<CheckCircleOutlined />}
            style={{ background: '#12B76A', borderColor: '#12B76A' }}
            onClick={() => {
              setResolveModalTicket(record);
              setResolveNotes('');
            }}
          >
            Resolve
          </Button>
        ) : (
          <Tag color="green">Done</Tag>
        ),
    },
  ];

  const ticketsTab = (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Statistic title="Total" value={ticketStats.total} valueStyle={{ fontSize: 20 }} />
        </Col>
        <Col span={4}>
          <Statistic title="Open" value={ticketStats.open} valueStyle={{ fontSize: 20, color: '#1677ff' }} />
        </Col>
        <Col span={4}>
          <Statistic title="In Progress" value={ticketStats.in_progress} valueStyle={{ fontSize: 20, color: '#F79009' }} />
        </Col>
        <Col span={4}>
          <Statistic title="Resolved" value={ticketStats.resolved} valueStyle={{ fontSize: 20, color: '#12B76A' }} />
        </Col>
        <Col span={4}>
          <Statistic
            title="Overdue"
            value={ticketStats.overdue}
            valueStyle={{ fontSize: 20, color: ticketStats.overdue > 0 ? '#F04438' : '#002E6E' }}
            prefix={ticketStats.overdue > 0 ? <ExclamationCircleOutlined /> : undefined}
          />
        </Col>
      </Row>
      <Table<Ticket>
        dataSource={tickets}
        columns={ticketColumns}
        rowKey="ticket_id"
        size="small"
        pagination={{ pageSize: 8 }}
        scroll={{ x: 1100 }}
        rowClassName={(record) => (record.is_overdue ? 'overdue-row' : '')}
      />
    </div>
  );

  // -- Tab 2: Analytics ------------------------------------------------------

  const sentimentTotal = Object.values(analytics.sentiment_counts).reduce((a, b) => a + b, 0) || 1;
  const sortedIntents = Object.entries(analytics.intent_counts).sort(([, a], [, b]) => b - a);
  const sortedTypes = Object.entries(ticketStats.by_type).sort(([, a], [, b]) => b - a);
  const maxTypeCount = sortedTypes.length > 0 ? sortedTypes[0][1] : 1;

  const analyticsTab = (
    <Row gutter={24}>
      {/* Intent Distribution */}
      <Col xs={24} md={8}>
        <Card
          bordered={false}
          title={<Text strong>Intent Distribution</Text>}
          style={{ borderRadius: 12, marginBottom: 16 }}
          bodyStyle={{ padding: '12px 16px' }}
        >
          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            {sortedIntents.map(([intent, count]) => (
              <div key={intent} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Tag color={ISSUE_TYPE_COLORS[intent] ?? 'default'}>{intent}</Tag>
                <Text strong style={{ fontSize: 14 }}>{count}</Text>
              </div>
            ))}
          </Space>
        </Card>
      </Col>

      {/* Sentiment Breakdown */}
      <Col xs={24} md={8}>
        <Card
          bordered={false}
          title={<Text strong>Sentiment Breakdown</Text>}
          style={{ borderRadius: 12, marginBottom: 16 }}
          bodyStyle={{ padding: '12px 16px' }}
        >
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {Object.entries(SENTIMENT_CONFIG).map(([key, cfg]) => {
              const count = analytics.sentiment_counts[key] ?? 0;
              const pct = Math.round((count / sentimentTotal) * 100);
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text>{cfg.label}</Text>
                    <Text strong>{count} ({pct}%)</Text>
                  </div>
                  <Progress
                    percent={pct}
                    strokeColor={cfg.color}
                    showInfo={false}
                    size="small"
                  />
                </div>
              );
            })}
          </Space>
        </Card>
      </Col>

      {/* Top Issue Types */}
      <Col xs={24} md={8}>
        <Card
          bordered={false}
          title={<Text strong>Top Issue Types</Text>}
          style={{ borderRadius: 12, marginBottom: 16 }}
          bodyStyle={{ padding: '12px 16px' }}
        >
          <Space direction="vertical" size={10} style={{ width: '100%' }}>
            {sortedTypes.map(([type, count]) => (
              <div key={type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontSize: 13 }}>{type}</Text>
                  <Text strong style={{ fontSize: 13 }}>{count}</Text>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 4,
                    background: '#f0f0f0',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round((count / maxTypeCount) * 100)}%`,
                      background: '#002E6E',
                      borderRadius: 4,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </Space>
        </Card>
      </Col>
    </Row>
  );

  // -- Tab 3: Escalations ----------------------------------------------------

  const escalationColumns: ColumnsType<Escalation> = [
    {
      title: 'Escalation ID',
      dataIndex: 'escalation_id',
      key: 'escalation_id',
      width: 130,
      render: (id: string) => <Text code style={{ fontSize: 12 }}>{id}</Text>,
    },
    {
      title: 'User',
      key: 'user',
      width: 150,
      render: (_: unknown, record: Escalation) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{truncateId(record.user_id)}</Text>
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (p: string) => (
        <Tag color={PRIORITY_COLORS[p] ?? 'default'} style={{ fontWeight: 600 }}>{p}</Tag>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'escalation_reason',
      key: 'escalation_reason',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s: string) => <Tag color={STATUS_COLORS[s] ?? 'default'}>{s}</Tag>,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (d: string) => <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(d)}</Text>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 260,
      render: (_: unknown, record: Escalation) =>
        record.status !== 'RESOLVED' ? (
          <Space>
            <Input
              size="small"
              placeholder="Notes..."
              style={{ width: 130 }}
              value={escalationNotes[record.escalation_id] || ''}
              onChange={(e) =>
                setEscalationNotes((prev) => ({
                  ...prev,
                  [record.escalation_id]: e.target.value,
                }))
              }
            />
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              style={{ background: '#12B76A', borderColor: '#12B76A' }}
              onClick={() => handleResolveEscalation(record.escalation_id)}
            >
              Resolve
            </Button>
          </Space>
        ) : (
          <Tag color="green">Resolved</Tag>
        ),
    },
  ];

  const escalationsTab = (
    <div>
      {escalations.length === 0 ? (
        <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#12B76A', marginBottom: 12 }} />
          <br />
          <Text type="secondary" style={{ fontSize: 16 }}>No open escalations. All clear.</Text>
        </Card>
      ) : (
        <Table<Escalation>
          dataSource={escalations}
          columns={escalationColumns}
          rowKey="escalation_id"
          size="small"
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1000 }}
        />
      )}
    </div>
  );

  // -- Tabs ------------------------------------------------------------------

  const tabItems = [
    {
      key: 'tickets',
      label: (
        <Space>
          <ClockCircleOutlined />
          <span>Open Tickets</span>
          <Badge count={ticketStats.open} style={{ backgroundColor: '#1677ff' }} size="small" />
        </Space>
      ),
      children: ticketsTab,
    },
    {
      key: 'analytics',
      label: (
        <Space>
          <CustomerServiceOutlined />
          <span>Analytics</span>
        </Space>
      ),
      children: analyticsTab,
    },
    {
      key: 'escalations',
      label: (
        <Space>
          <AlertOutlined />
          <span>Escalations</span>
          <Badge count={escalations.length} style={{ backgroundColor: '#F04438' }} size="small" />
        </Space>
      ),
      children: escalationsTab,
    },
  ];

  // -- Render ----------------------------------------------------------------

  return (
    <Card
      bordered={false}
      title={
        <Space>
          <CustomerServiceOutlined style={{ color: '#002E6E', fontSize: 20 }} />
          <span style={{ color: '#002E6E', fontWeight: 600 }}>Support Agent Panel</span>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#12B76A',
              marginLeft: 4,
            }}
          />
        </Space>
      }
      extra={
        <Button
          size="small"
          icon={<SyncOutlined />}
          onClick={fetchAll}
        >
          Refresh All
        </Button>
      }
      style={{ borderRadius: 12 }}
    >
      {/* Section 1: Status Bar */}
      {statusBar}

      {/* Section 2: Tabbed Content */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        style={{ marginTop: -8 }}
      />

      {/* Resolve Ticket Modal */}
      <Modal
        title={
          resolveModalTicket
            ? `Resolve Ticket ${resolveModalTicket.ticket_id}`
            : ''
        }
        open={!!resolveModalTicket}
        onCancel={() => {
          setResolveModalTicket(null);
          setResolveNotes('');
        }}
        onOk={handleResolveTicket}
        okText="Resolve Ticket"
        okButtonProps={{
          loading: resolving,
          style: { background: '#12B76A', borderColor: '#12B76A' },
        }}
        width={480}
      >
        {resolveModalTicket && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary">User: </Text>
              <Text strong>{resolveModalTicket.user_name}</Text>
            </div>
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary">Issue: </Text>
              <Tag color={ISSUE_TYPE_COLORS[resolveModalTicket.issue_type] ?? 'default'}>
                {resolveModalTicket.issue_type}
              </Tag>
              <Tag color={PRIORITY_COLORS[resolveModalTicket.priority]} style={{ fontWeight: 600 }}>
                {resolveModalTicket.priority}
              </Tag>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Resolution Notes:</Text>
            </div>
            <Input.TextArea
              rows={4}
              placeholder="Describe how the issue was resolved..."
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
            />
          </div>
        )}
      </Modal>

      <style>{`
        .overdue-row {
          background: #FFF1F0 !important;
        }
        .overdue-row:hover > td {
          background: #FFECEB !important;
        }
      `}</style>
    </Card>
  );
}
