import { translate } from '../middlewares/i18n.middleware';

export function formatPrice(amount: number): string {
  return amount.toLocaleString('uz-UZ').replace(/,/g, ' ') + " so'm";
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

const ORDER_STATUS_KEYS: Record<string, string> = {
  PENDING: 'order_status_pending',
  PROCESSING: 'order_status_processing',
  IN_PROGRESS: 'order_status_in_progress',
  COMPLETED: 'order_status_completed',
  PARTIAL: 'order_status_partial',
  CANCELED: 'order_status_canceled',
  REFUNDED: 'order_status_canceled',
  FAILED: 'order_status_failed',
};

export function formatOrderStatus(status: string, lang: string): string {
  const key = ORDER_STATUS_KEYS[status] || 'order_status_pending';
  return translate(key, lang);
}
