import { Tag } from 'antd';
import type { TicketStatus } from '../../../shared/types';

const STATUS_CONFIG: Record<TicketStatus, { color: string; label: string }> = {
  OPEN: { color: 'blue', label: 'Open' },
  IN_PROGRESS: { color: 'orange', label: 'In Progress' },
  RESOLVED: { color: 'green', label: 'Resolved' },
  CLOSED: { color: 'default', label: 'Closed' },
};

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  return <Tag color={config.color}>{config.label}</Tag>;
};

export default TicketStatusBadge;
