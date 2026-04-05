import { useEffect } from 'react';
import { Card, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { PageHeader } from '../components/shared/PageHeader';
import { TransactionFiltersBar } from '../components/transactions/TransactionFiltersBar';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { RbacGate } from '../components/shared/RbacGate';
import { useTransactionsStore } from '../store/transactions.store';
import { useUIStore } from '../store/ui.store';

export function TransactionsPage() {
  const { fetchTransactions } = useTransactionsStore();
  const { setBreadcrumbs } = useUIStore();

  useEffect(() => {
    setBreadcrumbs([{ title: 'Dashboard', path: '/' }, { title: 'Transactions' }]);
    fetchTransactions();
  }, [fetchTransactions, setBreadcrumbs]);

  return (
    <div>
      <PageHeader
        title="Transaction Monitoring"
        subtitle="Monitor and investigate all wallet transactions"
        actions={
          <RbacGate permission="transactions.export">
            <Button icon={<DownloadOutlined />}>Export CSV</Button>
          </RbacGate>
        }
      />
      <Card bordered={false} style={{ borderRadius: 12 }} bodyStyle={{ padding: '16px 20px' }}>
        <TransactionFiltersBar />
        <TransactionTable />
      </Card>
    </div>
  );
}
