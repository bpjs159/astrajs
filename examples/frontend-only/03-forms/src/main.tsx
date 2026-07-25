/**
 * 03 — Reactive Forms
 *
 * Form state stored in a reactive `store()`.
 * Two-way binding: input ↔ store.
 * Live validation with computed error messages.
 * Only changed fields trigger DOM updates — O(1).
 */

import { store, effect } from '@astrajs/core';

// ─── Form Store ──────────────────────────────────────────────────────────────
const form = store({
  name: '',
  email: '',
  role: 'developer' as string,
  bio: '',
  // Computed validation state (updated via effects)
  errors: {} as Record<string, string>,
  submitted: false,
});

// ─── Validation ──────────────────────────────────────────────────────────────
function validate(): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email format';
  if (!form.bio.trim()) errors.bio = 'Bio is required';
  else if (form.bio.length < 10) errors.bio = 'Bio must be at least 10 characters';
  return errors;
}

const isValid = () => Object.keys(form.errors).length === 0;

// ─── Mount UI ────────────────────────────────────────────────────────────────
const app = document.getElementById('app')!;

function render(): void {
  app.innerHTML = `
    <div class="form-card">
      <h1>Reactive Form</h1>
      <p class="subtitle">Every keystroke updates the store — but only changed fields re-render</p>

      <div class="row">
        <div class="field">
          <label>Full Name</label>
          <input id="name" type="text" placeholder="John Doe" value="${escapeHtml(form.name)}" />
          <div class="error" id="err-name"></div>
        </div>
        <div class="field">
          <label>Role</label>
          <select id="role">
            <option value="developer" ${form.role === 'developer' ? 'selected' : ''}>Developer</option>
            <option value="designer" ${form.role === 'designer' ? 'selected' : ''}>Designer</option>
            <option value="manager" ${form.role === 'manager' ? 'selected' : ''}>Manager</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label>Email</label>
        <input id="email" type="email" placeholder="john@example.com" value="${escapeHtml(form.email)}" />
        <div class="error" id="err-email"></div>
      </div>

      <div class="field">
        <label>Bio</label>
        <textarea id="bio" rows="3" placeholder="Tell us about yourself...">${escapeHtml(form.bio)}</textarea>
        <div class="error" id="err-bio"></div>
      </div>

      <button class="btn-submit" id="submit-btn">Submit</button>
      <div class="success" id="success-msg"></div>

      <div class="live-preview">
        <h3>Live Store Preview</h3>
        <div class="preview-item"><span>Name</span><span id="pv-name">—</span></div>
        <div class="preview-item"><span>Email</span><span id="pv-email">—</span></div>
        <div class="preview-item"><span>Role</span><span id="pv-role">—</span></div>
        <div class="preview-item"><span>Bio chars</span><span id="pv-bio">0</span></div>
        <div class="preview-item"><span>Valid</span><span id="pv-valid">❌</span></div>
      </div>
    </div>
  `;

  // ─── Wire up inputs with two-way binding ─────────────────────────────────
  (document.getElementById('name') as HTMLInputElement).oninput = (e) => {
    form.name = (e.target as HTMLInputElement).value;
  };
  (document.getElementById('email') as HTMLInputElement).oninput = (e) => {
    form.email = (e.target as HTMLInputElement).value;
  };
  (document.getElementById('role') as HTMLSelectElement).onchange = (e) => {
    form.role = (e.target as HTMLSelectElement).value;
  };
  (document.getElementById('bio') as HTMLTextAreaElement).oninput = (e) => {
    form.bio = (e.target as HTMLTextAreaElement).value;
  };
  document.getElementById('submit-btn')!.onclick = () => {
    form.errors = validate();
    if (isValid()) form.submitted = true;
  };
}

// ─── Reactive DOM updates (only the changed field updates) ──────────────────
effect(() => { const el = document.getElementById('err-name'); if (el) el.textContent = form.errors.name ?? ''; });
effect(() => { const el = document.getElementById('err-email'); if (el) el.textContent = form.errors.email ?? ''; });
effect(() => { const el = document.getElementById('err-bio'); if (el) el.textContent = form.errors.bio ?? ''; });
effect(() => { const el = document.getElementById('pv-name'); if (el) el.textContent = form.name || '—'; });
effect(() => { const el = document.getElementById('pv-email'); if (el) el.textContent = form.email || '—'; });
effect(() => { const el = document.getElementById('pv-role'); if (el) el.textContent = form.role; });
effect(() => { const el = document.getElementById('pv-bio'); if (el) el.textContent = String(form.bio.length); });
effect(() => { const el = document.getElementById('pv-valid'); if (el) el.textContent = isValid() ? '✅' : '❌'; });
effect(() => {
  const el = document.getElementById('success-msg');
  if (el) el.textContent = form.submitted ? '✓ Form submitted successfully!' : '';
});

render();

function escapeHtml(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

(window as any).form = form;
