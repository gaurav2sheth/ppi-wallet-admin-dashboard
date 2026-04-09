import { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Typography, Space } from 'antd';
import { SendOutlined, RobotOutlined, CloseOutlined, MessageOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const SUGGESTED_QUESTIONS = [
  'List all wallet users',
  'Show transactions for Anita Desai',
  'Which transactions look suspicious?',
  'What is the balance of user_001?',
];

/** Local fallback responses when Claude API is unavailable (e.g. GitHub Pages) */
function getLocalResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('user') && (lower.includes('list') || lower.includes('all'))) {
    return '**Wallet Users:**\n\n| ID | Name | Status | Balance |\n|---|---|---|---|\n| user_001 | Gaurav Sheth | ACTIVE | ₹23,611.00 |\n| user_002 | Priya Sharma | ACTIVE | ₹8,750.50 |\n| user_003 | Rohan Mehta | ACTIVE | ₹3,420.00 |\n| user_004 | Anita Desai | ACTIVE | ₹1,52,000.00 |\n| user_005 | Vikram Patel | SUSPENDED | ₹500.00 |';
  }
  if (lower.includes('suspicious') || lower.includes('flag') || lower.includes('fraud')) {
    return 'Potential suspicious transactions detected:\n\n1. **txn_004** — ₹12,000.00 (Amazon purchase by user_001) — exceeds ₹10,000 single transaction threshold\n2. **txn_017** — ₹12,000.00 (P2P transfer to unknown wallet by user_004) — transfer to unverified wallet\n3. **txn_016** — ₹15,000.00 (NEFT top-up by user_004) — high-value load\n\nThese exceed the RBI PPI single-transaction advisory limit of ₹10,000.';
  }
  if (lower.includes('balance')) {
    return 'Here are the current wallet balances:\n\n• Gaurav Sheth (user_001): ₹23,611.00\n• Priya Sharma (user_002): ₹8,750.50\n• Rohan Mehta (user_003): ₹3,420.00\n• Anita Desai (user_004): ₹1,52,000.00\n• Vikram Patel (user_005): ₹500.00 (SUSPENDED)';
  }
  if (lower.includes('transaction') || lower.includes('anita') || lower.includes('user_004')) {
    return 'Transactions for Anita Desai (user_004):\n\n1. ₹15,000.00 — Wallet top-up via NEFT (2 days ago) ✅\n2. ₹12,000.00 — P2P transfer to unknown wallet ID (3 days ago) ✅\n3. ₹10,000.00 — Wallet top-up via UPI - 3rd load this week (4 days ago) ✅\n\nTotal: ₹37,000.00 across 3 transactions. High-value activity pattern noted.';
  }
  return 'I can help you with:\n\n• Listing all wallet users and their balances\n• Viewing transaction history for any user\n• Identifying suspicious transactions\n• Flagging transactions for review\n\nTry asking "List all users" or "Which transactions look suspicious?".\n\n(Note: Full AI chat requires a local dev server with an Anthropic API key configured.)';
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
