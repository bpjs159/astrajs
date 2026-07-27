/**
 * 03 — @astrajs/form Controller
 *
 * Data layer:  @astrajs/core store (ui.email, ui.password…)
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
  const ui = store({
    username: '',
    email: '',
    password: '',
    confirm: '',
    success: false,
    isSubmitting: false,
    submitCount: 0,
  });

  // ── Metadata (errors, touched, isDirty…) — READ-ONLY ─────────────
  const formCtrl = form();

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    ui.submitCount++;
    if (!formCtrl.isValid) {
      formCtrl.focusFirstError();
      return;
    }
    ui.isSubmitting = true;
    // Simulate API call
    setTimeout(() => {
      ui.isSubmitting = false;
      ui.success = true;
      formCtrl.reset();
      setTimeout(() => { ui.success = false; }, 3000);
    }, 800);
  };

  return (
    <div class="form-card">
      <h1>@astrajs/form</h1>
      <p class="subtitle">Data + Metadata + Native Validation</p>

      <form controller={formCtrl} onSubmit={handleSubmit}>
        {/* ── Error box — only shows touched fields ── */}
        <>{(() => {
          const touchedErrors = Object.entries(formCtrl.errors).filter(
            ([field]) => formCtrl.touched[field]
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
            value={ui.username}
            validate={async (val: string) => {
              await new Promise(r => setTimeout(r, 500));
              return takenUsernames.has(val.toLowerCase())
                ? 'Username already taken'
                : true;
            }}
          />
          {formCtrl.touched.username && formCtrl.errors.username === 'required' && (
            <p class="error-msg">Required</p>
          )}
          {formCtrl.touched.username && formCtrl.errors.username === 'minlength' && (
            <p class="error-msg">At least 3 characters</p>
          )}
          {formCtrl.errors.username && formCtrl.errors.username !== 'required' && formCtrl.errors.username !== 'minlength' && (
            <p class="error-msg">{formCtrl.errors.username}</p>
          )}
        </div>

        <div class="field">
          <label>Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={ui.email}
          />
          {formCtrl.touched.email && formCtrl.errors.email === 'required' && (
            <p class="error-msg">Required</p>
          )}
          {formCtrl.touched.email && formCtrl.errors.email === 'type' && (
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
            value={ui.password}
          />
          {formCtrl.touched.password && formCtrl.errors.password === 'required' && (
            <p class="error-msg">Required</p>
          )}
          {formCtrl.touched.password && formCtrl.errors.password === 'minlength' && (
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
            value={ui.confirm}
            validate={(val: string) =>
              val === ui.password ? true : 'Passwords do not match'
            }
          />
          {formCtrl.touched.confirm && formCtrl.errors.confirm && (
            <p class="error-msg">{formCtrl.errors.confirm}</p>
          )}
        </div>

        <button
          class="btn-submit"
          type="submit"
          disabled={!formCtrl.isDirty || ui.isSubmitting}
        >
          {ui.isSubmitting ? 'Creating…' : 'Create Account'}
        </button>

        <>{ui.success ? <div class="success">Account created!</div> : <></>}</>
      </form>

      <div class="live-preview">
        <h3>How it works</h3>
        <div class="preview-item"><span><code>controller={'{formCtrl}'}</code></span><span class="badge badge-auto">Auto-wired</span></div>
        <div class="preview-item"><span><code>formCtrl.errors.email</code></span><span>Error codes (i18n-safe)</span></div>
        <div class="preview-item"><span><code>formCtrl.touched.email</code></span><span>Show after blur</span></div>
        <div class="preview-item"><span><code>formCtrl.isDirty</code></span><span>Button disabled</span></div>
        <div class="preview-item"><span><code>ui.isSubmitting</code></span><span>Loading state (store)</span></div>
        <div class="preview-item"><span><code>ui.submitCount</code></span><span>Attempts (store)</span></div>
        <div class="preview-item"><span><code>formCtrl.focusFirstError()</code></span><span>Scroll to error</span></div>
      </div>
    </div>
  );
});

