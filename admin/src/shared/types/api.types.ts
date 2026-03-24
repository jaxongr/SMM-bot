// ==================== Generic API Types ====================

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ==================== Enums ====================

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type Platform = 'TELEGRAM' | 'INSTAGRAM';

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'CANCELED'
  | 'REFUNDED'
  | 'FAILED';

export type TransactionType =
  | 'TOPUP'
  | 'DEDUCT'
  | 'REFUND'
  | 'REFERRAL'
  | 'ADMIN_ADJUST';

export type PaymentMethod = 'CLICK' | 'PAYME' | 'CRYPTO' | 'ADMIN';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELED';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type NotificationTarget = 'ALL' | 'USER' | 'ROLE';

// ==================== Localized JSON ====================

export interface LocalizedText {
  uz: string;
  ru: string;
  en: string;
}

// ==================== Entity Types ====================

export interface User {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  balance: string;
  role: UserRole;
  language: string;
  isBlocked: boolean;
  referralCode: string;
  referredById: string | null;
  referredBy?: User | null;
  referrals?: User[];
  orders?: Order[];
  transactions?: Transaction[];
  payments?: Payment[];
  supportTickets?: SupportTicket[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Category {
  id: string;
  name: LocalizedText;
  slug: string;
  platform: Platform;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  services?: Service[];
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  categoryId: string;
  category?: Category;
  name: LocalizedText;
  description: LocalizedText | null;
  minQuantity: number;
  maxQuantity: number;
  pricePerUnit: string;
  isActive: boolean;
  isAutoService: boolean;
  sortOrder: number;
  dripFeed: boolean;
  providerMappings?: ServiceProviderMapping[];
  orders?: Order[];
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string;
  balance: string;
  isActive: boolean;
  priority: number;
  lastSyncAt: string | null;
  description: string | null;
  services?: ProviderService[];
  orders?: Order[];
  mappings?: ServiceProviderMapping[];
  createdAt: string;
  updatedAt: string;
}

export interface ProviderService {
  id: string;
  providerId: string;
  provider?: Provider;
  externalServiceId: string;
  name: string;
  category: string | null;
  pricePerUnit: string;
  minQuantity: number;
  maxQuantity: number;
  isActive: boolean;
  mappings?: ServiceProviderMapping[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceProviderMapping {
  id: string;
  serviceId: string;
  service?: Service;
  providerServiceId: string;
  providerService?: ProviderService;
  providerId: string;
  provider?: Provider;
  priority: number;
  isActive: boolean;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  serviceId: string;
  service?: Service;
  link: string;
  quantity: number;
  totalPrice: string;
  status: OrderStatus;
  startCount: number | null;
  currentCount: number | null;
  remains: number | null;
  providerId: string | null;
  provider?: Provider | null;
  providerOrderId: string | null;
  providerResponse: unknown | null;
  isAutoOrder: boolean;
  autoExpiresAt: string | null;
  dripFeedInterval: number | null;
  dripFeedQuantity: number | null;
  refillCount: number;
  lastRefillAt: string | null;
  errorMessage: string | null;
  completedAt: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  user?: User;
  type: TransactionType;
  amount: string;
  balanceAfter: string;
  description: string | null;
  metadata: unknown | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  user?: User;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  externalId: string | null;
  metadata: unknown | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: LocalizedText;
  message: LocalizedText;
  targetType: NotificationTarget;
  targetId: string | null;
  recipients?: UserNotification[];
  createdAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  user?: User;
  notificationId: string;
  notification?: Notification;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  user?: User;
  subject: string;
  status: TicketStatus;
  messages?: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  ticket?: SupportTicket;
  senderId: string;
  isAdmin: boolean;
  message: string;
  fileUrl: string | null;
  createdAt: string;
}

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  group: string;
  updatedAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  earnedAmount: string;
  ordersCount: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== Dashboard Types ====================

export interface DashboardStats {
  totalUsers: number;
  todayOrders: number;
  totalRevenue: string;
  activeOrders: number;
  usersChange: number;
  ordersChange: number;
  revenueChange: number;
  activeOrdersChange: number;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  orders: number;
}

// ==================== Auth Types ====================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
