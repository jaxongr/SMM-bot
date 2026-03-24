import { api } from '../../../shared/utils/axios';
import type {
  PaginatedResponse,
  PaginationParams,
  Ticket,
  TicketDetail,
  TicketMessage,
  TicketStatus,
  ApiResponse,
} from '../../../shared/types';

export interface TicketFilterParams extends PaginationParams {
  status?: TicketStatus;
}

export const getTickets = async (
  params: TicketFilterParams,
): Promise<PaginatedResponse<Ticket>> => {
  const { data } = await api.get('/support/tickets', { params });
  return data;
};

export const getTicketById = async (
  id: string,
): Promise<ApiResponse<TicketDetail>> => {
  const { data } = await api.get(`/support/tickets/${id}`);
  return data;
};

export const sendMessage = async (
  ticketId: string,
  content: string,
): Promise<ApiResponse<TicketMessage>> => {
  const { data } = await api.post(`/support/tickets/${ticketId}/messages`, {
    content,
  });
  return data;
};

export const updateTicketStatus = async (
  id: string,
  status: TicketStatus,
): Promise<ApiResponse<Ticket>> => {
  const { data } = await api.patch(`/support/tickets/${id}/status`, {
    status,
  });
  return data;
};
