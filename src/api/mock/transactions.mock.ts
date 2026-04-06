import type { Transaction, TransactionDetail, TransactionFilters, SagaStep, SagaType, SagaStatus, StepStatus } from '../../types/transaction.types';
import type { PaginatedResponse } from '../../types/admin.types';
import {
  resetSeed, generateUUID, generateName, generatePhone,
  generatePastDate, pickWeighted, randomBigIntPaise,
  randomInt, pickRandom, generateMerchantName,
} from './generators';

let _transactions: Transaction[] | null = null;

const SAGA_STEP_TEMPLATES: Record<string, string[]> = {
  ADD_MONEY: ['validate_limits', 'debit_source', 'credit_wallet', 'update_ledger'],
  MERCHANT_PAY: ['validate_limits', 'hold_balance', 'debit_wallet', 'credit_merchant', 'update_ledger'],
  P2P_TRANSFER: ['validate_limits', 'hold_balance', 'debit_sender', 'credit_receiver', 'update_ledger'],
  WALLET_TO_BANK: ['validate_limits', 'hold_balance', 'debit_wallet', 'initiate_bank_transfer', 'update_ledger'],
  BILL_PAY: ['validate_limits', 'hold_balance', 'debit_wallet', 'pay_biller', 'update_ledger'],
  REFUND: ['validate_refund', 'credit_wallet', 'update_ledger'],
};

function generateTransactions(): Transaction[] {
  resetSeed(200);
  const txns: Transaction[] = [];

  for (let i = 0; i < 500; i++) {
    const sagaType = pickWeighted<SagaType>(
      ['MERCHANT_PAY', 'P2P_TRANSFER', 'ADD_MONEY', 'BILL_PAY', 'WALLET_TO_BANK', 'REFUND'],
      [30, 25, 20, 15, 8, 2]
    );

    const status = pickWeighted<SagaStatus>(
      ['COMPLETED', 'RUNNING', 'COMPENSATED', 'DLQ', 'STARTED'],
      [85, 5, 5, 3, 2]
    );

    const userName = generateName();
    const amountRange = sagaType === 'ADD_MONEY' ? [100, 50000]
      : sagaType === 'MERCHANT_PAY' ? [20, 5000]
      : sagaType === 'P2P_TRANSFER' ? [50, 20000]
      : sagaType === 'WALLET_TO_BANK' ? [500, 50000]
      : [100, 5000];

    const merchant = sagaType === 'MERCHANT_PAY' ? generateMerchantName() : null;
    const description = sagaType === 'ADD_MONEY' ? 'Wallet top-up'
      : sagaType === 'MERCHANT_PAY' ? `Payment to ${merchant}`
      : sagaType === 'P2P_TRANSFER' ? `Transfer to ${generateName()}`
      : sagaType === 'WALLET_TO_BANK' ? 'Withdrawal to bank'
      : sagaType === 'BILL_PAY' ? `Bill payment - ${pickRandom(['Electricity', 'Water', 'Gas', 'DTH', 'Broadband', 'Insurance'])}`
      : 'Refund';

    const createdAt = generatePastDate(90);
    const completedAt = status === 'COMPLETED' || status === 'COMPENSATED'
      ? new Date(Date.parse(createdAt) + randomInt(1000, 30000)).toISOString()
      : null;

    txns.push({
      id: generateUUID(),
      sagaType, status,
      amountPaise: randomBigIntPaise(amountRange[0], amountRange[1]),
      walletId: `WAL_${generateUUID().slice(0, 12)}`,
      userName, userPhone: generatePhone(),
      counterparty: merchant ?? (sagaType === 'P2P_TRANSFER' ? `WAL_${generateUUID().slice(0, 12)}` : null),
      description,
      idempotencyKey: generateUUID(),
      error: status === 'DLQ' ? pickRandom([
        'Insufficient balance', 'Bank timeout', 'Biller unavailable',
        'Rate limit exceeded', 'Duplicate transaction',
      ]) : null,
      createdAt,
      updatedAt: completedAt ?? createdAt,
      completedAt,
    });
  }

  return txns.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

// Convert shared wallet app transactions to Transaction format
function convertSharedTransactions(shared: import('../shared-data').SharedTransaction[]): Transaction[] {
  return shared.map((t) => ({
    id: t.id,
    sagaType: (t.saga_type || 'MERCHANT_PAY') as SagaType,
    status: (t.status || 'COMPLETED') as SagaStatus,
    walletId: t.wallet_id,
    userName: t.user_name,
    userPhone: '',
    amountPaise: t.amount_paise,
    counterparty: t.counterparty || null,
    description: t.description,
    idempotencyKey: generateUUID(),
    error: null,
    createdAt: t.created_at,
    updatedAt: t.created_at,
    completedAt: t.created_at,
    _isRealTxn: true,
  } as Transaction & { _isRealTxn?: boolean }));
}

let _sharedTransactions: Transaction[] = [];

export function injectSharedTransactions(shared: import('../shared-data').SharedTransaction[]) {
  _sharedTransactions = convertSharedTransactions(shared);
  _transactions = null; // Force re-merge
}

function getTransactions(): Transaction[] {
  if (!_transactions) {
    const mockTxns = generateTransactions();
    // Real wallet transactions appear first (most recent)
    _transactions = [..._sharedTransactions, ...mockTxns].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }
  return _transactions;
}

export function mockGetTransactions(filters: TransactionFilters): PaginatedResponse<Transaction> {
  let data = [...getTransactions()];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    data = data.filter(t =>
      t.description.toLowerCase().includes(q) ||
      t.walletId.toLowerCase().includes(q) ||
      t.userName.toLowerCase().includes(q) ||
      t.id.includes(q)
    );
  }

  if (filters.sagaType) data = data.filter(t => t.sagaType === filters.sagaType);
  if (filters.status) data = data.filter(t => t.status === filters.status);
  if (filters.walletId) data = data.filter(t => t.walletId === filters.walletId);
  if (filters.amountMin !== null) data = data.filter(t => Number(t.amountPaise) >= filters.amountMin! * 100);
  if (filters.amountMax !== null) data = data.filter(t => Number(t.amountPaise) <= filters.amountMax! * 100);
  if (filters.dateFrom) data = data.filter(t => t.createdAt >= filters.dateFrom!);
  if (filters.dateTo) data = data.filter(t => t.createdAt <= filters.dateTo!);

  const dir = filters.sortOrder === 'ascend' ? 1 : -1;
  data.sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[filters.sortField];
    const bVal = (b as unknown as Record<string, unknown>)[filters.sortField];
    if (typeof aVal === 'string' && typeof bVal === 'string') return aVal.localeCompare(bVal) * dir;
    return 0;
  });

  const total = data.length;
  const start = (filters.page - 1) * filters.pageSize;
  const paged = data.slice(start, start + filters.pageSize);

  return { data: paged, total, page: filters.page, pageSize: filters.pageSize, totalPages: Math.ceil(total / filters.pageSize) };
}

