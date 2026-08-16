/**
 * 03 — @bpjs159/form Controller + @bpjs159/validation
 *
 * Data layer:  @bpjs159/core store (formStore.email, formStore.password…)
 * Meta layer:  @bpjs159/form controller (errors, touched, isDirty…)
 * Validation:  @bpjs159/validation — same validators used client & server
 *
 * Standard validators (isEmail, minLength, isRequired) come from
 * @bpjs159/validation. Custom async/cross-field validators are
 * inline — the form controller handles both transparently.
 *
 * Cero efectos. Cero reimplementación de validación.
 */
import { component, store } from '@bpjs159/core';
import { form } from '@bpjs159/form';
import * as validation from '@bpjs159/validation';

const takenUsernames = new Set(['admin', 'root', 'test']);

export const Form = component(() => {
  // ── Data (pure values) ──────────────────────────────────────────
  const formStore = store({
    username: '',
    email: '',
    password: '',
    confirm: '',
    success: false,
    isSubmitting: false,
    submitCount: 0,
  });

  // ── Metadata (errors, touched, isDirty…) — READ-ONLY ─────────────
  const formController = form();

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    formStore.submitCount++;
    if (!formController.isValid) {
      formController.focusFirstError();
      return;
    }
    formStore.isSubmitting = true;
    // Simulate API call
    setTimeout(() => {
      formStore.isSubmitting = false;
      formStore.success = true;
      formController.reset();
      setTimeout(() => { formStore.success = false; }, 3000);
    }, 800);
  };

  return (
    <div class="form-card">
      <h1>@bpjs159/form</h1>
      <p class="subtitle">Data + Metadata + <code>@bpjs159/validation</code></p>

      <form controller={formController} onSubmit={handleSubmit}>
        {/* ── Error box — only shows touched fields ── */}
        <>{(() => {
          const touchedErrors = Object.entries(formController.errors).filter(
            ([field]) => formController.touched[field]
          );
          return touchedErrors.length > 0 ? (
            <div class="error-summary">
              <strong>Errors ({touchedErrors.length})</strong>
              <ul>
                {touchedErrors.map(([field, code]) => (
                  <li><code>{field}</code> — {code}</li>
                ))}
              </ul>
            </div>
          ) : null;
        })()}</>

        {/* ── Username — async validator (custom) + built-in ──────── */}
        <div class="field">
          <label>
            Username
            <span class="badge badge-async">async</span>
            <span class="badge badge-builtin">built-in</span>
          </label>
          <input
            name="username"
            type="text"
            required
            minLength={3}
            placeholder="Pick a username"
            value={formStore.username}
            validate={validation.all([
              validation.isRequired,
              validation.minLength(3),
              async (val: string) => {
                await new Promise(r => setTimeout(r, 500));
                return takenUsernames.has(val.toLowerCase())
                  ? 'Username already taken'
                  : true;
              },
            ])}
          />
          {formController.touched.username && formController.errors.username && (
            <p class="error-msg">{formController.errors.username}</p>
          )}
        </div>

        {/* ── Email — standard validators ─────────────────────────── */}
        <div class="field">
          <label>
            Email
            <span class="badge badge-builtin">built-in</span>
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={formStore.email}
            validate={validation.all([validation.isRequired, validation.isEmail])}
          />
          {formController.touched.email && formController.errors.email && (
            <p class="error-msg">{formController.errors.email}</p>
          )}
        </div>

        {/* ── Password — standard validator ────────────────────────── */}
        <div class="field">
          <label>
            Password
            <span class="badge badge-builtin">built-in</span>
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Min 6 characters"
            value={formStore.password}
            validate={validation.all([validation.isRequired, validation.minLength(6)])}
          />
          {formController.touched.password && formController.errors.password && (
            <p class="error-msg">{formController.errors.password}</p>
          )}
        </div>

        {/* ── Confirm Password — custom cross-field validator ──────── */}
        <div class="field">
          <label>
            Confirm Password
            <span class="badge badge-cross">cross-field</span>
          </label>
          <input
            name="confirm"
            type="password"
            required
            placeholder="Repeat password"
            value={formStore.confirm}
            validate={validation.all([
              validation.isRequired,
              (val: string) =>
                val === formStore.password ? true : 'Passwords do not match',
            ])}
          />
          {formController.touched.confirm && formController.errors.confirm && (
            <p class="error-msg">{formController.errors.confirm}</p>
          )}
        </div>

        <button
          class="btn-submit"
          type="submit"
          disabled={!formController.isDirty || formStore.isSubmitting}
        >
          {formStore.isSubmitting ? 'Creating…' : 'Create Account'}
        </button>

        <>{formStore.success ? <div class="success">Account created!</div> : <></>}</>
      </form>

      <div class="live-preview">
        <h3>How it works</h3>
        <div class="preview-item"><span><code>validate={'{validation.isEmail}'}</code></span><span class="badge badge-builtin">@bpjs159/validation</span></div>
        <div class="preview-item"><span><code>validate={'{validation.all([...])}'}</code></span><span>Compose validators</span></div>
        <div class="preview-item"><span><code>validate={'{async (val) => ...}'}</code></span><span class="badge badge-async">Custom async</span></div>
        <div class="preview-item"><span><code>controller={'{formController}'}</code></span><span class="badge badge-auto">Auto-wired</span></div>
        <div class="preview-item"><span><code>formController.errors.*</code></span><span>Error codes (i18n-safe)</span></div>
        <div class="preview-item"><span><code>formController.touched.*</code></span><span>Show after blur</span></div>
        <div class="preview-item"><span><code>formController.isDirty</code></span><span>Button disabled</span></div>
      </div>
    </div>
  );
});

