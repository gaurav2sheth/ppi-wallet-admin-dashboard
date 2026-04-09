import { useState } from 'react';
import { Card, Button, Typography, Spin, Alert } from 'antd';
import { RobotOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { adminApi } from '../../api/admin.api';
import { mockGetTransactions } from '../../api/mock/transactions.mock';
import type { Transaction, DEFAULT_TRANSACTION_FILTERS } from '../../types/transaction.types';

const { Text, Paragraph } = Typography;

function formatPaise(paise: string): string {
  return '₹' + (Number(paise) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Generates a plain-English summary from transactions without needing the Claude API */
function generateLocalSummary(txns: Transaction[]): string {
  if (txns.length === 0) return 'No transactions found to summarise.';

  const totalValue = txns.reduce((sum, t) => sum + Number(t.amountPaise), 0);
  const completed = txns.filter(t => t.status === 'COMPLETED');
  const failed = txns.filter(t => t.status === 'DLQ' || t.status === 'COMPENSATED');
  const largest = [...txns].sort((a, b) => Number(b.amountPaise) - Number(a.amountPaise))[0];
  const highValue = txns.filter(t => Number(t.amountPaise) >= 500000);

  const typeCount: Record<string, number> = {};
  for (const t of txns) typeCount[t.sagaType] = (typeCount[t.sagaType] || 0) + 1;
  const topType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0];

  const lines: string[] = [];
  lines.push(`Transaction Summary (${txns.length} transactions):`);
  lines.push(`Total value: ${formatPaise(totalValue.toString())}. ${completed.length} completed, ${failed.length} failed/compensated.`);
  lines.push(`Largest transaction: ${formatPaise(largest.amountPaise)} — ${largest.description} on ${formatDate(largest.createdAt)}.`);
  if (highValue.length > 0) lines.push(`${highValue.length} high-value transaction${highValue.length > 1 ? 's' : ''} above ₹5,000.`);
  if (topType) lines.push(`Most common type: ${topType[0].replace(/_/g, ' ')} (${topType[1]} transactions).`);

  return lines.join('\n');
}

export function TransactionSummaryCard() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAiSummary, setIsAiSummary] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);
    setIsAiSummary(false);

    try {
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

      // Try Claude API first, fall back to local summary
      try {
        const res = await adminApi.summariseTransactions(result.data);
        setSummary(res.summary);
        setIsAiSummary(true);
      } catch {
        setSummary(generateLocalSummary(result.data));
      }
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
          {isAiSummary ? 'Powered by Claude' : 'Smart Summary'}
        </Text>
      </div>
    </Card>
  );
}
