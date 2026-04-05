import { Table, Tag } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useTransactionsStore } from '../../store/transactions.store';
import { StatusTag } from '../shared/StatusTag';
import { SAGA_STATUS_CONFIG, SAGA_TYPE_LABELS } from '../../utils/constants';
import { formatPaise, formatDate } from '../../utils/format';
import type { Transaction } from '../../types/transaction.types';

export function TransactionTable() {
  const navigate = useNavigate();
  const { transactions, total, filters, isLoading, setFilters } = useTransactionsStore();

  const columns: ColumnsType<Transaction> = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      width: 140,
      render: (v: string) => <span className="text-xs font-mono">{v.slice(0, 12)}...</span>,
    },
    {
      title: 'Type',
      dataIndex: 'sagaType',
      width: 140,
      render: (v: string) => <Tag color="blue">{SAGA_TYPE_LABELS[v] ?? v}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 220,
      ellipsis: true,
    },
    {
      title: 'Amount',
      dataIndex: 'amountPaise',
      width: 130,
      sorter: true,
      render: (v: string) => <span className="font-medium">{formatPaise(v)}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (v: string) => <StatusTag status={v} config={SAGA_STATUS_CONFIG} />,
    },
    {
      title: 'User',
      dataIndex: 'userName',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      width: 160,
      sorter: true,
      render: (v: string) => <span className="text-xs">{formatDate(v)}</span>,
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig, _: unknown, sorter: unknown) => {
    const s = sorter as { field?: string; order?: 'ascend' | 'descend' };
    setFilters({
      page: pagination.current ?? 1,
      pageSize: pagination.pageSize ?? 20,
      ...(s.field ? { sortField: s.field, sortOrder: s.order ?? 'descend' } : {}),
    });
  };

  return (
    <Table<Transaction>
      columns={columns}
      dataSource={transactions}
      rowKey="id"
      loading={isLoading}
      pagination={{
        current: filters.page,
        pageSize: filters.pageSize,
        total,
        showSizeChanger: true,
        showTotal: (t) => `${t} transactions`,
      }}
      onChange={handleTableChange}
      onRow={(record) => ({
        onClick: () => navigate(`/transactions/${record.id}`),
        style: { cursor: 'pointer' },
      })}
      size="middle"
      scroll={{ x: 1060 }}
    />
  );
}
