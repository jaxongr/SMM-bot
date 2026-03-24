import { useRef, useEffect, useState } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Select,
  Empty,
  Spin,
} from 'antd';
import { SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styled from 'styled-components';
import TicketStatusBadge from './TicketStatusBadge';
import type { TicketDetail, TicketMessage, TicketStatus } from '../../../shared/types';

const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  height: calc(100vh - 340px);
  overflow-y: auto;
`;

const MessageBubble = styled.div<{ $isAdmin: boolean }>`
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 12px;
  align-self: ${(props) => (props.$isAdmin ? 'flex-end' : 'flex-start')};
  background: ${(props) => (props.$isAdmin ? '#1890ff' : '#f0f0f0')};
  color: ${(props) => (props.$isAdmin ? '#fff' : '#000')};
`;

const MessageTime = styled.div<{ $isAdmin: boolean }>`
  font-size: 11px;
  color: ${(props) => (props.$isAdmin ? 'rgba(255,255,255,0.7)' : '#999')};
  margin-top: 4px;
  text-align: ${(props) => (props.$isAdmin ? 'right' : 'left')};
`;

const InputWrapper = styled.div`
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
`;

interface ChatWindowProps {
  ticket: TicketDetail | null;
  loading: boolean;
  onSendMessage: (content: string) => void;
  onStatusChange: (status: TicketStatus) => void;
  sending: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  ticket,
  loading,
  onSendMessage,
  onStatusChange,
  sending,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    onSendMessage(text);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!ticket) {
    return (
      <Card style={{ height: '100%' }}>
        <Empty
          description="Select a ticket to view conversation"
          style={{ marginTop: 120 }}
        />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <Typography.Text strong>{ticket.subject}</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {ticket.user?.username || ticket.userId}
            </Typography.Text>
          </div>
          <Space>
            <TicketStatusBadge status={ticket.status} />
            <Select
              size="small"
              value={ticket.status}
              onChange={onStatusChange}
              style={{ width: 130 }}
              options={[
                { label: 'Open', value: 'OPEN' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Resolved', value: 'RESOLVED' },
                { label: 'Closed', value: 'CLOSED' },
              ]}
            />
          </Space>
        </Space>
      }
      bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column' }}
    >
      {loading ? (
        <Spin tip="Loading..." style={{ width: '100%', padding: 48 }} />
      ) : (
        <MessagesContainer>
          {ticket.messages.map((msg: TicketMessage) => (
            <div key={msg.id}>
              <MessageBubble $isAdmin={msg.senderRole === 'ADMIN'}>
                {msg.content}
                <MessageTime $isAdmin={msg.senderRole === 'ADMIN'}>
                  {dayjs(msg.createdAt).format('HH:mm')}
                </MessageTime>
              </MessageBubble>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>
      )}
      <InputWrapper>
        <Input.TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={ticket.status === 'CLOSED'}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={sending}
          disabled={!inputValue.trim() || ticket.status === 'CLOSED'}
        >
          Send
        </Button>
      </InputWrapper>
    </Card>
  );
};

export default ChatWindow;
