import { Badge } from './Badge';
import { BookingStatus } from '@/shared/types/api';

const config: Record<BookingStatus, { tone: 'warning' | 'info' | 'success' | 'danger'; label: string }> = {
  pending: { tone: 'warning', label: 'Pending' },
  confirmed: { tone: 'info', label: 'Confirmed' },
  completed: { tone: 'success', label: 'Completed' },
  cancelled: { tone: 'danger', label: 'Cancelled' },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { tone, label } = config[status];
  return <Badge tone={tone}>{label}</Badge>;
}
