export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalOrders: number;
  ordersToday: number;
  activeOrders: number;
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  totalProviderBalance: number;
}

export interface RevenueChartItem {
  date: string;
  amount: number;
}

export interface OrderStats {
  byStatus: Array<{ status: string; count: number }>;
  byPlatform: Array<{ platform: string; count: number }>;
  topServices: Array<{ serviceId: string; serviceName: string; count: number; revenue: number }>;
}

export interface UserGrowthItem {
  date: string;
  count: number;
}

export interface ProviderStat {
  providerId: string;
  providerName: string;
  ordersCount: number;
  totalSpent: number;
  successRate: number;
}

export type StatsPeriod = 'day' | 'week' | 'month';
