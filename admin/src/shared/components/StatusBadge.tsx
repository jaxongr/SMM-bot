import { Tag } from 'antd';
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  TICKET_STATUS_COLORS,
  TICKET_STATUS_LABELS,
  TRANSACTION_TYPE_COLORS,
  TRANSACTION_TYPE_LABELS,
} from '@/shared/utils/constants';
import type {
  OrderStatus,
  PaymentStatus,
  TicketStatus,
  TransactionType,
} from '@/shared/types/api.types';

type StatusType = 'order' | 'payment' | 'ticket' | 'transaction';

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
}

const COLOR_MAPS: Record<StatusType, Record<string, string>> = {
  order: ORDER_STATUS_COLORS,
  payment: PAYMENT_STATUS_COLORS,
  ticket: TICKET_STATUS_COLORS,
  transaction: TRANSACTION_TYPE_COLORS,
};

const LABEL_MAPS: Record<StatusType, Record<string, string>> = {
  order: ORDER_STATUS_LABELS,
  payment: PAYMENT_STATUS_LABELS,
  ticket: TICKET_STATUS_LABELS,
  transaction: TRANSACTION_TYPE_LABELS,
};

export function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
  const colorMap = COLOR_MAPS[type];
  const labelMap = LABEL_MAPS[type];

  const color = colorMap[status as OrderStatus | PaymentStatus | TicketStatus | TransactionType] || 'default';
  const label = labelMap[status as OrderStatus | PaymentStatus | TicketStatus | TransactionType] || status;

  return <Tag color={color}>{label}</Tag>;
}
