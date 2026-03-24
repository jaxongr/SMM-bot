export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'CANCELED'
  | 'FAILED';

export type Platform = 'TELEGRAM' | 'INSTAGRAM' | 'YOUTUBE' | 'TIKTOK';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELED';
export type PaymentMethod = 'CLICK' | 'PAYME' | 'CRYPTO';

export interface Payment {
  id: string;
  userId: string;
  user: { id: string; username: string; telegramId: string };
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  externalId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string;
  description: string | null;
  isActive: boolean;
  priority: number;
  balance: number | null;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderService {
  id: string;
  providerId: string;
  externalId: string;
  name: string;
  category: string;
  rate: number;
  minOrder: number;
  maxOrder: number;
  type: string;
}

export interface ServiceMapping {
  id: string;
  serviceId: string;
  providerServiceId: string;
  providerId: string;
  priority: number;
  service?: { id: string; name: string };
  providerService?: ProviderService;
  provider?: { id: string; name: string };
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeProviders: number;
  pendingPayments: number;
  todayOrders: number;
  todayRevenue: number;
  todayNewUsers: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface OrdersStatsData {
  byStatus: { status: string; count: number }[];
  byPlatform: { platform: string; count: number }[];
}

export interface UserGrowthDataPoint {
  date: string;
  newUsers: number;
  totalUsers: number;
}

export interface ProviderStatsData {
  name: string;
  orders: number;
  spending: number;
  successRate: number;
}

export interface Setting {
  key: string;
  value: string;
  group: string;
  description: string | null;
}

export type NotificationTarget = 'ALL' | 'USER' | 'ROLE';

export interface Notification {
  id: string;
  titleUz: string;
  titleRu: string | null;
  titleEn: string | null;
  messageUz: string;
  messageRu: string | null;
  messageEn: string | null;
  target: NotificationTarget;
  targetId: string | null;
  recipientsCount: number;
  createdAt: string;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Ticket {
  id: string;
  subject: string;
  status: TicketStatus;
  userId: string;
  user: { id: string; username: string; telegramId: string };
  lastMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: 'USER' | 'ADMIN';
  content: string;
  createdAt: string;
}

export interface TicketDetail extends Ticket {
  messages: TicketMessage[];
}
