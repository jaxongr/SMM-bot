import { api } from '@/shared/utils/axios';
import type { PaginatedResponse, ApiResponse, PaginationParams } from '@/shared/types';

export type SmsOrderStatus = 'WAITING' | 'RECEIVED' | 'CANCELED' | 'TIMEOUT';

export interface SmsOrder {
  id: string;
  userId: string;
  user?: {
    id: string;
    telegramId: string;
    username: string | null;
    firstName: string | null;
  };
  service: string;
  country: string;
  phone: string | null;
  smsCode: string | null;
  status: SmsOrderStatus;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface SmsOrderFiltersParams extends PaginationParams {
  userId?: string;
  status?: SmsOrderStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface SmsStats {
  totalOrders: number;
  receivedOrders: number;
  canceledOrders: number;
  waitingOrders: number;
  totalSpent: number;
  todayOrders: number;
}

export const smsApi = {
  getOrders: async (params: SmsOrderFiltersParams): Promise<PaginatedResponse<SmsOrder>> => {
    const { data } = await api.get('/sms/orders', { params });
    return data;
  },

  getStats: async (): Promise<ApiResponse<SmsStats>> => {
    const { data } = await api.get('/sms/orders/stats');
    return data;
  },
};
