/**
 * 10 — Dynamic Attributes, Classes & Styles
 *
 * Plain JSX expressions in attributes — the compiler auto-detects reactive
 * references and generates `bindAttr()` calls. No special directives needed.
 *
 * ## What's Covered
 *
 * - **Dynamic `class`** — conditional class toggling
 * - **Dynamic `style`** — inline style objects
 * - **`aria-*` attributes** — accessible dynamic labels and states
 * - **`data-*` attributes** — custom data for testing/CSS hooks
 * - **`disabled` / `hidden`** — boolean HTML attributes
 * - **Theme toggling** — dark/light mode via dynamic classes/styles
 *
 * Everything is plain JS/TS expressions. The compiler handles the rest.
 */
import { component, store } from '@astrajs/core';
import { styles } from './styles.js';

export const DynamicAttrsDemo = component(() => {
  const ui = store({
    // Visual toggles
    theme: 'dark' as 'dark' | 'light',
    fontSize: 16,
    bold: false,
    // State toggles
    notifications: true,
    autoSave: false,
    // Accessibility
    alertLevel: 'info' as 'info' | 'warning' | 'error',
    progress: 65,
    // Interactive
    agreed: false,
  });

  return (
    <div class={ui.theme === 'dark' ? styles.pageDark : styles.pageLight}>
      <h1>Dynamic Attributes</h1>
      <p class={styles.subtitle}>
        <code>class</code> · <code>style</code> · <code>aria-*</code> · <code>data-*</code> · <code>disabled</code>
      </p>

      {/* ── Theme Switcher ────────────────────────────────── */}
      <div class={styles.section}>
        <h3>Theme</h3>
        <div class={styles.row}>
          <button
            class={ui.theme === 'dark' ? styles.themeActive : styles.themeBtn}
            onClick={() => ui.theme = 'dark'}
            aria-pressed={ui.theme === 'dark'}
          >
            🌙 Dark
          </button>
          <button
            class={ui.theme === 'light' ? styles.themeActive : styles.themeBtn}
            onClick={() => ui.theme = 'light'}
            aria-pressed={ui.theme === 'light'}
          >
            ☀️ Light
          </button>
        </div>
      </div>

      {/* ── Dynamic Classes ──────────────────────────────── */}
      <div class={styles.section}>
        <h3>Dynamic Classes</h3>
        <div
          class={ui.bold ? styles.boxBold : styles.box}
          style={`font-size:${ui.fontSize}px;`}
        >
          This box reacts to toggles
        </div>
        <div class={styles.row}>
          <button class={styles.btn} onClick={() => ui.bold = !ui.bold}>
            {ui.bold ? 'Unbold' : 'Bold'}
          </button>
          <button class={styles.btn} onClick={() => ui.fontSize = Math.min(32, ui.fontSize + 2)}>
            Font + ({ui.fontSize}px)
          </button>
          <button class={styles.btn} onClick={() => ui.fontSize = Math.max(12, ui.fontSize - 2)}>
            Font -
          </button>
        </div>
      </div>

      {/* ── aria-* & data-* ──────────────────────────────── */}
      <div class={styles.section}>
        <h3>Accessibility (<code>aria-*</code>) & <code>data-*</code></h3>
        <div
          role="alert"
          aria-live="polite"
          aria-label={`Alert: ${ui.alertLevel}`}
          data-alert-level={ui.alertLevel}
          data-testid="alert-box"
          class={ui.alertLevel === 'error' ? styles.alertError :
                ui.alertLevel === 'warning' ? styles.alertWarning :
                styles.alertInfo}
        >
          {ui.alertLevel === 'error' ? '🚨 Critical system error' :
           ui.alertLevel === 'warning' ? '⚠️ Resource usage high' :
           'ℹ️ System operating normally'}
        </div>
        <div class={styles.row}>
          {(['info', 'warning', 'error'] as const).map(level => (
            <button
              class={ui.alertLevel === level ? styles.filterActive : styles.btnSm}
              onClick={() => ui.alertLevel = level}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* ── Progress with aria ───────────────────────────── */}
      <div class={styles.section}>
        <h3>Progress (<code>aria-valuenow</code>)</h3>
        <div
          role="progressbar"
          aria-valuenow={ui.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="File upload progress"
          class={styles.progressTrack}
        >
          <div class={styles.progressFill} style={`width:${ui.progress}%;`} />
        </div>
        <div class={styles.row}>
          <button class={styles.btn} onClick={() => ui.progress = Math.min(100, ui.progress + 10)}>+10%</button>
          <button class={styles.btn} onClick={() => ui.progress = Math.max(0, ui.progress - 10)}>-10%</button>
          <button class={styles.btn} onClick={() => ui.progress = 0}>Reset</button>
          <span class={styles.progressLabel}>{ui.progress}%</span>
        </div>
      </div>

      {/* ── Disabled & Hidden ────────────────────────────── */}
      <div class={styles.section}>
        <h3><code>disabled</code> & <code>hidden</code></h3>
        <div class={styles.row}>
          <label>
            <input type="checkbox" checked={ui.notifications} onChange={() => ui.notifications = !ui.notifications} />
            Enable notifications
          </label>
          <label>
            <input type="checkbox" checked={ui.autoSave} onChange={() => ui.autoSave = !ui.autoSave} />
            Auto-save
          </label>
        </div>
        <div class={styles.row} style="margin-top:10px;">
          <button class={styles.btn} disabled={!ui.notifications}>
            {ui.notifications ? '🔔 Send Alert' : '🔕 Disabled'}
          </button>
          <span hidden={!ui.autoSave} class={styles.savedBadge}>💾 Auto-saving enabled</span>
        </div>
      </div>

      {/* ── Agreement: disabled until checked ────────────── */}
      <div class={styles.section}>
        <h3>Conditional <code>disabled</code></h3>
        <label style="display:flex;align-items:center;gap:8px;font-size:.85rem;margin-bottom:10px;">
          <input type="checkbox" checked={ui.agreed} onChange={() => ui.agreed = !ui.agreed} />
          I agree to the terms of service
        </label>
        <button
          class={ui.agreed ? styles.btn : styles.btnDisabled}
          disabled={!ui.agreed}
          aria-disabled={!ui.agreed}
        >
          {ui.agreed ? '✅ Submit' : '🔒 Agree to continue'}
        </button>
      </div>
    </div>
  );
});
