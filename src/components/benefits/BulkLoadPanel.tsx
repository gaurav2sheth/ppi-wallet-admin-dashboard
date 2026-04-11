import { useState } from 'react';
import { Card, Select, Input, Button, Progress, message, Radio } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';

const SUB_WALLET_TYPES = [
  { value: 'FOOD', label: '🍱 Food', color: '#F97316' },
  { value: 'NCMC TRANSIT', label: '🚇 NCMC Transit', color: '#6366F1' },
  { value: 'FASTAG', label: '🛣️ FASTag', color: '#10B981' },
  { value: 'GIFT', label: '🎁 Gift', color: '#EC4899' },
  { value: 'FUEL', label: '⛽ Fuel', color: '#EAB308' },
];

const OCCASIONS = [
  'Monthly Benefits',
  'Diwali Bonus',
  'Birthday',
  'Performance Award',
  'Festival Bonus',
];

interface BulkLoadPanelProps {
  totalUsers: number;
  onLoadComplete?: () => void;
}

export function BulkLoadPanel({ totalUsers, onLoadComplete }: BulkLoadPanelProps) {
  const [walletType, setWalletType] = useState<string>('FOOD');
  const [occasion, setOccasion] = useState<string>('Monthly Benefits');
  const [amountRupees, setAmountRupees] = useState<string>('3000');
  const [userScope, setUserScope] = useState<'all' | 'specific'>('all');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const amount = parseInt(amountRupees) || 0;
  const userCount = userScope === 'all' ? totalUsers : Math.min(10, totalUsers);
  const totalAmount = amount * userCount;

  const handleBulkLoad = async () => {
    setLoading(true);
    setProgress(0);
    setResult(null);

    // Simulate bulk loading with progress
    let loaded = 0;
    const interval = setInterval(() => {
      loaded += Math.ceil(userCount / 10);
      if (loaded >= userCount) loaded = userCount;
      setProgress(Math.round((loaded / userCount) * 100));
      if (loaded >= userCount) {
        clearInterval(interval);
        const failed = Math.floor(Math.random() * 3); // Simulate 0-2 failures
        setResult({ success: userCount - failed, failed });
        setLoading(false);
        message.success(`${userCount - failed} wallets loaded successfully!`);
        onLoadComplete?.();
      }
    }, 200);
  };

  const selectedType = SUB_WALLET_TYPES.find(t => t.value === walletType);

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <ThunderboltOutlined style={{ color: '#F97316' }} />
          <span>Bulk Load Benefits</span>
        </div>
      }
      style={{ borderRadius: 12 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Wallet Type */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: '#666' }}>
            Sub-Wallet Type
          </label>
          <Select
            value={walletType}
            onChange={setWalletType}
            style={{ width: '100%' }}
            options={SUB_WALLET_TYPES.map(t => ({
              value: t.value,
              label: <span>{t.label}</span>,
            }))}
          />
        </div>

        {/* Occasion */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: '#666' }}>
            Occasion
          </label>
          <Select
            value={occasion}
            onChange={setOccasion}
            style={{ width: '100%' }}
            options={OCCASIONS.map(o => ({ value: o, label: o }))}
          />
        </div>

        {/* Amount */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: '#666' }}>
            Amount per user (₹)
          </label>
          <Input
            prefix="₹"
            value={amountRupees}
            onChange={e => setAmountRupees(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="3000"
            size="large"
          />
        </div>

        {/* User Scope */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block', color: '#666' }}>
            Users
          </label>
          <Radio.Group value={userScope} onChange={e => setUserScope(e.target.value)}>
            <Radio value="all">All users ({totalUsers})</Radio>
            <Radio value="specific">Selected users (10)</Radio>
          </Radio.Group>
        </div>

        {/* Preview */}
        {amount > 0 && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 10,
            background: selectedType ? `${selectedType.color}10` : '#f5f5f5',
            border: `1px solid ${selectedType?.color || '#eee'}30`,
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
              {selectedType?.label} Loading ₹{amount.toLocaleString('en-IN')} {walletType} wallet for {userCount} users
            </p>
            <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Total: ₹{totalAmount.toLocaleString('en-IN')} | Occasion: {occasion}
            </p>
          </div>
        )}

        {/* Progress */}
        {loading && (
          <Progress percent={progress} status="active" strokeColor={selectedType?.color} />
        )}

        {/* Result */}
        {result && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 10,
            background: '#ECFDF3',
            border: '1px solid #12B76A30',
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#12B76A' }}>
              {result.success} wallets loaded successfully
            </p>
            {result.failed > 0 && (
              <p style={{ fontSize: 12, color: '#F04438', marginTop: 2 }}>
                {result.failed} failed (cap exceeded)
              </p>
            )}
          </div>
        )}

        {/* Action */}
        <Button
          type="primary"
          size="large"
          loading={loading}
          disabled={amount <= 0}
          onClick={handleBulkLoad}
          block
          style={{ borderRadius: 10, height: 44 }}
        >
          {loading ? 'Loading Benefits...' : 'Load Benefits'}
        </Button>
      </div>
    </Card>
  );
}
