import { useState } from 'react';
import { Card, Button, Typography, Spin, Alert } from 'antd';
import { RobotOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { adminApi } from '../../api/admin.api';
import { mockGetTransactions } from '../../api/mock/transactions.mock';
import type { DEFAULT_TRANSACTION_FILTERS } from '../../types/transaction.types';

const { Text, Paragraph } = Typography;

export function TransactionSummaryCard() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      // Fetch recent 50 transactions from mock data
      const result = mockGetTransactions({
        search: '',
        sagaType: null,
        status: null,
        amountMin: null,
        amountMax: null,
        dateFrom: null,
        dateTo: null,
        walletId: null,
        page: 1,
        pageSize: 50,
        sortField: 'createdAt',
        sortOrder: 'descend',
      } satisfies typeof DEFAULT_TRANSACTION_FILTERS);

      const res = await adminApi.summariseTransactions(result.data);
      setSummary(res.summary);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.error || err?.message || 'Failed to generate summary';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      variant="borderless"
      style={{ borderRadius: 12 }}
      styles={{ body: { padding: 24 } }}
    >
      <div className="flex items-center gap-2 mb-4">
        <RobotOutlined style={{ fontSize: 20, color: '#002E6E' }} />
        <Text strong style={{ fontSize: 16, color: '#002E6E' }}>AI Transaction Summary</Text>
      </div>

      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        Analyse the last 50 transactions using Claude AI to generate a plain-English summary
        of transaction patterns, totals, and notable activity.
      </Paragraph>

      <Button
        type="primary"
        icon={<ThunderboltOutlined />}
        onClick={handleGenerate}
        loading={loading}
        style={{
          backgroundColor: '#00B9F1',
          borderColor: '#00B9F1',
          borderRadius: 8,
          fontWeight: 600,
        }}
      >
        {loading ? 'Generating...' : 'Generate Summary'}
      </Button>

      {loading && (
        <div className="flex items-center gap-3 mt-4 p-4 rounded-lg" style={{ backgroundColor: '#F0F9FF' }}>
          <Spin size="small" />
          <Text type="secondary">Claude is analysing your transactions...</Text>
        </div>
      )}

      {error && (
        <Alert
          message="Summary Generation Failed"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginTop: 16, borderRadius: 8 }}
        />
      )}

      {summary && !loading && (
        <div
          className="mt-4 p-4 rounded-lg"
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
          }}
        >
          <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-line', lineHeight: 1.7 }}>
            {summary}
          </Paragraph>
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <Text type="secondary" style={{ fontSize: 11 }}>
          Powered by Claude
        </Text>
      </div>
    </Card>
  );
}
