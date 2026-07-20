import { Link } from 'react-router-dom';
import { Music2, Plus } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, CardTitle } from '@/shared/ui';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Badge } from '@/shared/ui';
import { useAuth } from '@/features/auth/hooks';
import { useAdminInstruments } from './hooks';

export function AdminDashboard() {
  const { user } = useAuth();
  const instruments = useAdminInstruments(1);

  const activeCount = instruments.data?.data.filter((i) => i.is_active).length ?? 0;
  const totalCount = instruments.data?.total ?? 0;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] ?? 'Admin'}`}
        description="Manage the platform instruments catalog."
        actions={
          <Link to="/admin/instruments">
            <Button>
              <Plus className="h-4 w-4" aria-hidden />
              Add instrument
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardBody>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
              <Music2 className="h-5 w-5" aria-hidden />
            </div>
            <p className="mt-4 text-xs text-ink-400">Instruments in catalog</p>
            {instruments.isLoading ? (
              <Skeleton className="mt-1 h-8 w-16" />
            ) : (
              <p className="font-display text-2xl font-semibold text-ink-900">{totalCount}</p>
            )}
            <p className="mt-1 text-xs text-ink-500">{activeCount} active</p>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent instruments</CardTitle>
            <Link
              to="/admin/instruments"
              className="text-sm font-medium text-gold-700 hover:underline"
            >
              Manage all
            </Link>
          </CardHeader>
          <CardBody>
            {instruments.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : instruments.data && instruments.data.data.length > 0 ? (
              <ul className="divide-y divide-ink-100">
                {instruments.data.data.slice(0, 5).map((instrument) => (
                  <li key={instrument.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Music2 className="h-5 w-5 text-ink-400" aria-hidden />
                      <span className="text-sm font-medium text-ink-900">{instrument.name}</span>
                    </div>
                    <Badge tone={instrument.is_active ? 'success' : 'neutral'}>
                      {instrument.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-500">No instruments in the catalog yet.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
