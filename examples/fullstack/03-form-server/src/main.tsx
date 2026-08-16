// 03 — Form + Validation + Server (E2E Validation)
//
// ASTRAJS FLAGSHIP: validate={fn} on inputs runs the SAME validation
// on BOTH client and server. The developer writes validation ONCE.
//
// - Client: Browser Constraint Validation API (instant feedback)
// - Server: Same validators re-executed against submitted data
// - SSR Resumable: Form state survives server → client transition
//
import { component, store } from 'astrajs.dev/core';
import { form, serverForm } from 'astrajs.dev/form';
import * as validation from 'astrajs.dev/validation';
import { server } from 'astrajs.dev/server';

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
    result: null as RegistrationResult | null,
  });

  // Form controller — tracks errors, touched, validity
  const formCtrl = form();

  // Server form bridge — E2E validation orchestration
  // Validators are auto-resolved from the built-in registry — zero boilerplate.
  // NOTE: keep the whole handle around (don't destructure `isSubmitting`) so
  // it can be read reactively from inside `dynamic()` below — destructuring
  // a getter copies its value once and would never update.
  const formHandle = serverForm({
    controller: formCtrl,
    data: formData,
    serverAction: submitRegistration,
    onSuccess: (_data: RegistrationData, result: RegistrationResult) => {
      // Show success message — store the result for rendering
      formData.result = result;
      formData.name = '';
      formData.email = '';
      formData.password = '';
    },
  });
  const { submit } = formHandle;

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
        {/*
          Both views stay permanently mounted; only visibility toggles via
          the `hidden` attribute (a single, targeted reactive binding).
          IMPORTANT: don't wrap the <form> itself in a `{cond && <form>}`
          child expression — the compiler's dynamic() auto-wrap walks the
          ENTIRE expression subtree for reactive store references, so it
          would catch the `value={formData.x}` bindings on every input
          inside and rebuild (destroy + recreate) the whole form on every
          keystroke, which is what made this demo appear frozen/blank.
        */}
        <div class="successBox" hidden={!formData.result || !formData.result.ok}>
          <div class="successIcon">✅</div>
          <p>{formData.result?.message ?? ''}</p>
          <button
            class="btnSecondary"
            onClick={() => {
              formData.result = null;
            }}
          >
            Register another
          </button>
        </div>

        <form controller={formCtrl} onSubmit={submit} hidden={!!formData.result}>
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
            {formCtrl.touched.name && formCtrl.getError('name') && (
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
            {formCtrl.touched.email && formCtrl.getError('email') && (
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
            {formCtrl.touched.password && formCtrl.getError('password') && (
              <p class="error">{formCtrl.getError('password')}</p>
            )}
          </div>

          {/* Submit */}
          <button
            class="btnSubmit"
            type="submit"
            disabled={formHandle.isSubmitting || !formCtrl.isValid}
          >
            {formHandle.isSubmitting ? 'Submitting...' : 'Register'}
          </button>

          <p class="hint">
            💡 Try submitting with empty fields, invalid email, or use{' '}
            <code>taken@example.com</code> to see server-side validation.
          </p>
        </form>
      </div>
    </div>
  );
});

