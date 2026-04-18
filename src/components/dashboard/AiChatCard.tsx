import { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, Tag } from 'antd';
import { SendOutlined, RobotOutlined, CloseOutlined, MessageOutlined, FileTextOutlined } from '@ant-design/icons';
import { mockGetUsers } from '../../api/mock/users.mock';
import { mockGetTransactions } from '../../api/mock/transactions.mock';
import { DEFAULT_USER_FILTERS } from '../../types/user.types';
import { DEFAULT_TRANSACTION_FILTERS } from '../../types/transaction.types';
import axios from 'axios';

const { Text } = Typography;

interface ChatMessageMeta {
  intent?: string;
  tools_used?: string[];
  response_time_ms?: number;
  ticket_id?: string;
  resolved?: boolean;
  confidence?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  meta?: ChatMessageMeta;
}

const SUGGESTED_QUESTIONS = [
  'Show user statistics',
  'List all wallet users',
  'Which transactions look suspicious?',
  'Check support tickets',
  'Show support analytics',
];

function formatPaise(paise: string | number): string {
  return '₹' + (Number(paise) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function daysAgoLabel(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff === 0) return 'today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

/** Extract user_id from message if it contains a user_ pattern */
function extractUserId(message: string): string | null {
  const match = message.match(/user_[a-zA-Z0-9_-]+/i);
  return match ? match[0] : null;
}

/** Local fallback responses built from real mock data */
function getLocalResponse(message: string): string {
  const lower = message.toLowerCase();

  const uf = (overrides: Partial<typeof DEFAULT_USER_FILTERS> = {}) => ({ ...DEFAULT_USER_FILTERS, ...overrides });
  const tf = (overrides: Partial<typeof DEFAULT_TRANSACTION_FILTERS> = {}) => ({ ...DEFAULT_TRANSACTION_FILTERS, ...overrides });

  if (lower.includes('user') && (lower.includes('list') || lower.includes('all'))) {
    const { data: users, total } = mockGetUsers(uf({ pageSize: 10 }));
    const lines = users.slice(0, 10).map(u =>
      `• ${u.name} (${u.walletState}) — Balance: ${formatPaise(u.balancePaise)} | KYC: ${u.kycState}`
    );
    return `Showing ${users.length} of ${total} wallet users:\n\n${lines.join('\n')}\n\n${total > 10 ? `... and ${total - 10} more users in the system.` : ''}`;
  }

  if (lower.includes('statistic') || lower.includes('stats') || lower.includes('overview') || lower.includes('summary')) {
    const { data: allUsers, total: totalUsers } = mockGetUsers(uf({ pageSize: 1000 }));
    const active = allUsers.filter(u => u.walletState === 'ACTIVE').length;
    const suspended = allUsers.filter(u => u.walletState === 'SUSPENDED').length;
    const dormant = allUsers.filter(u => u.walletState === 'DORMANT').length;
    const fullKyc = allUsers.filter(u => u.kycState === 'FULL_KYC').length;
    const totalBalance = allUsers.reduce((s, u) => s + Number(u.balancePaise), 0);

    const { data: txns, total: totalTxns } = mockGetTransactions(tf({ pageSize: 1000 }));
    const completed = txns.filter(t => t.status === 'COMPLETED').length;
    const failed = txns.filter(t => t.status === 'DLQ').length;
    const totalTxnValue = txns.reduce((s, t) => s + Number(t.amountPaise), 0);

    return `Dashboard Overview:\n\nUsers: ${totalUsers} total (${active} active, ${suspended} suspended, ${dormant} dormant)\nKYC: ${fullKyc} fully verified (${((fullKyc / totalUsers) * 100).toFixed(1)}%)\nTotal Wallet Balance: ${formatPaise(totalBalance)}\n\nTransactions: ${totalTxns} total (${completed} completed, ${failed} failed/DLQ)\nTotal Transaction Value: ${formatPaise(totalTxnValue)}`;
  }

  if (lower.includes('suspicious') || lower.includes('flag') || lower.includes('fraud') || lower.includes('risk')) {
    const { data: txns } = mockGetTransactions(tf({ pageSize: 500 }));
    const suspicious = txns.filter(t =>
      Number(t.amountPaise) >= 1000000 || t.status === 'DLQ' || t.status === 'COMPENSATED'
    ).slice(0, 8);

    if (suspicious.length === 0) return 'No suspicious transactions detected at this time.';

    const lines = suspicious.map(t => {
      const reasons: string[] = [];
      if (Number(t.amountPaise) >= 1000000) reasons.push('high-value (>₹10,000)');
      if (t.status === 'DLQ') reasons.push(`failed: ${t.error || 'unknown error'}`);
      if (t.status === 'COMPENSATED') reasons.push('compensated/rolled back');
      return `• ${formatPaise(t.amountPaise)} — ${t.description} by ${t.userName} (${daysAgoLabel(t.createdAt)})\n  Flags: ${reasons.join(', ')}`;
    });

    return `Potentially suspicious transactions (${suspicious.length} found):\n\n${lines.join('\n\n')}\n\nCriteria: Amount >₹10,000, DLQ status, or compensated transactions.`;
  }

  if (lower.includes('transaction') || lower.includes('recent') || lower.includes('activity')) {
    const { data: users } = mockGetUsers(uf({ pageSize: 200 }));
    const matchedUser = users.find(u => lower.includes(u.name.toLowerCase()));

    if (matchedUser) {
      const { data: txns } = mockGetTransactions(tf({ pageSize: 500, walletId: matchedUser.walletId }));
      const userTxns = txns.filter(t => t.walletId === matchedUser.walletId).slice(0, 8);
      if (userTxns.length === 0) return `No transactions found for ${matchedUser.name}.`;

      const lines = userTxns.map(t =>
        `• ${formatPaise(t.amountPaise)} — ${t.description} (${t.status}) — ${daysAgoLabel(t.createdAt)}`
      );
      const total = userTxns.reduce((s, t) => s + Number(t.amountPaise), 0);
      return `Transactions for ${matchedUser.name} (${matchedUser.walletState}):\n\n${lines.join('\n')}\n\nTotal value: ${formatPaise(total)} across ${userTxns.length} transactions.`;
    }

    const { data: txns } = mockGetTransactions(tf({ pageSize: 10 }));
    const lines = txns.map(t =>
      `• ${formatPaise(t.amountPaise)} — ${t.sagaType} — ${t.description} by ${t.userName} (${t.status}) — ${daysAgoLabel(t.createdAt)}`
    );
    return `Recent transactions (latest 10):\n\n${lines.join('\n')}`;
  }

  if (lower.includes('balance')) {
    const { data: users } = mockGetUsers(uf({ pageSize: 10, sortField: 'balancePaise' }));
    const lines = users.slice(0, 10).map(u =>
      `• ${u.name} — ${formatPaise(u.balancePaise)} (${u.walletState})`
    );
    const totalBalance = users.reduce((s, u) => s + Number(u.balancePaise), 0);
    return `Top 10 wallets by balance:\n\n${lines.join('\n')}\n\nCombined balance: ${formatPaise(totalBalance)}`;
  }

  // Default
  const { total: totalUsers } = mockGetUsers(uf({ pageSize: 1 }));
  const { total: totalTxns } = mockGetTransactions(tf({ pageSize: 1 }));
  return `I can help you with (${totalUsers} users, ${totalTxns} transactions in the system):\n\n• List all wallet users and their balances\n• View transaction history (all or by user name)\n• Identify suspicious transactions\n• Show user/transaction statistics\n\nTry asking "List all users" or "Which transactions look suspicious?".`;
}

export function AiChatCard() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const trimmedText = text.trim();
    const userId = extractUserId(trimmedText);
    const apiBase = import.meta.env.VITE_API_URL || '';

    try {
      if (userId) {
        // Route to support endpoint for user-specific queries
        // Build context from dashboard mock data for the target user
        const uf = (overrides: Partial<typeof DEFAULT_USER_FILTERS> = {}) => ({ ...DEFAULT_USER_FILTERS, ...overrides });
        const tf = (overrides: Partial<typeof DEFAULT_TRANSACTION_FILTERS> = {}) => ({ ...DEFAULT_TRANSACTION_FILTERS, ...overrides });
        const { data: allUsers } = mockGetUsers(uf({ pageSize: 200 }));
        const matchedUser = allUsers.find(u => u.walletId === userId);
        const { data: userTxns } = mockGetTransactions(tf({ pageSize: 50, walletId: userId }));
        const filteredTxns = userTxns.filter(t => t.walletId === userId).slice(0, 10);

        const supportContext = matchedUser ? {
          balance_paise: String(matchedUser.balancePaise),
          balance_formatted: formatPaise(matchedUser.balancePaise),
          user_name: matchedUser.name,
          kyc_tier: matchedUser.kycState,
          recent_transactions: filteredTxns.map(t => ({
            entry_type: t.sagaType === 'ADD_MONEY' ? 'CREDIT' : 'DEBIT',
            amount_paise: String(t.amountPaise),
            amount_formatted: formatPaise(t.amountPaise),
            description: t.description,
            transaction_type: t.sagaType,
            created_at: t.createdAt,
          })),
        } : undefined;

        const payload: Record<string, unknown> = {
          user_id: userId,
          message: trimmedText,
          ...(sessionId ? { session_id: sessionId } : {}),
          ...(supportContext ? { context: supportContext } : {}),
        };

        const res = await axios.post(`${apiBase}/api/support/chat`, payload, { timeout: 60000 });
        const data = res.data;

        // Persist session
        if (data.session_id) {
          setSessionId(data.session_id);
        }

        const meta: ChatMessageMeta = {
          intent: data.intent_detected,
          tools_used: data.tools_used,
          response_time_ms: data.response_time_ms,
          ticket_id: data.ticket_id ?? undefined,
          resolved: data.resolved,
          confidence: data.confidence,
        };

        setMessages(prev => [...prev, { role: 'assistant', text: data.response_text, meta }]);
      } else {
        // Admin analytics queries — use original endpoint
        const uf = (overrides: Partial<typeof DEFAULT_USER_FILTERS> = {}) => ({ ...DEFAULT_USER_FILTERS, ...overrides });
        const tf = (overrides: Partial<typeof DEFAULT_TRANSACTION_FILTERS> = {}) => ({ ...DEFAULT_TRANSACTION_FILTERS, ...overrides });
        const { data: ctxUsers, total: totalUsers } = mockGetUsers(uf({ pageSize: 20 }));
        const { data: ctxTxns, total: totalTxns } = mockGetTransactions(tf({ pageSize: 15 }));
        const context = {
          total_users: totalUsers,
          total_transactions: totalTxns,
          users: ctxUsers.slice(0, 20).map(u => ({
            name: u.name,
            wallet_id: u.walletId,
            balance: '₹' + (Number(u.balancePaise) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            wallet_state: u.walletState,
            kyc_state: u.kycState,
          })),
          recent_transactions: ctxTxns.slice(0, 15).map(t => ({
            id: t.id,
            user_name: t.userName,
            saga_type: t.sagaType,
            status: t.status,
            amount: '₹' + (Number(t.amountPaise) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            description: t.description,
            created_at: t.createdAt,
          })),
        };
        const res = await axios.post(`${apiBase}/api/chat?role=admin`, { message: trimmedText, context }, { timeout: 60000 });
        setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
      }
    } catch {
      // Fallback: use real data from the app's mock layer
      setMessages(prev => [...prev, { role: 'assistant', text: getLocalResponse(trimmedText) }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <Card
        hoverable
        onClick={() => setIsExpanded(true)}
        style={{ borderRadius: 12, cursor: 'pointer' }}
      >
        <Space align="center" size="middle">
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageOutlined style={{ color: 'white', fontSize: 18 }} />
          </div>
          <div>
            <Text strong>AI Assistant</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>Ask about users, transactions, suspicious activity...</Text>
          </div>
        </Space>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <RobotOutlined style={{ color: '#7c3aed' }} />
          <span>AI Assistant</span>
        </Space>
      }
      extra={
        <Button type="text" icon={<CloseOutlined />} onClick={() => setIsExpanded(false)} size="small" />
      }
      style={{ borderRadius: 12 }}
      styles={{ body: { padding: 0 } }}
    >
      {/* Messages area */}
      <div style={{ maxHeight: 320, overflowY: 'auto', padding: '16px 16px 8px', background: '#fafafa' }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', marginBottom: 4 }}>Try one of these questions:</Text>
            {SUGGESTED_QUESTIONS.map(q => (
              <Button
                key={q}
                block
                size="small"
                onClick={() => sendMessage(q)}
                style={{ textAlign: 'left', height: 'auto', padding: '8px 12px', whiteSpace: 'normal', borderRadius: 8 }}
              >
                {q}
              </Button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '85%',
                padding: '8px 12px',
                borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                background: msg.role === 'user' ? '#7c3aed' : 'white',
                color: msg.role === 'user' ? 'white' : 'inherit',
                border: msg.role === 'assistant' ? '1px solid #f0f0f0' : 'none',
                fontSize: 13,
                lineHeight: 1.5,
                whiteSpace: 'pre-line',
              }}>
                {msg.text}
              </div>
            </div>

            {/* Metadata badges for assistant messages */}
            {msg.role === 'assistant' && msg.meta && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4, paddingLeft: 4 }}>
                {msg.meta.intent && (
                  <Tag color="blue" style={{ fontSize: 10, lineHeight: '18px', margin: 0 }}>
                    {msg.meta.intent}
                  </Tag>
                )}
                {msg.meta.tools_used && msg.meta.tools_used.length > 0 && (
                  <Tag color="purple" style={{ fontSize: 10, lineHeight: '18px', margin: 0 }}>
                    {msg.meta.tools_used.length} tool{msg.meta.tools_used.length !== 1 ? 's' : ''} used
                  </Tag>
                )}
                {msg.meta.response_time_ms != null && (
                  <Tag color="default" style={{ fontSize: 10, lineHeight: '18px', margin: 0 }}>
                    {msg.meta.response_time_ms}ms
                  </Tag>
                )}
                {msg.meta.confidence != null && (
                  <Tag color={msg.meta.confidence >= 0.8 ? 'green' : 'orange'} style={{ fontSize: 10, lineHeight: '18px', margin: 0 }}>
                    {(msg.meta.confidence * 100).toFixed(0)}% confidence
                  </Tag>
                )}
                {msg.meta.resolved === true && (
                  <Tag color="green" style={{ fontSize: 10, lineHeight: '18px', margin: 0 }}>
                    Resolved
                  </Tag>
                )}
                {msg.meta.resolved === false && (
                  <Tag color="orange" style={{ fontSize: 10, lineHeight: '18px', margin: 0 }}>
                    Unresolved
                  </Tag>
                )}
                {msg.meta.ticket_id && (
                  <Tag
                    icon={<FileTextOutlined />}
                    color="volcano"
                    style={{ fontSize: 10, lineHeight: '18px', margin: 0, cursor: 'pointer' }}
                    onClick={() => {
                      // Navigate to tickets view — use hash router link
                      window.location.hash = `#/tickets?id=${msg.meta!.ticket_id}`;
                    }}
                  >
                    View Ticket {msg.meta.ticket_id}
                  </Tag>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
            <div style={{ background: 'white', border: '1px solid #f0f0f0', padding: '8px 12px', borderRadius: '12px 12px 12px 4px', fontSize: 12, color: '#999' }}>
              <RobotOutlined spin style={{ marginRight: 6 }} /> Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '8px 12px 12px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, alignItems: 'center' }}>
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onPressEnter={() => sendMessage(input)}
          placeholder="Ask about users, transactions... (use user_id: for support queries)"
          disabled={loading}
          style={{ borderRadius: 20, flex: 1 }}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<SendOutlined />}
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
        />
      </div>

      <div style={{ padding: '0 12px 8px', textAlign: 'right' }}>
        <Text type="secondary" style={{ fontSize: 10 }}>Powered by Claude AI</Text>
      </div>
    </Card>
  );
}
