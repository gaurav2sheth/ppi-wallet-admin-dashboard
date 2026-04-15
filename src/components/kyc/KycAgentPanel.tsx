import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Button, Table, Tag, Space, Badge, Spin, Alert, Modal,
  Typography, Timeline, Collapse, Descriptions, Tooltip,
  Statistic, Row, Col, Divider, Progress, message, Input,
} from 'antd';
import {
  RobotOutlined, PlayCircleOutlined, ReloadOutlined,
  BellOutlined, CheckCircleOutlined,
  ClockCircleOutlined, DownloadOutlined, EyeOutlined,
  PhoneOutlined, WarningOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { formatPaise, formatDate } from '../../utils/format';

const { Text, Paragraph } = Typography;

// ── Types ────────────────────────────────────────────────────────────────────

interface AgentDecision {
  user_id: string;
  name: string;
  phone: string;
  priority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
  strategy: string;
  tone: string;
  offer: string;
  agent_reasoning: string;
  status: string;
}

interface AgentRunSummary {
  run_id: string;
  run_at: string;
  users_processed: number;
  upgraded_count: number;
  upgraded_pct: number;
  offers_deployed_paise: string;
  balance_protected_paise: string;
  active_escalations: number;
  decisions: AgentDecision[];
  audit_trail: AuditEntry[];
  summary_text: string;
}

interface Escalation {
  escalation_id: string;
  user_id: string;
  name: string;
  phone: string;
  priority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
  kyc_expiry_date: string;
  days_left: number;
  at_risk_paise: string;
  escalation_reason: string;
  agent_reasoning: string;
  status: string;
  resolved_by?: string;
  resolved_notes?: string;
}

interface AgentNotification {
  notification_id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
  read: boolean;
  action_taken: boolean;
}

interface AuditEntry {
  timestamp: string;
  phase: string;
  detail: string;
}

interface AgentStep {
  icon: string;
  text: string;
}

const AGENT_STEPS: AgentStep[] = [
  { icon: '\uD83D\uDD0D', text: 'Perceiving at-risk users...' },
  { icon: '\uD83E\uDDE0', text: 'Claude is reasoning about each user...' },
  { icon: '\uD83D\uDCCB', text: 'Building execution plan...' },
  { icon: '\uD83D\uDCF1', text: 'Executing outreach...' },
  { icon: '\uD83D\uDCCA', text: 'Generating summary...' },
];

const PRIORITY_COLORS: Record<string, string> = {
  P1_CRITICAL: 'red',
  P2_HIGH: 'orange',
  P3_MEDIUM: 'gold',
  P4_LOW: 'default',
};

const PRIORITY_BORDER_COLORS: Record<string, string> = {
  P1_CRITICAL: '#F04438',
  P2_HIGH: '#F79009',
  P3_MEDIUM: '#FAAD14',
  P4_LOW: '#D9D9D9',
};

// ── Component ────────────────────────────────────────────────────────────────

export function KycAgentPanel() {
  const [lastRun, setLastRun] = useState<AgentRunSummary | null>(null);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [notifications, setNotifications] = useState<AgentNotification[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [agentStep, setAgentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [reasoningModal, setReasoningModal] = useState<AgentDecision | null>(null);
  const [resolveNotes, setResolveNotes] = useState<Record<string, string>>({});
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Data fetching ────────────────────────────────────────────────────────

  const fetchLastRun = useCallback(async () => {
    try {
      const res = await axios.get('/api/kyc-agent/runs');
      setLastRun(res.data);
    } catch {
      // API not available — silently ignore, UI still renders
    }
  }, []);

  const fetchEscalations = useCallback(async () => {
    try {
      const res = await axios.get('/api/kyc-agent/escalations');
      setEscalations(res.data?.escalations ?? res.data ?? []);
    } catch {
      // API not available
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get('/api/kyc-agent/notifications');
      const data = res.data?.notifications ?? res.data ?? [];
      setNotifications(data.slice(0, 20));
    } catch {
      // API not available
    }
  }, []);

  useEffect(() => {
    fetchLastRun();
    fetchEscalations();
    fetchNotifications();
  }, [fetchLastRun, fetchEscalations, fetchNotifications]);

  // Auto-refresh escalations every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchEscalations, 30000);
    return () => clearInterval(interval);
  }, [fetchEscalations]);

  // ── Run Agent ────────────────────────────────────────────────────────────

  const handleRunAgent = async () => {
    setIsRunning(true);
    setAgentStep(0);
    setError(null);

    stepIntervalRef.current = setInterval(() => {
      setAgentStep((prev) => Math.min(prev + 1, AGENT_STEPS.length - 1));
    }, 3000);

    try {
      const res = await axios.post('/api/kyc-agent/run');
      setLastRun(res.data);
      setEscalations(res.data?.escalations ?? escalations);
      if (res.data?.notifications) {
        setNotifications(res.data.notifications.slice(0, 20));
      }
      message.success('KYC Agent run completed successfully');
      // Refresh escalations and notifications
      fetchEscalations();
      fetchNotifications();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Agent run failed. Is the API server running?');
    } finally {
      setIsRunning(false);
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
    }
  };

  // ── Escalation actions ──────────────────────────────────────────────────

  const handleMarkContacted = async (escalationId: string) => {
    try {
      await axios.patch(`/api/kyc-agent/escalations/${escalationId}`, {
        status: 'IN_PROGRESS',
      });
      message.success('Marked as contacted');
      fetchEscalations();
    } catch (err: any) {
      message.error(err?.message || 'Failed to update escalation');
    }
  };

  const handleResolve = async (escalationId: string) => {
    try {
      await axios.patch(`/api/kyc-agent/escalations/${escalationId}`, {
        status: 'RESOLVED',
        resolved_by: 'admin',
        notes: resolveNotes[escalationId] || 'Resolved via admin dashboard',
      });
      message.success('Escalation resolved');
      fetchEscalations();
    } catch (err: any) {
      message.error(err?.message || 'Failed to resolve escalation');
    }
  };

  // ── Audit trail download ───────────────────────────────────────────────

  const handleDownloadAudit = () => {
    if (!lastRun?.audit_trail?.length) return;
    const lines = lastRun.audit_trail.map(
      (e) => `[${e.timestamp}] ${e.phase}: ${e.detail}`
    );
    const text = `KYC Agent Audit Trail\nRun: ${lastRun.run_at}\n${'='.repeat(60)}\n\n${lines.join('\n')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kyc-agent-audit-${lastRun.run_id || 'latest'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Status indicator ──────────────────────────────────────────────────

  const isRecentRun = (() => {
    if (!lastRun?.run_at) return false;
    const runDate = new Date(lastRun.run_at);
    const now = new Date();
    return now.getTime() - runDate.getTime() < 24 * 60 * 60 * 1000;
  })();

  // ── Section A: Agent Status Bar ────────────────────────────────────────

  const statusBar = (
    <Card
      bordered={false}
      style={{ marginBottom: 16, borderRadius: 12, background: '#FAFBFC' }}
      bodyStyle={{ padding: '16px 24px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space size="middle">
          <RobotOutlined style={{ fontSize: 22, color: '#002E6E' }} />
          <Text strong style={{ fontSize: 16, color: '#002E6E' }}>
            {'\uD83E\uDD16'} KYC Upgrade Agent
          </Text>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isRecentRun ? '#12B76A' : '#D9D9D9',
              marginLeft: 4,
            }}
          />
        </Space>
        <Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Last run: {lastRun?.run_at ? formatDate(lastRun.run_at) : 'Never'}
          </Text>
          <Divider type="vertical" />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Next run: 8:00 AM IST
          </Text>
        </Space>
      </div>
      <Row gutter={24}>
        <Col>
          <Statistic
            title="Users Processed"
            value={lastRun?.users_processed ?? 0}
            valueStyle={{ color: '#002E6E' }}
          />
        </Col>
        <Col>
          <Statistic
            title="Upgraded After Contact"
            value={lastRun?.upgraded_count ?? 0}
            suffix={lastRun?.upgraded_pct != null ? `(${lastRun.upgraded_pct}%)` : undefined}
            valueStyle={{ color: '#12B76A' }}
          />
        </Col>
        <Col>
          <Statistic
            title="Offers Deployed"
            value={lastRun?.offers_deployed_paise ? formatPaise(lastRun.offers_deployed_paise) : '\u20B90.00'}
            valueStyle={{ color: '#00B9F1' }}
          />
        </Col>
        <Col>
          <Statistic
            title="Balance Protected"
            value={lastRun?.balance_protected_paise ? formatPaise(lastRun.balance_protected_paise) : '\u20B90.00'}
            valueStyle={{ color: '#002E6E' }}
          />
        </Col>
        <Col>
          <Badge count={lastRun?.active_escalations ?? 0} overflowCount={99} offset={[8, 0]}>
            <Statistic
              title="Active Escalations"
              value={lastRun?.active_escalations ?? 0}
              valueStyle={{
                color: (lastRun?.active_escalations ?? 0) > 0 ? '#F04438' : '#002E6E',
              }}
            />
          </Badge>
        </Col>
      </Row>
    </Card>
  );

  // ── Section B: Run Agent Button ─────────────────────────────────────────

  const runSection = (
    <div style={{ marginBottom: 16 }}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Button
          type="primary"
          size="large"
          icon={<PlayCircleOutlined />}
          onClick={handleRunAgent}
          loading={isRunning}
          style={{
            height: 48,
            fontSize: 16,
            fontWeight: 600,
            background: '#002E6E',
            borderColor: '#002E6E',
          }}
        >
          {isRunning ? 'Agent Running...' : '\u25B6 Run Agent Now'}
        </Button>
        {isRunning && (
          <Card
            size="small"
            style={{ borderRadius: 8, background: '#F0F5FF', borderColor: '#ADC6FF' }}
            bodyStyle={{ padding: '12px 16px' }}
          >
            <Space>
              <Spin size="small" />
              <Text style={{ fontSize: 14 }}>
                {AGENT_STEPS[agentStep].icon} {AGENT_STEPS[agentStep].text}
              </Text>
            </Space>
            <Progress
              percent={Math.round(((agentStep + 1) / AGENT_STEPS.length) * 100)}
              size="small"
              strokeColor="#002E6E"
              style={{ marginTop: 8 }}
              showInfo={false}
            />
          </Card>
        )}
      </Space>
    </div>
  );

  // ── Section C: Decision Log Table ───────────────────────────────────────

  const decisionColumns = [
    {
      title: 'User',
      key: 'user',
      render: (_: unknown, record: AgentDecision) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.user_id}</Text>
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={PRIORITY_COLORS[priority] ?? 'default'} style={{ fontWeight: 600 }}>
          {priority}
        </Tag>
      ),
      sorter: (a: AgentDecision, b: AgentDecision) => {
        const order = ['P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW'];
        return order.indexOf(a.priority) - order.indexOf(b.priority);
      },
    },
    {
      title: 'Strategy',
      dataIndex: 'strategy',
      key: 'strategy',
      ellipsis: true,
    },
    {
      title: 'Tone',
      dataIndex: 'tone',
      key: 'tone',
      render: (tone: string) => <Tag>{tone}</Tag>,
    },
    {
      title: 'Offer',
      dataIndex: 'offer',
      key: 'offer',
      render: (offer: string) => (
        <Tag color={offer && offer !== 'NONE' ? 'green' : 'default'}>
          {offer || 'NONE'}
        </Tag>
      ),
    },
    {
      title: 'Reasoning',
      key: 'reasoning',
      render: (_: unknown, record: AgentDecision) => (
        <Space>
          <Tooltip title={record.agent_reasoning}>
            <Text style={{ maxWidth: 160 }} ellipsis>
              {record.agent_reasoning?.slice(0, 60)}...
            </Text>
          </Tooltip>
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => setReasoningModal(record)}
          >
            View
          </Button>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          Sent: 'green',
          Escalated: 'red',
          Resolved: 'blue',
        };
        return <Tag color={colorMap[status] ?? 'default'}>{status}</Tag>;
      },
    },
  ];

  const decisionTable = lastRun?.decisions?.length ? (
    <Card
      bordered={false}
      title={
        <Space>
          <ClockCircleOutlined style={{ color: '#002E6E' }} />
          <span>Decision Log</span>
        </Space>
      }
      style={{ marginBottom: 16, borderRadius: 12 }}
    >
      <Table
        dataSource={lastRun.decisions}
        columns={decisionColumns}
        rowKey="user_id"
        pagination={{ pageSize: 5 }}
        size="small"
      />
    </Card>
  ) : null;

  // ── Section D: Escalations Panel ────────────────────────────────────────

  const escalationsPanel = (
    <Card
      bordered={false}
      title={
        <Space>
          <WarningOutlined style={{ color: '#F04438' }} />
          <span>{'\uD83D\uDEA8'} Requires Ops Attention</span>
          <Badge count={escalations.length} style={{ backgroundColor: '#F04438' }} />
        </Space>
      }
      extra={
        <Button
          size="small"
          icon={<ReloadOutlined />}
          onClick={fetchEscalations}
        >
          Refresh
        </Button>
      }
      style={{ marginBottom: 16, borderRadius: 12 }}
    >
      {escalations.length === 0 ? (
        <Text type="secondary">No active escalations. All clear.</Text>
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {escalations.map((esc) => (
            <Card
              key={esc.escalation_id}
              size="small"
              style={{
                borderRadius: 8,
                borderLeft: `4px solid ${PRIORITY_BORDER_COLORS[esc.priority] ?? '#D9D9D9'}`,
              }}
              bodyStyle={{ padding: '12px 16px' }}
            >
              <div style={{ marginBottom: 8 }}>
                <Space>
                  <Tag color={PRIORITY_COLORS[esc.priority] ?? 'default'} style={{ fontWeight: 600 }}>
                    {esc.priority}
                  </Tag>
                  <Text strong>{esc.name}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>({esc.user_id})</Text>
                </Space>
              </div>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">KYC expires: </Text>
                <Text>{esc.kyc_expiry_date}</Text>
                <Text type="secondary"> ({esc.days_left} days)</Text>
              </div>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">At risk: </Text>
                <Text strong>{formatPaise(esc.at_risk_paise)}</Text>
              </div>
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary">Reason: </Text>
                <Text>{esc.escalation_reason}</Text>
              </div>
              <div style={{ marginBottom: 12, fontStyle: 'italic', color: '#595959' }}>
                Agent says: &quot;{esc.agent_reasoning}&quot;
              </div>
              <Space>
                <Button
                  size="small"
                  icon={<PhoneOutlined />}
                  onClick={() => handleMarkContacted(esc.escalation_id)}
                  disabled={esc.status === 'IN_PROGRESS'}
                >
                  Mark as Contacted
                </Button>
                <Input
                  size="small"
                  placeholder="Resolution notes..."
                  style={{ width: 200 }}
                  value={resolveNotes[esc.escalation_id] || ''}
                  onChange={(e) =>
                    setResolveNotes((prev) => ({ ...prev, [esc.escalation_id]: e.target.value }))
                  }
                />
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleResolve(esc.escalation_id)}
                  style={{ background: '#12B76A', borderColor: '#12B76A' }}
                >
                  Resolved {'\u2713'}
                </Button>
              </Space>
            </Card>
          ))}
        </Space>
      )}
    </Card>
  );

  // ── Section E: Notifications Feed ───────────────────────────────────────

  const notificationsSection = (
    <Collapse
      ghost
      items={[
        {
          key: 'notifications',
          label: (
            <Space>
              <BellOutlined style={{ color: '#00B9F1' }} />
              <Text strong>Agent Notifications</Text>
              <Badge count={notifications.filter((n) => !n.read).length} size="small" />
            </Space>
          ),
          children: notifications.length === 0 ? (
            <Text type="secondary">No notifications yet.</Text>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {notifications.map((notif) => (
                <div
                  key={notif.notification_id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: notif.read ? '#D9D9D9' : '#00B9F1',
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: 13 }}>{notif.user_name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {notif.message?.slice(0, 50)}{notif.message?.length > 50 ? '...' : ''}
                    </Text>
                  </div>
                  <Space size={4} style={{ flexShrink: 0 }}>
                    {notif.action_taken && (
                      <CheckCircleOutlined style={{ color: '#12B76A', fontSize: 14 }} />
                    )}
                    <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                      {notif.created_at ? formatDate(notif.created_at) : ''}
                    </Text>
                  </Space>
                </div>
              ))}
            </div>
          ),
        },
      ]}
      style={{ marginBottom: 16 }}
    />
  );

  // ── Section F: Audit Trail ─────────────────────────────────────────────

  const auditSection = lastRun?.audit_trail?.length ? (
    <Collapse
      ghost
      items={[
        {
          key: 'audit',
          label: (
            <Space>
              <ClockCircleOutlined style={{ color: '#002E6E' }} />
              <Text strong>View Full Audit Trail</Text>
            </Space>
          ),
          extra: (
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadAudit();
              }}
            >
              Download .txt
            </Button>
          ),
          children: (
            <Timeline
              items={lastRun.audit_trail.map((entry, idx) => ({
                key: idx,
                color:
                  entry.phase === 'ACT'
                    ? 'green'
                    : entry.phase === 'DECISION'
                    ? 'blue'
                    : entry.phase === 'REASON'
                    ? 'orange'
                    : 'gray',
                children: (
                  <div>
                    <Text code style={{ fontSize: 11 }}>[{entry.timestamp}]</Text>{' '}
                    <Tag
                      color={
                        entry.phase === 'ACT'
                          ? 'green'
                          : entry.phase === 'DECISION'
                          ? 'blue'
                          : entry.phase === 'REASON'
                          ? 'orange'
                          : 'default'
                      }
                      style={{ fontSize: 11 }}
                    >
                      {entry.phase}
                    </Tag>
                    <Text style={{ fontSize: 13 }}>{entry.detail}</Text>
                  </div>
                ),
              }))}
            />
          ),
        },
      ]}
      style={{ marginBottom: 16 }}
    />
  ) : null;

  // ── Section G: Agent Summary Card ──────────────────────────────────────

  const summaryCard = lastRun?.summary_text ? (
    <Card
      bordered
      title={`Agent Run Summary \u2014 ${lastRun.run_at ? formatDate(lastRun.run_at) : ''}`}
      style={{
        borderRadius: 12,
        borderColor: '#ADC6FF',
        background: '#E6F4FF',
        marginBottom: 16,
      }}
      headStyle={{ background: '#F0F5FF', borderBottom: '1px solid #ADC6FF' }}
    >
      <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0, fontSize: 14 }}>
        {lastRun.summary_text}
      </Paragraph>
    </Card>
  ) : null;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <Card
      bordered={false}
      title={
        <Space>
          <RobotOutlined style={{ color: '#002E6E' }} />
          <span>KYC Upgrade Agent</span>
        </Space>
      }
      style={{ borderRadius: 12 }}
      extra={
        <Button
          size="small"
          icon={<ReloadOutlined />}
          onClick={() => {
            fetchLastRun();
            fetchEscalations();
            fetchNotifications();
          }}
        >
          Refresh All
        </Button>
      }
    >
      {error && (
        <Alert
          type="warning"
          message={
            <span>
              {'\u26A0\uFE0F'} API server not reachable. Start the API server to use the KYC Agent.
            </span>
          }
          description={error}
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* A: Status Bar */}
      {statusBar}

      {/* B: Run Agent */}
      {runSection}

      {/* G: Summary (after run) */}
      {summaryCard}

      {/* C: Decision Log */}
      {decisionTable}

      {/* D: Escalations */}
      {escalationsPanel}

      {/* E: Notifications */}
      {notificationsSection}

      {/* F: Audit Trail */}
      {auditSection}

      {/* Reasoning Detail Modal */}
      <Modal
        title={reasoningModal ? `Agent Reasoning \u2014 ${reasoningModal.name}` : ''}
        open={!!reasoningModal}
        onCancel={() => setReasoningModal(null)}
        footer={<Button onClick={() => setReasoningModal(null)}>Close</Button>}
        width={600}
      >
        {reasoningModal && (
          <div>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="User ID">{reasoningModal.user_id}</Descriptions.Item>
              <Descriptions.Item label="Priority">
                <Tag color={PRIORITY_COLORS[reasoningModal.priority]}>{reasoningModal.priority}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Strategy">{reasoningModal.strategy}</Descriptions.Item>
              <Descriptions.Item label="Tone">
                <Tag>{reasoningModal.tone}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Offer" span={2}>
                <Tag color={reasoningModal.offer && reasoningModal.offer !== 'NONE' ? 'green' : 'default'}>
                  {reasoningModal.offer || 'NONE'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            <Card
              size="small"
              title="Full Reasoning"
              style={{ background: '#f0f9ff', borderRadius: 8 }}
            >
              <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap', fontSize: 14 }}>
                {reasoningModal.agent_reasoning}
              </Paragraph>
            </Card>
          </div>
        )}
      </Modal>
    </Card>
  );
}
