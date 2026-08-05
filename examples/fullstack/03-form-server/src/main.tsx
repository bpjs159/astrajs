// 03 — Form + Validation + Server (E2E Validation)
//
// ASTRAJS FLAGSHIP: validate={fn} on inputs runs the SAME validation
// on BOTH client and server. The developer writes validation ONCE.
//
// - Client: Browser Constraint Validation API (instant feedback)
// - Server: Same validators re-executed against submitted data
// - SSR Resumable: Form state survives server → client transition
//
import { component, store } from '@astrajs/core';
import { form, serverForm } from '@astrajs/form';
import * as validation from '@astrajs/validation';
import { server } from '@astrajs/server';

// ─── Shared Types ────────────────────────────────────────────────────────────

/** Shape of the registration form data, shared between client and server. */
interface RegistrationData {
  name: string;
  email: string;
  password: string;
}

/** Result returned by the server action. */
interface RegistrationResult {
  ok: boolean;
  message?: string;
  serverErrors?: Record<string, string>;
}

// ─── Server Action ───────────────────────────────────────────────────────────

const submitRegistration = server(async (data: RegistrationData): Promise<RegistrationResult> => {
  // Server-only validation: check if email is already taken
  if (data.email === 'taken@example.com') {
    return {
      ok: false,
      serverErrors: {
        email: 'This email is already registered. Please use another one.',
      },
    };
  }

  // Simulate saving to database
  await new Promise(r => setTimeout(r, 500));

  return {
    ok: true,
    message: `Welcome aboard, ${data.name}! Your account has been created.`,
  };
});

// ─── Component ───────────────────────────────────────────────────────────────

export const FormServerDemo = component(() => {
  // Form data store — the single source of truth
  const formData = store({
    name: '',
    email: '',
    password: '',
  });

  // Form controller — tracks errors, touched, validity
  const formCtrl = form();

  // Server form bridge — E2E validation orchestration
  // Validators are auto-resolved from the built-in registry — zero boilerplate.
  const { submit, isSubmitting } = serverForm({
    controller: formCtrl,
    data: formData,
    serverAction: submitRegistration,
    onSuccess: (_data: RegistrationData, result: RegistrationResult) => {
      // Show success message — store the result for rendering
      const fd = formData as unknown as Record<string, unknown>;
      fd.result = result;
      fd.name = '';
      fd.email = '';
      fd.password = '';
    },
  });

  const result = (formData as unknown as Record<string, unknown>).result as
    | { ok: boolean; message: string }
    | undefined;

  return (
    <div class="card">
      <div class="header">
        <h1>🔐 Form + Validation + Server (E2E)</h1>
        <p>
          <code>validate={'{fn}'}</code> on inputs runs the same rules on
          client AND server. Write validation ONCE.
        </p>
      </div>
      <div class="body">
        {/* ── Success State ─────────────────────────────────────── */}
        {result && result.ok && (
          <div class="successBox">
            <div class="successIcon">✅</div>
            <p>{result.message}</p>
            <button
              class="btnSecondary"
              onClick={() => {
                (formData as unknown as Record<string, unknown>).result = null;
              }}
            >
              Register another
            </button>
          </div>
        )}

        {/* ── Form ──────────────────────────────────────────────── */}
        {!result && (
          <form controller={formCtrl} onSubmit={submit}>
            {/* Full Name */}
            <div class="field">
              <label>Full Name</label>
              <input
                name="name"
                type="text"
                placeholder="John Doe"
                required
                minLength={3}
                value={formData.name}
                validate={validation.minLength(3)}
              />
              {formCtrl.getError('name') && (
                <p class="error">{formCtrl.getError('name')}</p>
              )}
            </div>

            {/* Email */}
            <div class="field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                value={formData.email}
                validate={validation.all([validation.isRequired, validation.isEmail])}
              />
              {formCtrl.getError('email') && (
                <p class="error">{formCtrl.getError('email')}</p>
              )}
            </div>

            {/* Password */}
            <div class="field">
              <label>Password</label>
              <input
                name="password"
                type="password"
                placeholder="Min 8 characters"
                required
                minLength={8}
                value={formData.password}
                validate={validation.minLength(8)}
              />
              {formCtrl.getError('password') && (
                <p class="error">{formCtrl.getError('password')}</p>
              )}
            </div>

            {/* Submit */}
            <button
              class="btnSubmit"
              type="submit"
              disabled={isSubmitting || !formCtrl.isValid}
            >
              {isSubmitting ? 'Submitting...' : 'Register'}
            </button>

            <p class="hint">
              💡 Try submitting with empty fields, invalid email, or use{' '}
              <code>taken@example.com</code> to see server-side validation.
            </p>
          </form>
        )}
      </div>
    </div>
  );
});

