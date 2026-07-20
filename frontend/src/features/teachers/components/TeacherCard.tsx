import { Link } from 'react-router-dom';
import { Music2 } from 'lucide-react';
import { Card } from '@/shared/ui';
import { RatingStars } from '@/shared/ui/RatingStars';
import { formatCurrency } from '@/shared/lib/format';
import type { TeacherProfile } from '../api';

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function TeacherCard({ teacher }: { teacher: TeacherProfile }) {
  const name = teacher.user?.name ?? 'Music Teacher';
  const instruments = teacher.instruments ?? [];

  return (
    <Link to={`/teachers/${teacher.id}`} className="group block">
      <Card className="flex h-full flex-col p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-card-hover">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-900 font-display text-lg font-semibold text-gold-400">
            {initials(name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold text-ink-900">{name}</p>
            <RatingStars value={teacher.rating_avg} count={teacher.rating_count} />
          </div>
        </div>

        {teacher.bio && <p className="mt-3 line-clamp-2 text-sm text-ink-500">{teacher.bio}</p>}

        {instruments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {instruments.slice(0, 4).map((instrument) => (
              <span
                key={instrument.id}
                className="inline-flex items-center gap-1 rounded-full bg-cream-200 px-2.5 py-1 text-xs font-medium text-ink-700"
              >
                <Music2 className="h-3 w-3" aria-hidden />
                {instrument.name}
              </span>
            ))}
            {instruments.length > 4 && (
              <span className="rounded-full bg-cream-200 px-2.5 py-1 text-xs font-medium text-ink-500">
                +{instruments.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-xs text-ink-400">Per session</p>
            <p className="font-display text-lg font-semibold text-ink-900">
              {formatCurrency(teacher.price_per_session)}
            </p>
          </div>
          <span className="text-sm font-medium text-gold-700 group-hover:underline">
            View profile →
          </span>
        </div>
      </Card>
    </Link>
  );
}
