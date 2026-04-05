import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Descriptions, Tag, Button, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusTag } from '../components/shared/StatusTag';
import { SagaTimeline } from '../components/transactions/SagaTimeline';
import { useTransactionsStore } from '../store/transactions.store';
import { useUIStore } from '../store/ui.store';
import { SAGA_STATUS_CONFIG, SAGA_TYPE_LABELS } from '../utils/constants';
import { formatPaise, formatDate, truncateId } from '../utils/format';

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedTransaction: txn, isDetailLoading, fetchTransactionDetail, clearSelectedTransaction } = useTransactionsStore();
  const { setBreadcrumbs } = useUIStore();

  useEffect(() => {
    if (id) fetchTransactionDetail(id);
    return () => clearSelectedTransaction();
  }, [id, fetchTransactionDetail, clearSelectedTransaction]);

  useEffect(() => {
    setBreadcrumbs([
      { title: 'Dashboard', path: '/' },
      { title: 'Transactions', path: '/transactions' },
      { title: txn ? truncateId(txn.id, 12) : 'Detail' },
    ]);
  }, [txn, setBreadcrumbs]);

  if (isDetailLoading || !txn) {
    return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  }

  return (
    <div>
      <PageHeader
        title={`Transaction ${truncateId(txn.id, 16)}`}
        subtitle={txn.description}
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/transactions')}>Back</Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card bordered={false} title="Transaction Details" style={{ borderRadius: 12, marginBottom: 16 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Transaction ID">
                <span className="font-mono text-xs">{txn.id}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color="blue">{SAGA_TYPE_LABELS[txn.sagaType]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                <span className="font-semibold text-lg">{formatPaise(txn.amountPaise)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusTag status={txn.status} config={SAGA_STATUS_CONFIG} />
              </Descriptions.Item>
              <Descriptions.Item label="Wallet ID">
                <span className="font-mono text-xs">{txn.walletId}</span>
              </Descriptions.Item>
              <Descriptions.Item label="User">{txn.userName}</Descriptions.Item>
              {txn.counterparty && (
                <Descriptions.Item label="Counterparty" span={2}>
                  <span className="font-mono text-xs">{txn.counterparty}</span>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Created">{formatDate(txn.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Completed">
                {txn.completedAt ? formatDate(txn.completedAt) : <Tag>Pending</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Idempotency Key" span={2}>
                <span className="font-mono text-xs">{txn.idempotencyKey}</span>
              </Descriptions.Item>
              {txn.error && (
                <Descriptions.Item label="Error" span={2}>
                  <span className="text-red-500">{txn.error}</span>
                </Descriptions.Item>
              )}
              {txn.retryCount > 0 && (
                <Descriptions.Item label="Retry Count">
                  <Tag color="orange">{txn.retryCount}</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <Card bordered={false} title="Payload" style={{ borderRadius: 12 }}>
            <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-auto max-h-48">
              {JSON.stringify(txn.payload, null, 2)}
            </pre>
            {txn.result && (
              <>
                <div className="font-medium text-sm mt-4 mb-2">Result</div>
                <pre className="bg-green-50 p-3 rounded-lg text-xs overflow-auto max-h-48">
                  {JSON.stringify(txn.result, null, 2)}
                </pre>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card bordered={false} title="Saga Lifecycle" style={{ borderRadius: 12 }}>
            <SagaTimeline steps={txn.steps} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
