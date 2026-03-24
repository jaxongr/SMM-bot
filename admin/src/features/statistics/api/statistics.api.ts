import { api } from '../../../shared/utils/axios';
import type {
  ApiResponse,
  DashboardStats,
  RevenueDataPoint,
  OrdersStatsData,
  UserGrowthDataPoint,
  ProviderStatsData,
} from '../../../shared/types';

export interface DateRangeParams {
  dateFrom?: string;
  dateTo?: string;
}

export const getDashboardStats = async (): Promise<
  ApiResponse<DashboardStats>
> => {
  const { data } = await api.get('/statistics/dashboard');
  return data;
};

export const getRevenueChart = async (
  params: DateRangeParams,
): Promise<ApiResponse<RevenueDataPoint[]>> => {
  const { data } = await api.get('/statistics/revenue', { params });
  return data;
};

export const getOrdersStats = async (
  params: DateRangeParams,
): Promise<ApiResponse<OrdersStatsData>> => {
  const { data } = await api.get('/statistics/orders', { params });
  return data;
};

export const getUserGrowth = async (
  params: DateRangeParams,
): Promise<ApiResponse<UserGrowthDataPoint[]>> => {
  const { data } = await api.get('/statistics/users', { params });
  return data;
};

export const getProviderStats = async (): Promise<
  ApiResponse<ProviderStatsData[]>
> => {
  const { data } = await api.get('/statistics/providers');
  return data;
};
