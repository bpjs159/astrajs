/**
 * Shared checkout schema — validated on the CLIENT for instant feedback
 * and re-validated on the SERVER (the source of truth) inside checkout().
 */
import { schema } from 'astrajs.dev/schema';
import type { Infer } from 'astrajs.dev/schema';

export const CheckoutSchema = schema.object({
  name: schema.string().min(2).max(60),
  email: schema.string().email(),
  address: schema.string().min(6).max(200),
  card: schema.string().min(12).max(19),
});

export type CheckoutForm = Infer<typeof CheckoutSchema>;
export type FieldErrors = Partial<Record<keyof CheckoutForm, string>>;
