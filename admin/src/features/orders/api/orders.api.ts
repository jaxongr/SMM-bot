import { api } from '@/shared/utils/axios';
import type {
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
  OrderStatus,
  Platform,
} from '@/shared/types';

export interface Order {
  id: string;
  userId: string;
  user?: {
    id: string;
    telegramId: string;
    username: string | null;
    firstName: string | null;
  };
  serviceId: string;
  service?: {
    id: string;
    name: Record<string, string>;
    platform: Platform;
  };
  link: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  providerOrderId: string | null;
  providerName: string | null;
  startCount: number | null;
  remains: number | null;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderFiltersParams extends PaginationParams {
  status?: OrderStatus[];
  serviceId?: string;
  platform?: Platform;
  dateFrom?: string;
  dateTo?: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

export const ordersApi = {
  getOrders: async (params: OrderFiltersParams): Promise<PaginatedResponse<Order>> => {
    const { data } = await api.get('/orders', { params });
    return data;
  },

  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  cancelOrder: async (id: string): Promise<ApiResponse<Order>> => {
    const { data } = await api.post(`/orders/${id}/cancel`);
    return data;
  },

  refillOrder: async (id: string): Promise<ApiResponse<Order>> => {
    const { data } = await api.post(`/orders/${id}/refill`);
    return data;
  },

  getOrderStats: async (): Promise<ApiResponse<OrderStats>> => {
    const { data } = await api.get('/orders/stats');
    return data;
  },
};
