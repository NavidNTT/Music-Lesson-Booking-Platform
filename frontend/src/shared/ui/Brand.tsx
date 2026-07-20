import { Link } from 'react-router-dom';
import { Music4 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export function Brand({ dark = false, to = '/' }: { dark?: boolean; to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2" aria-label="Cadenza home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900">
        <Music4 className="h-5 w-5 text-gold-400" aria-hidden />
      </span>
      <span
        className={cn(
          'font-display text-xl font-semibold tracking-tight',
          dark ? 'text-cream-50' : 'text-ink-900',
        )}
      >
        Cadenza
      </span>
    </Link>
  );
}
