import { useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { EmptyState, ErrorState, Input, Select } from '@/shared/ui';
import { CardSkeleton } from '@/shared/ui/Skeleton';
import { Pagination } from '@/shared/ui/Pagination';
import { useInstruments } from '@/features/instruments/hooks';
import { useTeachers } from './hooks';
import { TeacherCard } from './components/TeacherCard';

/** Debounce a value by the given delay (ms). */
function useDebounced<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function TeachersPage() {
  const [params, setParams] = useSearchParams();
  const instrumentFilter = params.get('instrument') ?? '';
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(params.get('search') ?? '');
  const search = useDebounced(searchInput);

  const query = useMemo(
    () => ({ page, instrument: instrumentFilter, search }),
    [page, instrumentFilter, search],
  );

  const { data, isLoading, isError, error, refetch } = useTeachers(query);
  const instrumentsQuery = useInstruments(1);
  const instruments = instrumentsQuery.data?.data ?? [];

  const setInstrument = (slug: string) => {
    const next = new URLSearchParams(params);
    if (slug) next.set('instrument', slug);
    else next.delete('instrument');
    setParams(next);
    setPage(1);
  };

  const teachers = data?.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-ink-900">Find your teacher</h1>
        <p className="mt-2 text-ink-500">
          Browse verified music teachers, compare ratings, and book a lesson that fits your
          schedule.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            aria-hidden
          />
          <Input
            placeholder="Search by teacher name…"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            aria-label="Search teachers by name"
            className="pl-9"
          />
        </div>
        <div className="sm:w-56">
          <Select
            value={instrumentFilter}
            onChange={(e) => setInstrument(e.target.value)}
            aria-label="Filter by instrument"
          >
            <option value="">All instruments</option>
            {instruments.map((i) => (
              <option key={i.id} value={i.slug}>
                {i.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : teachers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teachers found"
          description="Try clearing filters or searching for a different name."
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
          {data && <Pagination page={data.current_page} lastPage={data.last_page} onChange={setPage} />}
        </>
      )}
    </div>
  );
}
