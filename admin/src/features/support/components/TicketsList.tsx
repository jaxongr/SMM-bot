import { List, Typography, Space, Select, Card, Empty, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styled from 'styled-components';
import TicketStatusBadge from './TicketStatusBadge';
import type { Ticket, TicketStatus } from '../../../shared/types';

const TicketItem = styled.div<{ $active: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  background: ${(props) => (props.$active ? '#e6f7ff' : 'transparent')};
  transition: background 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? '#e6f7ff' : '#fafafa')};
  }
`;

const Subject = styled(Typography.Text)`
  font-weight: 500;
  display: block;
  margin-bottom: 4px;
`;

const Preview = styled(Typography.Text)`
  display: block;
  font-size: 12px;
`;

interface TicketsListProps {
  tickets: Ticket[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  selectedId: string | null;
  statusFilter: TicketStatus | undefined;
  onSelect: (ticket: Ticket) => void;
  onPageChange: (page: number) => void;
  onStatusFilter: (status: TicketStatus | undefined) => void;
}

const TicketsList: React.FC<TicketsListProps> = ({
  tickets,
  loading,
  total,
  page,
  limit,
  selectedId,
  statusFilter,
  onSelect,
  onPageChange,
  onStatusFilter,
}) => {
  return (
    <Card
      title="Tickets"
      extra={
        <Select
          placeholder="Status"
          allowClear
          value={statusFilter}
          onChange={onStatusFilter}
          style={{ width: 140 }}
          options={[
            { label: 'Open', value: 'OPEN' },
            { label: 'In Progress', value: 'IN_PROGRESS' },
            { label: 'Resolved', value: 'RESOLVED' },
            { label: 'Closed', value: 'CLOSED' },
          ]}
        />
      }
      bodyStyle={{ padding: 0, maxHeight: 'calc(100vh - 240px)', overflow: 'auto' }}
    >
      {loading ? (
        <Spin tip="Loading..." style={{ width: '100%', padding: 48 }} />
      ) : tickets.length === 0 ? (
        <Empty description="No tickets" style={{ padding: 48 }} />
      ) : (
        <List
          dataSource={tickets}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            size: 'small',
            onChange: onPageChange,
            style: { padding: '8px 16px' },
          }}
          renderItem={(ticket) => (
            <TicketItem
              $active={ticket.id === selectedId}
              onClick={() => onSelect(ticket)}
            >
              <Space
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                }}
              >
                <Subject ellipsis>{ticket.subject}</Subject>
                <TicketStatusBadge status={ticket.status} />
              </Space>
              <Space size={4}>
                <UserOutlined style={{ fontSize: 11, color: '#999' }} />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {ticket.user?.username || ticket.userId}
                </Typography.Text>
              </Space>
              <Preview type="secondary" ellipsis>
                {ticket.lastMessage || 'No messages yet'}
              </Preview>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 11, marginTop: 4, display: 'block' }}
              >
                {dayjs(ticket.createdAt).format('DD.MM.YYYY HH:mm')}
              </Typography.Text>
            </TicketItem>
          )}
        />
      )}
    </Card>
  );
};

export default TicketsList;
