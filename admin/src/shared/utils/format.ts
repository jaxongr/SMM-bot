import dayjs from 'dayjs';

/**
 * Format price with thousands separator and currency suffix
 * @example formatPrice(1250000) → "1 250 000 so'm"
 */
export function formatPrice(amount: number): string {
  const formatted = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u00A0/g, ' ');

  return `${formatted} so'm`;
}

/**
 * Format date string to DD.MM.YYYY HH:mm
 * @example formatDate('2024-01-15T10:30:00Z') → "15.01.2024 10:30"
 */
export function formatDate(date: string): string {
  return dayjs(date).format('DD.MM.YYYY HH:mm');
}

/**
 * Format number with thousands separator
 * @example formatNumber(1250000) → "1 250 000"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ru-RU')
    .format(num)
    .replace(/\u00A0/g, ' ');
}
