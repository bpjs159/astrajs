import { component, store } from 'astrajs.dev/core';
import { server } from 'astrajs.dev/server';

const contactForm = store({
  name: '',
  email: '',
  message: '',
  submitting: false,
  submitted: false,
  error: undefined as string | undefined,
});

const submitContact = server(async (data: { name: string; email: string; message: string }): Promise<{ ok: boolean; error?: string }> => {
  if (!data.name || data.name.length < 2) return { ok: false, error: 'Name must be at least 2 characters' };
  if (!data.email || !data.email.includes('@')) return { ok: false, error: 'Invalid email address' };
  if (!data.message || data.message.length < 10) return { ok: false, error: 'Message must be at least 10 characters' };
  return { ok: true };
});

export const FormDemoPage = component(() => {
  async function handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    contactForm.submitting = true;
    contactForm.error = undefined;

    try {
      const result = await submitContact({
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
      });

      if (result.ok) {
        contactForm.submitted = true;
        contactForm.name = '';
        contactForm.email = '';
        contactForm.message = '';
      } else {
        contactForm.error = result.error;
      }
    } catch (e) {
      contactForm.error = e instanceof Error ? e.message : 'Submission failed';
    } finally {
      contactForm.submitting = false;
    }
  }

  return (
    <div class="page">
      <div class="page-header">
        <h1>Form + Validation</h1>
        <p>
          Client + server validation with <code>server()</code> — examples 03 + 05
        </p>
      </div>

      {contactForm.submitted && (
        <div class="success-banner">✓ Message sent successfully!</div>
      )}

      {contactForm.error && (
        <div class="errorSlot">
          <div class="error-banner">{contactForm.error}</div>
        </div>
      )}

      <form class="astro-form" onSubmit={handleSubmit}>
        <div class="form-field">
          <label>Name</label>
          <input
            type="text"
            value={contactForm.name}
            placeholder="Your name"
            onInput={(e: Event) => {
              contactForm.name = (e.target as HTMLInputElement).value;
            }}
          />
        </div>

        <div class="form-field">
          <label>Email</label>
          <input
            type="email"
            value={contactForm.email}
            placeholder="you@example.com"
            onInput={(e: Event) => {
              contactForm.email = (e.target as HTMLInputElement).value;
            }}
          />
        </div>

        <div class="form-field">
          <label>Message</label>
          <textarea
            value={contactForm.message}
            placeholder="Your message (min 10 characters)"
            rows="4"
            onInput={(e: Event) => {
              contactForm.message = (e.target as HTMLTextAreaElement).value;
            }}
          />
        </div>

        <button class="btn-primary" type="submit" disabled={contactForm.submitting}>
          {contactForm.submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
});
