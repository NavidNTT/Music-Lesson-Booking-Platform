import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music2, Search } from 'lucide-react';
import { Badge, Card, EmptyState, ErrorState, Input } from '@/shared/ui';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Pagination } from '@/shared/ui/Pagination';
import { useInstruments } from './hooks';

export function InstrumentsPage() {
  const [page, setPage] = useState(1);
  const [term, setTerm] = useState('');
  const { data, isLoading, isError, error, refetch } = useInstruments(page);

  const instruments = data?.data ?? [];
  const filtered = term
    ? instruments.filter((i) => i.name.toLowerCase().includes(term.toLowerCase()))
    : instruments;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-ink-900">Instruments</h1>
        <p className="mt-2 text-ink-500">
          Explore the instruments taught on Cadenza and find teachers for each one.
        </p>
      </div>

      <div className="mb-6 max-w-sm">
        <Input
          placeholder="Filter instruments…"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          aria-label="Filter instruments"
          className="pl-9"
        />
        <Search className="pointer-events-none -mt-[30px] ml-3 h-4 w-4 text-ink-400" aria-hidden />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Music2}
          title="No instruments found"
          description={
            term ? 'Try a different search term.' : 'Instruments will appear here once added.'
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((instrument) => (
              <Link key={instrument.id} to={`/teachers?instrument=${instrument.slug}`}>
                <Card className="group h-full p-5 transition hover:shadow-card-hover">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-600 transition group-hover:bg-gold-400 group-hover:text-ink-950">
                    <Music2 className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="mt-3 font-display text-lg font-semibold text-ink-900">
                    {instrument.name}
                  </p>
                  {!instrument.is_active && (
                    <Badge tone="neutral" className="mt-2">
                      Inactive
                    </Badge>
                  )}
                </Card>
              </Link>
            ))}
          </div>

          {data && (
            <Pagination
              page={data.current_page}
              lastPage={data.last_page}
              onChange={(p) => {
                setPage(p);
                setTerm('');
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
