import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { TicketStatus } from '../../../shared/types';
import {
  getTickets,
  getTicketById,
  sendMessage,
  updateTicketStatus,
  type TicketFilterParams,
} from '../api/support.api';

const TICKETS_KEY = 'tickets';

export const useTickets = (params: TicketFilterParams) => {
  return useQuery({
    queryKey: [TICKETS_KEY, params],
    queryFn: () => getTickets(params),
  });
};

export const useTicketDetail = (id: string) => {
  return useQuery({
    queryKey: [TICKETS_KEY, id],
    queryFn: () => getTicketById(id),
    enabled: !!id,
    refetchInterval: 5000,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      content,
    }: {
      ticketId: string;
      content: string;
    }) => sendMessage(ticketId, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [TICKETS_KEY, variables.ticketId],
      });
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
    onError: () => {
      message.error('Failed to send message');
    },
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
      updateTicketStatus(id, status),
    onSuccess: (_data, variables) => {
      message.success('Ticket status updated');
      queryClient.invalidateQueries({
        queryKey: [TICKETS_KEY, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
    onError: () => {
      message.error('Failed to update ticket status');
    },
  });
};
