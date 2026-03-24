import { Tag } from 'antd';
import type { OrderStatus } from '@/shared/types';

interface OrderStatusTagProps {
  status: OrderStatus;
}

const STATUS_CONFIG: Record<OrderStatus, { color: string; label: string }> = {
  PENDING: { color: 'orange', label: 'Kutilmoqda' },
  PROCESSING: { color: 'blue', label: 'Qayta ishlanmoqda' },
  IN_PROGRESS: { color: 'cyan', label: 'Jarayonda' },
  COMPLETED: { color: 'green', label: 'Bajarildi' },
  PARTIAL: { color: 'gold', label: 'Qisman' },
  CANCELED: { color: 'red', label: 'Bekor qilingan' },
  FAILED: { color: 'red', label: 'Xato' },
};

export const OrderStatusTag: React.FC<OrderStatusTagProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  return <Tag color={config.color}>{config.label}</Tag>;
};
