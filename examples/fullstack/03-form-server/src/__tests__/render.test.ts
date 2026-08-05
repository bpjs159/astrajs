import { describe, it, expect, afterEach } from 'vitest';
import { FormServerDemo } from '../main.js';

afterEach(() => {
  document.body.innerHTML = '';
});

/**
 * Runs microtasks (and macrotasks) with a hard iteration cap so that a
 * reactive infinite loop (which would normally OOM the browser/editor)
 * throws instead of hanging.
 */
async function drainQueue(iterations = 2000): Promise<void> {
  for (let i = 0; i < iterations; i++) {
    await Promise.resolve();
    // Allow macrotask sources (setTimeout 0) to fire too
    if (i % 50 === 0) {
      await new Promise<void>((r) => setTimeout(r, 0));
    }
  }
}

describe('03-form-server render', () => {
  it('renders the card without hanging', () => {
    const el = FormServerDemo({}) as HTMLElement;
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.querySelector('form')).toBeTruthy();
    expect(el.querySelectorAll('input').length).toBe(3);
    expect(el.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('survives mount + queued microtasks (no infinite reactive loop)', async () => {
    const el = FormServerDemo({}) as HTMLElement;
    document.body.appendChild(el);

    // Let _delegate's initial queueMicrotask(_refresh) and any effects run.
    await drainQueue();

    // If we get here, no unbounded loop consumed memory.
    expect(document.body.querySelector('form')).toBeTruthy();
    expect(document.body.querySelectorAll('input').length).toBe(3);
    expect(document.body.querySelector('.successBox')).toBeTruthy();
  });

  it('gates errors behind touched: no error before blur, touched set after blur', async () => {
    const el = FormServerDemo({}) as HTMLElement;
    document.body.appendChild(el);
    await drainQueue();

    const nameInput = document.body.querySelector<HTMLInputElement>('input[name="name"]')!;
    expect(nameInput).toBeTruthy();

    // The field is invalid (required, empty) but errors are gated behind
    // `touched` — so NO error <p> is rendered yet.
    expect(document.body.querySelector('.field .error')).toBeNull();

    // Blur marks the field as touched. The controller stores `touched.name`
    // and flags the DOM element with data-astra-touched (CSS target for
    // touched:invalid). The reactive error <p> then renders in the browser
    // because the Vite compiler wraps the JSX in dynamic().
    nameInput.dispatchEvent(new FocusEvent('blur', { bubbles: true, composed: true }));
    await drainQueue();

    expect(nameInput.hasAttribute('data-astra-touched')).toBe(true);
  });
});
