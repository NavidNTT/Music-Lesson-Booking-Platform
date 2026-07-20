import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-gold-500', className)} aria-hidden />;
}

export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3" role="status">
      <Spinner className="h-7 w-7" />
      <p className="text-sm text-ink-400">{label}…</p>
    </div>
  );
}
