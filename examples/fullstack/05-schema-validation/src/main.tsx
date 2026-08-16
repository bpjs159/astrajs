// 05 — Schema Validation · One schema, validated on client AND server
import { component, store } from 'astrajs.dev/core';
import { server } from 'astrajs.dev/server';
import { NewUserSchema } from './user-schema.js';

type FieldErrors = Partial<Record<'name' | 'email', string>>;
type CreateUserResult = { ok: true; id: string } | { ok: false; errors: FieldErrors };

const createUser = server(async (input: unknown): Promise<CreateUserResult> => {
  // Runs on the server — re-validates even if the client check was bypassed
  // (curl, disabled JS, a modified DevTools request, etc.)
  const result = NewUserSchema.validate(input);
  if (!result.success) return { ok: false, errors: result.errors ?? {} };
  return { ok: true, id: crypto.randomUUID() };
});

export const SchemaValidationDemo = component(() => {
  const form = store({ name: '', email: '' });
  const ui = store({
    clientErrors: {} as FieldErrors,
    serverErrors: {} as FieldErrors,
    submitting: false,
    createdId: undefined as string | undefined,
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    ui.createdId = undefined;

    // 1) Client-side validation — instant feedback, same schema
    const clientResult = NewUserSchema.validate(form);
    ui.clientErrors = clientResult.errors ?? {};
    if (!clientResult.success) return;

    // 2) Server-side validation — the source of truth, can't be bypassed
    ui.submitting = true;
    ui.serverErrors = {};
    try {
      const result = await createUser(form);
      if (result.ok) {
        ui.createdId = result.id;
        form.name = '';
        form.email = '';
      } else {
        ui.serverErrors = result.errors;
      }
    } finally {
      ui.submitting = false;
    }
  }

  return (
    <div class="card">
      <div class="header">
        <h1>Schema Validation</h1>
        <p>One <code>schema.object()</code>, validated on <code>client</code> and <code>server</code></p>
      </div>
      <div class="body">
        <form onSubmit={handleSubmit}>
          <div class="field">
            <label>Name</label>
            <input
              value={form.name}
              onInput={(e: Event) => form.name = (e.target as HTMLInputElement).value}
              placeholder="Ada Lovelace"
            />
            {ui.clientErrors.name && <p class="error">{ui.clientErrors.name}</p>}
            {ui.serverErrors.name && <p class="error server">Server: {ui.serverErrors.name}</p>}
          </div>
          <div class="field">
            <label>Email</label>
            <input
              value={form.email}
              onInput={(e: Event) => form.email = (e.target as HTMLInputElement).value}
              placeholder="ada@example.com"
            />
            {ui.clientErrors.email && <p class="error">{ui.clientErrors.email}</p>}
            {ui.serverErrors.email && <p class="error server">Server: {ui.serverErrors.email}</p>}
          </div>
          <button class="btnSubmit" type="submit" disabled={ui.submitting}>
            {ui.submitting ? 'Validating on server...' : 'Create user'}
          </button>
        </form>
        {ui.createdId && <p class="success">Created user {ui.createdId}</p>}
      </div>
    </div>
  );
});
