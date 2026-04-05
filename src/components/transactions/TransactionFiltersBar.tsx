import { Input, Select, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTransactionsStore } from '../../store/transactions.store';
import type { SagaType, SagaStatus } from '../../types/transaction.types';

export function TransactionFiltersBar() {
  const { filters, setFilters, resetFilters } = useTransactionsStore();

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <Input
        placeholder="Search description, wallet ID, txn ID..."
        prefix={<SearchOutlined />}
        value={filters.search}
        onChange={e => setFilters({ search: e.target.value })}
        style={{ width: 300, borderRadius: 8 }}
        allowClear
      />
      <Select
        placeholder="Transaction Type"
        value={filters.sagaType}
        onChange={(v: SagaType | null) => setFilters({ sagaType: v })}
        allowClear
        style={{ width: 170 }}
        options={[
          { label: 'Add Money', value: 'ADD_MONEY' },
          { label: 'Merchant Pay', value: 'MERCHANT_PAY' },
          { label: 'P2P Transfer', value: 'P2P_TRANSFER' },
          { label: 'Bank Transfer', value: 'WALLET_TO_BANK' },
          { label: 'Bill Pay', value: 'BILL_PAY' },
          { label: 'Refund', value: 'REFUND' },
        ]}
      />
      <Select
        placeholder="Status"
        value={filters.status}
        onChange={(v: SagaStatus | null) => setFilters({ status: v })}
        allowClear
        style={{ width: 150 }}
        options={[
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Running', value: 'RUNNING' },
          { label: 'Started', value: 'STARTED' },
          { label: 'Compensated', value: 'COMPENSATED' },
          { label: 'DLQ', value: 'DLQ' },
        ]}
      />
      <Button icon={<ReloadOutlined />} onClick={resetFilters}>Reset</Button>
    </div>
  );
}
