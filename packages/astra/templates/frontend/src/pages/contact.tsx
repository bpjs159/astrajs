import { component, store } from 'astrajs.dev/core';
import { form } from 'astrajs.dev/form';
import { schema } from 'astrajs.dev/schema';

/**
 * Contact — reactive form + declarative schema validation.
 *
 * - astrajs.dev/form   → form() controller (metadata: errors, touched, reset…)
 * - astrajs.dev/schema → schema.object() validates the same data declaratively
 */
const ContactSchema = schema.object({
  name: schema.string().required().min(2),
  email: schema.string().required().email(),
});

const style = `
  .form-card { max-width: 420px; padding: 32px;
    background: #0a0f1a; border: 1px solid rgba(255,255,255,.07); border-radius: 16px; }
  .field { margin-bottom: 16px; text-align: left; }
  .field label { display: block; font-size: .78rem; font-weight: 600;
    color: #94a3b8; margin-bottom: 6px; }
  .field input { width: 100%; padding: 10px 12px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,.12); background: #0d1424;
    color: #e2e8f0; font-size: .9rem; outline: none; }
  .field input:focus { border-color: #8d4dff; }
  .field .error { color: #f87171; font-size: .75rem; margin-top: 4px; }
  .form-card button { width: 100%; padding: 12px; border: none; border-radius: 10px;
    background: linear-gradient(135deg,#8d4dff,#4d7cff); color: #fff;
    font-weight: 700; font-size: .9rem; cursor: pointer; }
  .form-card button:hover { filter: brightness(1.1); }
  .success { margin-top: 16px; padding: 10px; border-radius: 8px;
    background: rgba(34,197,94,.12); border: 1px solid rgba(34,197,94,.3);
    color: #4ade80; font-size: .85rem; }
`;

export const ContactPage = component(() => {
  const data = store({ name: '', email: '' });
  const ui = store({ errors: {} as Record<string, string>, sent: false });
  const formController = form();

  /** Validate a single field against the schema (used on blur). */
  const validateField = (field: 'name' | 'email') => {
    const r = ContactSchema.shape[field].validate(data[field]);
    ui.errors[field] = r.success ? '' : (Object.values(r.errors ?? {})[0] ?? 'Invalid');
  };

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    const result = ContactSchema.validate(data);
    ui.errors = result.errors ?? {};
    if (!result.success) return;
    ui.sent = true;
    // Clear the form after the success message shows (deferred so the
    // reactive success binding isn't clobbered by the data reset).
    setTimeout(() => {
      data.name = '';
      data.email = '';
      ui.errors = {};
      ui.sent = false;
    }, 3000);
  };

  return (
    <div class="page">
      <style>{style}</style>
      <h1>Contact</h1>
      <p>astrajs.dev/form + astrajs.dev/schema</p>
      <div class="form-card">
        <form controller={formController} onSubmit={handleSubmit}>
          <div class="field">
            <label>Name</label>
            <input
              name="name"
              type="text"
              placeholder="Ada Lovelace"
              value={data.name}
              onBlur={() => validateField('name')}
            />
            {formController.touched.name && ui.errors.name && <p class="error">{ui.errors.name}</p>}
          </div>
          <div class="field">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="ada@example.com"
              value={data.email}
              onBlur={() => validateField('email')}
            />
            {formController.touched.email && ui.errors.email && <p class="error">{ui.errors.email}</p>}
          </div>
          <button type="submit">Send</button>
        </form>
        {ui.sent && <div class="success">✓ Message sent (demo)</div>}
      </div>
    </div>
  );
});
