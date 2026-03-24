import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/features/dashboard/api/dashboard.api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRevenueChart(period: string = '30d') {
  return useQuery({
    queryKey: ['dashboard', 'revenue', period],
    queryFn: () => dashboardApi.getRevenueChart(period),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentOrders() {
  return useQuery({
    queryKey: ['dashboard', 'recentOrders'],
    queryFn: dashboardApi.getRecentOrders,
    staleTime: 60 * 1000,
  });
}
