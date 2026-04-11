import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Table, Tag, Modal, Alert, Spin, Space, Typography, Tooltip } from 'antd';
import { BellOutlined, SendOutlined, EyeOutlined, ScheduleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text, Paragraph } = Typography;

interface AtRiskUser {
  user_id: string;
  name: string;
  phone: string;
  balance: string;
  expiry_date: string;
  days_left: number;
  kyc_type: string;
}

interface AlertResult {
  user_id: string;
  name: string;
  phone: string;
  days_left: number;
  balance: string;
  expiry_date: string;
  message: string;
  generated_at: string;
  status: string;
}

interface AlertRunResult {
  run_at: string;
  users_alerted: number;
  total_at_risk_balance: string;
  alerts: AlertResult[];
  ops_summary: string;
}

interface PreviewResult {
  users: AtRiskUser[];
  count: number;
  total_at_risk_balance: string;
  generated_at: string;
}

export function KycAlertPanel() {
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [runResult, setRunResult] = useState<AlertRunResult | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [messageModal, setMessageModal] = useState<AlertResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = useCallback(async () => {
    setIsLoadingPreview(true);
    setError(null);
    try {
      const res = await axios.get('/api/kyc-alerts/preview');
      setPreview(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to fetch preview');
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  const handleRunAlerts = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const res = await axios.post('/api/kyc-alerts/run');
      setRunResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Alert run failed');
    } finally {
      setIsRunning(false);
    }
  };

  // ── Status Bar ──────────────────────────────────────────────────────────

  const statusBar = preview ? (
    <Alert
      type={preview.count > 0 ? 'error' : 'success'}
      showIcon
      icon={<BellOutlined />}
      message={
        preview.count > 0
          ? <Text strong>{preview.count} user{preview.count !== 1 ? 's' : ''} ha{preview.count !== 1 ? 've' : 's'} KYC expiring in 7 days</Text>
          : <Text strong>No KYC expiries in the next 7 days</Text>
      }
      description={
        preview.count > 0
          ? <Text>Total at-risk balance: <Text strong>{preview.total_at_risk_balance}</Text></Text>
          : undefined
      }
      style={{ marginBottom: 16, borderRadius: 8 }}
    />
  ) : null;

  // ── Alert Table columns ─────────────────────────────────────────────────

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: AlertResult) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.user_id}</Text>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
    },
    {
      title: 'Days Left',
      dataIndex: 'days_left',
      key: 'days_left',
      render: (days: number) => (
        <Tag color={days <= 3 ? 'red' : 'orange'} style={{ fontWeight: 600 }}>
          {days} day{days !== 1 ? 's' : ''}
        </Tag>
      ),
      sorter: (a: AlertResult, b: AlertResult) => a.days_left - b.days_left,
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (bal: string) => <Text strong>{bal}</Text>,
    },
    {
      title: 'AI Message',
      dataIndex: 'message',
      key: 'message',
      render: (msg: string, record: AlertResult) => (
        <Space>
          <Tooltip title={msg}>
            <Text style={{ maxWidth: 200 }} ellipsis>{msg.slice(0, 60)}...</Text>
          </Tooltip>
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => setMessageModal(record)}
          >
            View
          </Button>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="green">Sent &#10003;</Tag>,
    },
  ];

  return (
    <Card
      bordered={false}
      title={
        <Space>
          <BellOutlined style={{ color: '#F04438' }} />
          <span>KYC Expiry Alerts</span>
        </Space>
      }
      style={{ borderRadius: 12 }}
      extra={
        <Space>
          <Tooltip title="Auto-run daily at 9:00 AM IST">
            <Button
              size="small"
              icon={<ScheduleOutlined />}
              disabled
            >
              Schedule: Daily 9 AM
            </Button>
          </Tooltip>
        </Space>
      }
    >
      {/* Status Bar */}
      {isLoadingPreview ? <Spin style={{ marginBottom: 16 }} /> : statusBar}

      {error && (
        <Alert type="error" message={error} closable onClose={() => setError(null)} style={{ marginBottom: 16 }} />
      )}

      {/* Action Buttons */}
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleRunAlerts}
          loading={isRunning}
          disabled={!preview || preview.count === 0}
          danger
        >
          {isRunning ? 'Claude is drafting messages...' : 'Run KYC Alert'}
        </Button>

        {runResult && (
          <Button
            icon={<EyeOutlined />}
            onClick={() => setSummaryVisible(true)}
          >
            View Ops Summary
          </Button>
        )}
      </Space>

      {/* Alert Results Table */}
      {runResult && runResult.alerts.length > 0 && (
        <Table
          dataSource={runResult.alerts}
          columns={columns}
          rowKey="user_id"
          pagination={false}
          size="small"
          style={{ marginTop: 8 }}
          footer={() => (
            <Text type="secondary">
              Alert run completed at {runResult.run_at} | {runResult.users_alerted} user(s) alerted | At-risk balance: {runResult.total_at_risk_balance}
            </Text>
          )}
        />
      )}

      {/* Ops Summary Modal */}
      <Modal
        title="KYC Alert Ops Summary"
        open={summaryVisible}
        onCancel={() => setSummaryVisible(false)}
        footer={<Button onClick={() => setSummaryVisible(false)}>Close</Button>}
      >
        {runResult && (
          <div>
            <Paragraph style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 16, borderRadius: 8, fontFamily: 'monospace' }}>
              {runResult.ops_summary}
            </Paragraph>
            <Text type="secondary">Generated by Claude Haiku at {runResult.run_at}</Text>
          </div>
        )}
      </Modal>

      {/* Message Detail Modal */}
      <Modal
        title={messageModal ? `AI Message for ${messageModal.name}` : ''}
        open={!!messageModal}
        onCancel={() => setMessageModal(null)}
        footer={<Button onClick={() => setMessageModal(null)}>Close</Button>}
      >
        {messageModal && (
          <div>
            <Paragraph><Text strong>Phone:</Text> {messageModal.phone}</Paragraph>
            <Paragraph><Text strong>Expiry:</Text> {messageModal.expiry_date} ({messageModal.days_left} days left)</Paragraph>
            <Paragraph><Text strong>Balance:</Text> {messageModal.balance}</Paragraph>
            <Card size="small" style={{ background: '#f0f9ff', borderRadius: 8, marginTop: 12 }}>
              <Paragraph style={{ marginBottom: 0, fontSize: 14 }}>
                {messageModal.message}
              </Paragraph>
            </Card>
            <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
              Generated at {messageModal.generated_at} | {messageModal.message.length} characters
            </Text>
          </div>
        )}
      </Modal>
    </Card>
  );
}
