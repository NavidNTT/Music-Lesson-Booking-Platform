import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';

/**
 * The backend stores prices as whole integer currency units
 * (e.g. price_per_session: 300000). We format with thousands separators
 * and a neutral "Toman" suffix — adjust the currency label in one place here.
 */
const CURRENCY_LABEL = 'Toman';

export function formatCurrency(amount: number | string): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(value)) return `0 ${CURRENCY_LABEL}`;
  return `${value.toLocaleString('en-US')} ${CURRENCY_LABEL}`;
}

/** All API datetimes are UTC ISO strings; format in the viewer's local zone. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'MMM d, yyyy · h:mm a');
  } catch {
    return '—';
  }
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'h:mm a');
  } catch {
    return '—';
  }
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return `${formatDistanceToNowStrict(parseISO(iso))} ago`;
  } catch {
    return '—';
  }
}
