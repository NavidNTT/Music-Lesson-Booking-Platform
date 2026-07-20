import { z } from 'zod';
import { apiClient } from '@/shared/api/client';
import { unwrap } from '@/shared/api/pagination';

export const walletTransactionSchema = z.object({
  id: z.number(),
  wallet_id: z.number(),
  type: z.string(),
  amount: z.coerce.number(),
  reference_type: z.string().nullable(),
  reference_id: z.number().nullable(),
  status: z.string(),
  description: z.string().nullable(),
  created_at: z.string().nullable().optional(),
});
export type WalletTransaction = z.infer<typeof walletTransactionSchema>;

export const walletSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  balance: z.coerce.number(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  transactions: z.array(walletTransactionSchema).default([]),
});
export type Wallet = z.infer<typeof walletSchema>;

export const walletApi = {
  async me(): Promise<Wallet> {
    const res = await apiClient.get('/wallet');
    return unwrap(walletSchema, res.data);
  },

  async deposit(amount: number, description?: string): Promise<void> {
    await apiClient.post('/wallet/deposit', {
      amount,
      description: description || undefined,
    });
  },
};
