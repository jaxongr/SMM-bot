import { useState, useCallback } from 'react';
import { Typography, Row, Col } from 'antd';
import styled from 'styled-components';
import TicketsList from './components/TicketsList';
import ChatWindow from './components/ChatWindow';
import {
  useTickets,
  useTicketDetail,
  useSendMessage,
  useUpdateTicketStatus,
} from './hooks/useSupport';
import type { Ticket, TicketStatus } from '../../shared/types';

const PageWrapper = styled.div`
  padding: 24px;
`;

const SupportPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const { data: ticketsData, isLoading: ticketsLoading } = useTickets({
    page,
    limit: 20,
    status: statusFilter,
  });
  const { data: ticketDetail, isLoading: detailLoading } = useTicketDetail(
    selectedTicket?.id ?? '',
  );
  const sendMutation = useSendMessage();
  const statusMutation = useUpdateTicketStatus();

  const handleSelectTicket = useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
  }, []);

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!selectedTicket) return;
      sendMutation.mutate({ ticketId: selectedTicket.id, content });
    },
    [selectedTicket, sendMutation],
  );

  const handleStatusChange = useCallback(
    (status: TicketStatus) => {
      if (!selectedTicket) return;
      statusMutation.mutate({ id: selectedTicket.id, status });
    },
    [selectedTicket, statusMutation],
  );

  return (
    <PageWrapper>
      <Typography.Title level={2}>Support</Typography.Title>
      <Row gutter={16}>
        <Col span={8}>
          <TicketsList
            tickets={ticketsData?.data ?? []}
            loading={ticketsLoading}
            total={ticketsData?.meta?.total ?? 0}
            page={page}
            limit={20}
            selectedId={selectedTicket?.id ?? null}
            statusFilter={statusFilter}
            onSelect={handleSelectTicket}
            onPageChange={setPage}
            onStatusFilter={setStatusFilter}
          />
        </Col>
        <Col span={16}>
          <ChatWindow
            ticket={ticketDetail?.data ?? null}
            loading={detailLoading}
            onSendMessage={handleSendMessage}
            onStatusChange={handleStatusChange}
            sending={sendMutation.isPending}
          />
        </Col>
      </Row>
    </PageWrapper>
  );
};

export { SupportPage };
export default SupportPage;
