import { Input, Select, Space, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useUsersStore } from '../../store/users.store';
import type { KycTier, KycState, WalletState } from '../../types/user.types';

export function UserFiltersBar() {
  const { filters, setFilters, resetFilters } = useUsersStore();

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <Input
        placeholder="Search name, phone, wallet ID..."
        prefix={<SearchOutlined />}
        value={filters.search}
        onChange={e => setFilters({ search: e.target.value })}
        style={{ width: 280, borderRadius: 8 }}
        allowClear
      />
      <Select
        placeholder="KYC Tier"
        value={filters.kycTier}
        onChange={(v: KycTier | null) => setFilters({ kycTier: v })}
        allowClear
        style={{ width: 140 }}
        options={[
          { label: 'Minimum', value: 'MINIMUM' },
          { label: 'Full', value: 'FULL' },
        ]}
      />
      <Select
        placeholder="KYC State"
        value={filters.kycState}
        onChange={(v: KycState | null) => setFilters({ kycState: v })}
        allowClear
        style={{ width: 160 }}
        options={[
          { label: 'Full KYC', value: 'FULL_KYC' },
          { label: 'Min KYC', value: 'MIN_KYC' },
          { label: 'Pending', value: 'FULL_KYC_PENDING' },
          { label: 'Rejected', value: 'REJECTED' },
          { label: 'Unverified', value: 'UNVERIFIED' },
        ]}
      />
      <Select
        placeholder="Wallet Status"
        value={filters.walletState}
        onChange={(v: WalletState | null) => setFilters({ walletState: v })}
        allowClear
        style={{ width: 150 }}
        options={[
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Suspended', value: 'SUSPENDED' },
          { label: 'Dormant', value: 'DORMANT' },
          { label: 'Expired', value: 'EXPIRED' },
          { label: 'Closed', value: 'CLOSED' },
        ]}
      />
      <Button icon={<ReloadOutlined />} onClick={resetFilters}>Reset</Button>
    </div>
  );
}
