import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Info, Wallet as WalletIcon } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, CardTitle, EmptyState, ErrorState, Input } from '@/shared/ui';
import { Modal } from '@/shared/ui/Modal';
import { FormError } from '@/shared/ui/FormError';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Badge } from '@/shared/ui';
import { formatCurrency, formatDateTime } from '@/shared/lib/format';
import { ApiError } from '@/shared/api/errors';
import { cn } from '@/shared/lib/cn';
import { useDeposit, useWallet } from './hooks';
import type { WalletTransaction } from './api';

const inflow = new Set(['deposit', 'refund']);

const typeTone: Record<string, 'success' | 'danger' | 'info' | 'neutral'> = {
  deposit: 'success',
  refund: 'info',
  payment: 'danger',
  withdraw: 'danger',
};

export function WalletPage() {
  const { data: wallet, isLoading, isError, error, refetch } = useWallet();
  const deposit = useDeposit();

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const submitDeposit = async () => {
    setFormError(null);
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 1) {
      setFormError('Enter an amount of at least 1.');
      return;
    }
    try {
      await deposit.mutateAsync({ amount: value });
      setAmount('');
      setOpen(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Deposit failed.');
    }
  };

  const transactions = wallet?.transactions ?? [];

  return (
    <div>
      <PageHeader
        title="Wallet"
        description="Top up your balance and review your transaction history."
        actions={<Button onClick={() => setOpen(true)}>Add funds</Button>}
      />

      {/* Demo notice — deposits are not backed by a real payment gateway yet. */}
      <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>
          Deposits are in demo mode — no real payment gateway is connected, so funds are added
          instantly for testing.
        </span>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-32 lg:col-span-1" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardBody>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                <WalletIcon className="h-5 w-5" aria-hidden />
              </div>
              <p className="mt-4 text-xs text-ink-400">Current balance</p>
              <p className="font-display text-3xl font-semibold text-ink-900">
                {formatCurrency(wallet?.balance ?? 0)}
              </p>
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardBody>
              {transactions.length === 0 ? (
                <EmptyState
                  icon={WalletIcon}
                  title="No transactions yet"
                  description="Your deposits, payments, and refunds will appear here."
                />
              ) : (
                <ul className="divide-y divide-ink-100">
                  {transactions.map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} />
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add funds"
        description="Enter the amount you'd like to add to your wallet."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={deposit.isPending}>
              Cancel
            </Button>
            <Button onClick={submitDeposit} loading={deposit.isPending}>
              Deposit
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <FormError message={formError} />
          <Input
            label="Amount"
            type="number"
            min={1}
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500000"
          />
        </div>
      </Modal>
    </div>
  );
}

function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const isInflow = inflow.has(tx.type);
  const Icon = isInflow ? ArrowDownLeft : ArrowUpRight;
  return (
    <li className="flex items-center gap-3 py-3">
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full',
          isInflow ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600',
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-900">
          {tx.description ?? tx.type}
        </p>
        <p className="text-xs text-ink-400">{formatDateTime(tx.created_at)}</p>
      </div>
      <div className="text-right">
        <p
          className={cn(
            'text-sm font-semibold',
            isInflow ? 'text-emerald-600' : 'text-red-600',
          )}
        >
          {isInflow ? '+' : '−'}
          {formatCurrency(tx.amount)}
        </p>
        <Badge tone={typeTone[tx.type] ?? 'neutral'} className="mt-0.5 capitalize">
          {tx.type}
        </Badge>
      </div>
    </li>
  );
}
