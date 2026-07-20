import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { paginated, unwrap } from '@/shared/api/pagination';

const itemSchema = z.object({ id: z.number(), name: z.string() });

describe('unwrap + paginated', () => {
  it('unwraps the { message, data } envelope and validates a paginator', () => {
    const body = {
      message: 'ok',
      data: {
        data: [
          { id: 1, name: 'Piano' },
          { id: 2, name: 'Guitar' },
        ],
        current_page: 1,
        last_page: 3,
        per_page: 20,
        total: 42,
        from: 1,
        to: 20,
        // Extra Laravel paginator keys the frontend ignores:
        first_page_url: 'http://x/api/v1/instruments?page=1',
        links: [],
        path: 'http://x/api/v1/instruments',
      },
    };

    const result = unwrap(paginated(itemSchema), body);

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(42);
    expect(result.last_page).toBe(3);
  });

  it('unwraps a plain resource', () => {
    const body = { data: { id: 7, name: 'Cello' } };
    const result = unwrap(itemSchema, body);
    expect(result.id).toBe(7);
  });

  it('throws when the payload does not match the schema (contract drift)', () => {
    const body = { data: { id: 'not-a-number', name: 'Broken' } };
    expect(() => unwrap(itemSchema, body)).toThrow();
  });

  it('throws when the envelope has no data key', () => {
    expect(() => unwrap(itemSchema, { message: 'no data here' })).toThrow();
  });
});
