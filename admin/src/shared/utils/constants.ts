import type { OrderStatus, PaymentMethod, PaymentStatus, TicketStatus, TransactionType } from '@/shared/types/api.types';

// ==================== Order Status ====================

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'processing',
  PROCESSING: 'processing',
  IN_PROGRESS: 'blue',
  COMPLETED: 'success',
  PARTIAL: 'warning',
  CANCELED: 'default',
  REFUNDED: 'orange',
  FAILED: 'error',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Kutilmoqda',
  PROCESSING: 'Jarayonda',
  IN_PROGRESS: 'Bajarilmoqda',
  COMPLETED: 'Yakunlangan',
  PARTIAL: 'Qisman',
  CANCELED: 'Bekor qilingan',
  REFUNDED: 'Qaytarilgan',
  FAILED: 'Xatolik',
};

// ==================== Platform ====================

export const PLATFORM_COLORS: Record<string, string> = {
  TELEGRAM: '#0088cc',
  INSTAGRAM: '#E1306C',
};

export const PLATFORM_LABELS: Record<string, string> = {
  TELEGRAM: 'Telegram',
  INSTAGRAM: 'Instagram',
};

// ==================== Payment ====================

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CLICK: 'Click',
  PAYME: 'Payme',
  CRYPTO: 'Crypto',
  ADMIN: 'Admin',
};

export const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  CLICK: '#00B4E6',
  PAYME: '#00CCCC',
  CRYPTO: '#F7931A',
  ADMIN: '#722ED1',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'processing',
  COMPLETED: 'success',
  FAILED: 'error',
  CANCELED: 'default',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Kutilmoqda',
  COMPLETED: 'Muvaffaqiyatli',
  FAILED: 'Xatolik',
  CANCELED: 'Bekor qilingan',
};

// ==================== Transaction ====================

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  TOPUP: 'Hisobni to\'ldirish',
  DEDUCT: 'Yechish',
  REFUND: 'Qaytarish',
  REFERRAL: 'Referral bonus',
  ADMIN_ADJUST: 'Admin tuzatish',
};

export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  TOPUP: 'success',
  DEDUCT: 'error',
  REFUND: 'warning',
  REFERRAL: 'blue',
  ADMIN_ADJUST: 'purple',
};

// ==================== Ticket ====================

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: 'processing',
  IN_PROGRESS: 'blue',
  RESOLVED: 'success',
  CLOSED: 'default',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Ochiq',
  IN_PROGRESS: 'Jarayonda',
  RESOLVED: 'Hal qilingan',
  CLOSED: 'Yopilgan',
};

// ==================== Pagination ====================

export const ITEMS_PER_PAGE = 20;
