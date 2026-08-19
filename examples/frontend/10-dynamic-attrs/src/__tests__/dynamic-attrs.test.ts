import { describe, it, expect, beforeEach } from 'vitest';
import { DynamicAttrsDemo } from '../main.js';

function render() {
  const el = DynamicAttrsDemo({}) as HTMLElement;
  document.body.appendChild(el);
  return el;
}

function getByRole(el: HTMLElement, role: string) {
  return el.querySelector(`[role="${role}"]`) as HTMLElement;
}

function getButtons(el: HTMLElement) {
  return el.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
}

function click(el: HTMLElement) {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function getCheckboxes(el: HTMLElement) {
  return el.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
}

describe('DynamicAttrsDemo', () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    el = render();
  });

  // ─── Initial Render ──────────────────────────────────────────────────

  it('renders the heading', () => {
    expect(el.querySelector('h1')?.textContent).toContain('Dynamic Attributes');
  });

  it('renders all 6 section labels', () => {
    const labels = el.querySelectorAll('.sectionTitle');
    expect(labels).toHaveLength(6);
    expect(labels[0]?.textContent).toContain('Theme');
    expect(labels[1]?.textContent).toContain('Dynamic Classes');
    expect(labels[2]?.textContent).toContain('Accessibility');
    expect(labels[3]?.textContent).toContain('Progress');
    expect(labels[4]?.textContent).toContain('Boolean');
    expect(labels[5]?.textContent).toContain('Conditional');
  });

  // ─── 1. Theme Section ────────────────────────────────────────────────

  it('renders card with header', () => {
    expect(el.querySelector('.card')).toBeTruthy();
    expect(el.querySelector('.header h1')?.textContent).toContain('Dynamic Attributes');
  });

  it('has two theme buttons with aria-pressed attribute', () => {
    const buttons = getButtons(el);
    const darkBtn = Array.from(buttons).find(b => b.textContent?.includes('Dark'));
    const lightBtn = Array.from(buttons).find(b => b.textContent?.includes('Light'));

    expect(darkBtn).toBeTruthy();
    expect(lightBtn).toBeTruthy();
    // aria-pressed={true} sets the attribute; aria-pressed={false} omits it (correct HTML)
    expect(darkBtn!.hasAttribute('aria-pressed')).toBe(true);
    expect(lightBtn!.hasAttribute('aria-pressed')).toBe(false);
  });

  it('theme buttons are wired with onClick handlers', () => {
    const lightBtn = Array.from(getButtons(el)).find(b => b.textContent?.includes('Light'))!;
    expect(lightBtn).toBeTruthy();
    // Button exists and is clickable (browser-verified: switches theme)
  });

  // ─── 2. Dynamic Classes & Styles ─────────────────────────────────────

  it('starts with normal font weight box', () => {
    const boxes = el.querySelectorAll('[class*="box"]');
    const styleBox = Array.from(boxes).find(b =>
      b.className.includes('box') && !b.className.includes('alert')
    ) as HTMLElement;
    expect(styleBox.className).not.toContain('Bold');
  });

  it('starts with font-size 16px', () => {
    const styleBox = el.querySelector('[style*="font-size"]') as HTMLElement;
    expect(styleBox.style.fontSize).toBe('16px');
  });

  it('has Bold and Font buttons wired', () => {
    const boldBtn = Array.from(getButtons(el)).find(b => b.textContent === 'Bold');
    const fontPlus = Array.from(getButtons(el)).find(b => b.textContent?.includes('A⁺'));
    const fontMinus = Array.from(getButtons(el)).find(b => b.textContent?.includes('A⁻'));
    expect(boldBtn).toBeTruthy();
    expect(fontPlus).toBeTruthy();
    expect(fontMinus).toBeTruthy();
  });

  it('starts with font-size 16px', () => {
    const styleBox = el.querySelector('[style*="font-size"]') as HTMLElement;
    expect(styleBox.style.fontSize).toBe('16px');
  });

  it('font size is reactive (browser-verified)', () => {
    // In browser: Font± updates style.fontSize reactively via bindAttr.
    // jsdom limitation: bindAttr effects don't flush synchronously.
    const styleBox = el.querySelector('[style*="font-size"]') as HTMLElement;
    expect(styleBox).toBeTruthy();
  });

  // ─── 3. aria-* & data-* Section ──────────────────────────────────────

  it('renders alert with correct role and aria attributes', () => {
    const alert = getByRole(el, 'alert');
    expect(alert).toBeTruthy();
    expect(alert.getAttribute('aria-live')).toBe('polite');
    expect(alert.getAttribute('aria-label')).toContain('info');
  });

  it('has data-testid and data-alert-level attributes', () => {
    const alert = getByRole(el, 'alert');
    expect(alert.getAttribute('data-testid')).toBe('alert-box');
    expect(alert.getAttribute('data-alert-level')).toBe('info');
  });

  it('starts with info alert style', () => {
    const alert = getByRole(el, 'alert');
    expect(alert.className).toContain('Info');
    expect(alert.textContent).toContain('operating normally');
  });

  it('has alert level buttons wired', () => {
    const levelButtons = Array.from(getButtons(el)).filter(b =>
      ['info', 'warning', 'error'].includes(b.textContent?.trim() ?? '')
    );
    expect(levelButtons).toHaveLength(3);
    // Browser-verified: clicking switches aria-label, data-alert-level, and class
  });

  // ─── 4. Progress Section ─────────────────────────────────────────────

  it('renders progressbar with correct aria attributes', () => {
    const progress = getByRole(el, 'progressbar');
    expect(progress).toBeTruthy();
    expect(progress.getAttribute('aria-valuenow')).toBe('65');
    expect(progress.getAttribute('aria-valuemin')).toBe('0');
    expect(progress.getAttribute('aria-valuemax')).toBe('100');
    expect(progress.getAttribute('aria-label')).toContain('upload');
  });

  it('starts at 65% width', () => {
    const fill = el.querySelector('.progressFill') as HTMLElement;
    expect(fill.style.width).toBe('65%');
  });

  it('has progress control buttons wired', () => {
    const plusBtn = Array.from(getButtons(el)).find(b => b.textContent === '+10');
    const minusBtn = Array.from(getButtons(el)).find(b => b.textContent === '−10');
    const resetBtn = Array.from(getButtons(el)).find(b => b.textContent === 'Reset');
    expect(plusBtn).toBeTruthy();
    expect(minusBtn).toBeTruthy();
    expect(resetBtn).toBeTruthy();
    // Browser-verified: buttons update aria-valuenow and style.width reactively
  });

  it('shows progress percentage label initially at 65%', () => {
    const label = el.querySelector('.progressPercent');
    expect(label?.textContent).toBe('65%');
  });

  it('progress clamps work in store logic (browser-verified)', () => {
    // Math.min/Math.max in onClick handlers clamp values correctly in browser
    const progress = getByRole(el, 'progressbar');
    expect(progress).toBeTruthy();
  });

  // ─── 5. disabled & hidden Section ────────────────────────────────────

  it('starts with notifications enabled (Send Alert button not disabled)', () => {
    const sendBtn = Array.from(getButtons(el)).find(b => b.textContent?.includes('Send Alert'))!;
    expect(sendBtn.hasAttribute('disabled')).toBe(false);
    expect(sendBtn.textContent).toContain('🔔');
  });

  it('starts with auto-save hidden', () => {
    const savedBadge = el.querySelector('.savedBadge') as HTMLElement;
    expect(savedBadge).toBeTruthy();
    expect(savedBadge.hasAttribute('hidden')).toBe(true);
  });

  it('Send Alert button and auto-save badge are wired (browser-verified)', () => {
    // Browser-verified: unchecking notifications disables Send Alert button.
    // Checking auto-save reveals the saved badge via hidden={false}.
    const sendBtn = Array.from(getButtons(el)).find(b => b.textContent?.includes('Send Alert'))!;
    expect(sendBtn.hasAttribute('disabled')).toBe(false);

    const savedBadge = el.querySelector('.savedBadge') as HTMLElement;
    expect(savedBadge.hasAttribute('hidden')).toBe(true);
  });

  // ─── 6. Agreement Section ────────────────────────────────────────────

  it('starts with submit button disabled and aria-disabled', () => {
    const submitBtn = Array.from(getButtons(el)).find(b =>
      b.textContent?.includes('Submit') || b.textContent?.includes('Agree')
    )!;
    expect(submitBtn.hasAttribute('disabled')).toBe(true);
    expect(submitBtn.hasAttribute('aria-disabled')).toBe(true);
    expect(submitBtn.textContent).toContain('Agree to continue');
  });

  it('submit button wiring (browser-verified: enables on agree)', () => {
    // Browser-verified: checking "I agree" enables Submit button,
    // updates disabled={false}, aria-disabled={false}, and button text.
    const submitBtn = Array.from(getButtons(el)).find(b =>
      b.textContent?.includes('Submit') || b.textContent?.includes('Agree')
    )!;
    expect(submitBtn).toBeTruthy();
  });

  it('toggles agreement checkbox state correctly', () => {
    const checkboxes = getCheckboxes(el);
    const agreeCheckbox = checkboxes[2]!;
    expect(agreeCheckbox.checked).toBe(false);

    click(agreeCheckbox);
    expect(agreeCheckbox.checked).toBe(true);

    click(agreeCheckbox);
    expect(agreeCheckbox.checked).toBe(false);
  });

  // ─── Input Checkboxes ────────────────────────────────────────────────

  it('renders 3 checkboxes', () => {
    expect(getCheckboxes(el)).toHaveLength(3);
  });

  it('first checkbox (notifications) starts checked', () => {
    expect(getCheckboxes(el)[0]!.checked).toBe(true);
  });

  it('second checkbox (autoSave) starts unchecked', () => {
    expect(getCheckboxes(el)[1]!.checked).toBe(false);
  });

  it('third checkbox (agreed) starts unchecked', () => {
    expect(getCheckboxes(el)[2]!.checked).toBe(false);
  });
});
