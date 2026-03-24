import { useQuery } from '@tanstack/react-query';
import {
  getDashboardStats,
  getRevenueChart,
  getOrdersStats,
  getUserGrowth,
  getProviderStats,
  type DateRangeParams,
} from '../api/statistics.api';

const STATS_KEY = 'statistics';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: [STATS_KEY, 'dashboard'],
    queryFn: getDashboardStats,
  });
};

export const useRevenueChart = (params: DateRangeParams) => {
  return useQuery({
    queryKey: [STATS_KEY, 'revenue', params],
    queryFn: () => getRevenueChart(params),
  });
};

export const useOrdersStats = (params: DateRangeParams) => {
  return useQuery({
    queryKey: [STATS_KEY, 'orders', params],
    queryFn: () => getOrdersStats(params),
  });
};

export const useUserGrowth = (params: DateRangeParams) => {
  return useQuery({
    queryKey: [STATS_KEY, 'users', params],
    queryFn: () => getUserGrowth(params),
  });
};

export const useProviderStats = () => {
  return useQuery({
    queryKey: [STATS_KEY, 'providers'],
    queryFn: getProviderStats,
  });
};
