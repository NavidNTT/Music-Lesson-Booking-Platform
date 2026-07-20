import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, lastPage, onChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-700 transition hover:bg-ink-100 disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Previous
      </button>
      <span className="px-2 text-sm text-ink-500">
        Page {page} of {lastPage}
      </span>
      <button
        disabled={page >= lastPage}
        onClick={() => onChange(page + 1)}
        className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-700 transition hover:bg-ink-100 disabled:opacity-40"
      >
        Next
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </nav>
  );
}
