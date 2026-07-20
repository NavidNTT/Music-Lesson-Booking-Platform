import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui';
import { walletApi } from './api';

export const walletKeys = {
  all: ['wallet'] as const,
};

export function useWallet() {
  return useQuery({
    queryKey: walletKeys.all,
    queryFn: walletApi.me,
  });
}

export function useDeposit() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ amount, description }: { amount: number; description?: string }) =>
      walletApi.deposit(amount, description),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.all });
      toast.success('Wallet topped up');
    },
  });
}
