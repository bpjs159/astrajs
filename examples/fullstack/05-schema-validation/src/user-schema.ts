// Shared validation — imported by BOTH the client form and the server() handler.
import { schema } from 'astrajs.dev/schema';
import type { Infer } from 'astrajs.dev/schema';

export const NewUserSchema = schema.object({
  name: schema.string().min(2).max(40),
  email: schema.string().email(),
});

export type NewUser = Infer<typeof NewUserSchema>;
