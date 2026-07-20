import { Star } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface RatingStarsProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
  className?: string;
}

/** Read-only star rating display. */
export function RatingStars({ value, count, size = 'sm', className }: RatingStarsProps) {
  const rounded = Math.round(value);
  const dim = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(dim, i < rounded ? 'fill-gold-400 text-gold-400' : 'text-ink-200')}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-ink-600">
        {value > 0 ? value.toFixed(1) : 'New'}
        {typeof count === 'number' && count > 0 && (
          <span className="text-ink-400"> ({count})</span>
        )}
      </span>
    </div>
  );
}

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

/** Interactive 1–5 star picker for the review form. */
export function RatingInput({ value, onChange }: RatingInputProps) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onClick={() => onChange(star)}
          className="rounded-md p-1 transition hover:scale-110"
        >
          <Star
            className={cn(
              'h-7 w-7',
              star <= value ? 'fill-gold-400 text-gold-400' : 'text-ink-300',
            )}
          />
        </button>
      ))}
    </div>
  );
}
