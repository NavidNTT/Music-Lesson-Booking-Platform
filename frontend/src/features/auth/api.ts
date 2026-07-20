import { apiClient } from '@/shared/api/client';
import { unwrap } from '@/shared/api/pagination';
import {
  authPayloadSchema,
  meSchema,
  type AuthPayload,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type User,
} from './schemas';

export const authApi = {
  async login(input: LoginInput): Promise<AuthPayload> {
    const res = await apiClient.post('/auth/login', { ...input, device_name: 'web-spa' });
    return unwrap(authPayloadSchema, res.data);
  },

  async register(input: RegisterInput): Promise<AuthPayload> {
    const res = await apiClient.post('/auth/register', { ...input, device_name: 'web-spa' });
    return unwrap(authPayloadSchema, res.data);
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async me(): Promise<User> {
    const res = await apiClient.get('/me');
    return unwrap(meSchema, res.data).user;
  },

  async updateMe(input: { name?: string; email?: string }): Promise<User> {
    const res = await apiClient.patch('/me', input);
    return unwrap(meSchema, res.data).user;
  },

  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    await apiClient.post('/forgot-password', input);
  },

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    await apiClient.post('/reset-password', input);
  },
};
