/**
 * 03 — @astrajs/form Controller
 *
 * Data layer:  @astrajs/core store (formStore.email, formStore.password…)
 * Meta layer:  @astrajs/form controller (errors, touched, isDirty…)
 * Validation:  Browser Constraint Validation API + setCustomValidity()
 *
 * Cero efectos. Cero reimplementación de validación.
 */
import { component, store } from '@astrajs/core';
import { form } from '@astrajs/form';

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
    if (!formCtrl.isValid) {
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
      <h1>@astrajs/form</h1>
      <p class="subtitle">Data + Metadata + Native Validation</p>

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

        <div class="field">
          <label>
            Username
            <span class="badge badge-async">async</span>
          </label>
          <input
            name="username"
            type="text"
            required
            minLength={3}
            placeholder="Pick a username"
            value={formStore.username}
            validate={async (val: string) => {
              await new Promise(r => setTimeout(r, 500));
              return takenUsernames.has(val.toLowerCase())
                ? 'Username already taken'
                : true;
            }}
          />
          {formController.touched.username && formController.errors.username === 'required' && (
            <p class="error-msg">Required</p>
          )}
          {formController.touched.username && formController.errors.username === 'minlength' && (
            <p class="error-msg">At least 3 characters</p>
          )}
          {formController.errors.username && formController.errors.username !== 'required' && formController.errors.username !== 'minlength' && (
            <p class="error-msg">{formController.errors.username}</p>
          )}
        </div>

        <div class="field">
          <label>Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={formStore.email}
          />
          {formController.touched.email && formController.errors.email === 'required' && (
            <p class="error-msg">Required</p>
          )}
          {formController.touched.email && formController.errors.email === 'type' && (
            <p class="error-msg">Invalid email format</p>
          )}
        </div>

        <div class="field">
          <label>Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Min 6 characters"
            value={formStore.password}
          />
          {formController.touched.password && formController.errors.password === 'required' && (
            <p class="error-msg">Required</p>
          )}
          {formController.touched.password && formController.errors.password === 'minlength' && (
            <p class="error-msg">At least 6 characters</p>
          )}
        </div>

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
            validate={(val: string) =>
              val === formStore.password ? true : 'Passwords do not match'
            }
          />
          {formController.touched.confirm && formController.errors.confirm && (
            <p class="error-msg">{formController.errors.confirm}</p>
          )}
        </div>

        <button
          class="btn-submit"
          type="submit"
          disabled={!formCtrl.isDirty || formStore.isSubmitting}
        >
          {formStore.isSubmitting ? 'Creating…' : 'Create Account'}
        </button>

        <>{formStore.success ? <div class="success">Account created!</div> : <></>}</>
      </form>

      <div class="live-preview">
        <h3>How it works</h3>
        <div class="preview-item"><span><code>controller={'{formController}'}</code></span><span class="badge badge-auto">Auto-wired</span></div>
        <div class="preview-item"><span><code>formController.errors.email</code></span><span>Error codes (i18n-safe)</span></div>
        <div class="preview-item"><span><code>formController.touched.email</code></span><span>Show after blur</span></div>
        <div class="preview-item"><span><code>formController.isDirty</code></span><span>Button disabled</span></div>
        <div class="preview-item"><span><code>formStore.isSubmitting</code></span><span>Loading state (store)</span></div>
        <div class="preview-item"><span><code>formStore.submitCount</code></span><span>Attempts (store)</span></div>
        <div class="preview-item"><span><code>formController.focusFirstError()</code></span><span>Scroll to error</span></div>
      </div>
    </div>
  );
});

