import { z } from 'zod';

/**
 * Laravel's length-aware paginator, as returned verbatim inside the response
 * envelope's `data` key by list endpoints. We validate the meta fields we rely
 * on and keep the item schema generic.
 */
export function paginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    data: z.array(item),
    current_page: z.number(),
    last_page: z.number(),
    per_page: z.number(),
    total: z.number(),
    from: z.number().nullable().optional(),
    to: z.number().nullable().optional(),
  });
}

export type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
};

/**
 * The backend wraps successful responses as { message?, data }. This unwraps
 * `data` and validates it against the provided schema, surfacing a clear error
 * if the contract drifts.
 */
export function unwrap<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const envelope = z.object({ data: z.unknown(), message: z.string().optional() });
  const parsed = envelope.parse(body);
  return schema.parse(parsed.data);
}
