import { api } from '@/shared/utils/axios';
import type {
  ApiResponse,
  DashboardStats,
  RevenueChartData,
  Order,
} from '@/shared/types/api.types';

export const dashboardApi = {
  getStats: async () => {
    const { data } = await api.get<ApiResponse<DashboardStats>>(
      '/statistics/dashboard',
    );
    return data;
  },

  getRevenueChart: async (period: string = '30d') => {
    const { data } = await api.get<ApiResponse<RevenueChartData[]>>(
      '/statistics/revenue',
      { params: { period } },
    );
    return data;
  },

  getRecentOrders: async () => {
    const { data } = await api.get<ApiResponse<Order[]>>('/orders', {
      params: {
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    });
    return data;
  },
};