export function mockGetTransactionDetail(txnId: string): TransactionDetail | null {
  const txn = getTransactions().find(t => t.id === txnId);
  if (!txn) return null;

  resetSeed(txnId.charCodeAt(0) * 50 + txnId.charCodeAt(3));

  const stepNames = SAGA_STEP_TEMPLATES[txn.sagaType] ?? ['step_1', 'step_2', 'step_3'];
  const steps: SagaStep[] = stepNames.map((stepName, idx) => {
    let stepStatus: StepStatus = 'COMPLETED';
    if (txn.status === 'STARTED') {
      stepStatus = idx === 0 ? 'RUNNING' : 'PENDING';
    } else if (txn.status === 'RUNNING') {
      stepStatus = idx < 2 ? 'COMPLETED' : idx === 2 ? 'RUNNING' : 'PENDING';
    } else if (txn.status === 'DLQ') {
      stepStatus = idx < stepNames.length - 1 ? 'COMPLETED' : 'FAILED';
    } else if (txn.status === 'COMPENSATED') {
      stepStatus = idx < stepNames.length - 1 ? 'COMPENSATED' : 'FAILED';
    }

    const baseTime = Date.parse(txn.createdAt);
    return {
      id: generateUUID(),
      stepIndex: idx,
      stepName,
      status: stepStatus,
      result: stepStatus === 'COMPLETED' ? { success: true } : null,
      error: stepStatus === 'FAILED' ? txn.error : null,
      compensated: stepStatus === 'COMPENSATED',
      compensateError: null,
      executedAt: stepStatus !== 'PENDING' ? new Date(baseTime + idx * randomInt(500, 3000)).toISOString() : null,
      compensatedAt: stepStatus === 'COMPENSATED' ? new Date(baseTime + (idx + stepNames.length) * 2000).toISOString() : null,
    };
  });

  return {
    ...txn,
    payload: {
      wallet_id: txn.walletId,
      amount_paise: txn.amountPaise,
      ...(txn.counterparty ? { counterparty: txn.counterparty } : {}),
    },
    result: txn.status === 'COMPLETED' ? { saga_id: txn.id, success: true } : null,
    steps,
    retryCount: txn.status === 'DLQ' ? randomInt(1, 3) : 0,
  };
}
