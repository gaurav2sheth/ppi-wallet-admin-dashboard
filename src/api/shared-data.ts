// Reads real wallet app data from the shared data bridge
// This data comes from actual wallet app usage (logins, transactions, KYC changes)

export interface SharedWalletData {
  users: SharedUser[];
  transactions: SharedTransaction[];
  balances: Record<string, SharedBalance>;
}

export interface SharedUser {
  wallet_id: string;
  user_id: string;
  name: string;
  phone: string;
  kyc_tier: string;
  kyc_state: string;
  wallet_state: string;
  is_active: boolean;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface SharedTransaction {
  id: string;
  wallet_id: string;
  user_name: string;
  saga_type: string;
  status: string;
  amount_paise: string;
  description: string;
  entry_type: string;
  counterparty: string;
  created_at: string;
  synced_at: string;
}

export interface SharedBalance {
  wallet_id: string;
  balance_paise: string;
  held_paise: string;
  available_paise: string;
  kyc_tier: string;
}

const BRIDGE_URL = '/api/wallet-data';
let _cachedData: SharedWalletData | null = null;
let _lastFetch = 0;
const CACHE_TTL = 5000; // 5 seconds

export async function fetchSharedData(): Promise<SharedWalletData> {
  const now = Date.now();
  if (_cachedData && now - _lastFetch < CACHE_TTL) return _cachedData;

  try {
    const res = await fetch(BRIDGE_URL);
    if (res.ok) {
      _cachedData = await res.json();
      _lastFetch = now;
      return _cachedData!;
    }
  } catch {
    // Bridge not available (e.g., production build)
  }

  return { users: [], transactions: [], balances: {} };
}

export function hasSharedData(): boolean {
  return _cachedData !== null && (_cachedData.users.length > 0 || _cachedData.transactions.length > 0);
}
