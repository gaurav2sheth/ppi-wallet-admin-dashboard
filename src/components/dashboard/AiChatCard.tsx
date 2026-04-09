import { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Typography, Space } from 'antd';
import { SendOutlined, RobotOutlined, CloseOutlined, MessageOutlined } from '@ant-design/icons';
import { mockGetUsers } from '../../api/mock/users.mock';
import { mockGetTransactions } from '../../api/mock/transactions.mock';
import { DEFAULT_USER_FILTERS } from '../../types/user.types';
import { DEFAULT_TRANSACTION_FILTERS } from '../../types/transaction.types';
import axios from 'axios';

const { Text } = Typography;

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const SUGGESTED_QUESTIONS = [
  'List all wallet users',
  'Show recent transactions',
  'Which transactions look suspicious?',
  'Show user statistics',
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

    try {
      const res = await axios.post('/api/chat', { message: text.trim() }, { timeout: 60000 });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
    } catch {
      // Fallback: use real data from the app's mock layer
      setMessages(prev => [...prev, { role: 'assistant', text: getLocalResponse(text) }]);
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
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
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
          placeholder="Ask about users, transactions..."
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
