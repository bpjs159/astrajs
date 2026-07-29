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

// ─── Section Label Component ──────────────────────────────────────────────

const SectionLabel = component((props: { icon: string; label: string; code: string }) => (
  <div class={styles.sectionLabel}>
    <span class={styles.sectionIcon}>{props.icon}</span>
    <div>
      <span class={styles.sectionTitle}>{props.label}</span>
      <code class={styles.sectionCode}>{props.code}</code>
    </div>
  </div>
));

// ─── Main Demo ────────────────────────────────────────────────────────────

export const DynamicAttrsDemo = component(() => {
  const ui = store({
    theme: 'dark' as 'dark' | 'light',
    fontSize: 16,
    bold: false,
    notifications: true,
    autoSave: false,
    alertLevel: 'info' as 'info' | 'warning' | 'error',
    progress: 65,
    agreed: false,
  });

  const THEME_ICON = ui.theme === 'dark' ? '🌙' : '☀️';

  return (
    <div class={styles.card}>
      {/* ── Header ─────────────────────────────────── */}
      <div class={styles.header}>
        <h1>Dynamic Attributes</h1>
        <p><code>class</code> · <code>style</code> · <code>aria-*</code> · <code>data-*</code> · <code>disabled</code> · <code>hidden</code></p>
      </div>

      <div class={styles.body}>
        {/* ── Section 1: Theme ─────────────────────── */}
        <SectionLabel icon="🎨" label="Theme & Dynamic Class" code={`class={theme === 'dark' ? ... : ...}`} />
        <div class={styles.sectionBox}>
          <p class={styles.desc}>The root <code>class</code> switches between dark and light themes. Buttons use <code>aria-pressed</code> for accessibility — <strong>all plain JS expressions</strong>.</p>
          <div class={styles.themeRow}>
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
            <span class={styles.themeBadge}>{THEME_ICON} Current: <strong>{ui.theme}</strong></span>
          </div>
        </div>

        {/* ── Section 2: Classes & Inline Styles ───── */}
        <SectionLabel icon="📐" label="Dynamic Classes & Inline Styles" code={`class={bold ? ... : ...}  style={\`font-size:\${n}px\`}`} />
        <div class={styles.sectionBox}>
          <p class={styles.desc}>The <code>class</code> attribute toggles between variants. The <code>style</code> attribute uses a template string with a reactive value — <strong>surgically updated</strong> without re-render.</p>
          <div
            class={ui.bold ? styles.boxBold : styles.box}
            style={`font-size:${ui.fontSize}px;`}
          >
            {THEME_ICON} This box reacts to toggles — {ui.fontSize}px {ui.bold ? '· BOLD' : ''}
          </div>
          <div class={styles.controlRow}>
            <button class={styles.btnPrimary} onClick={() => ui.bold = !ui.bold}>
              {ui.bold ? 'Unbold' : 'Bold'}
            </button>
            <div class={styles.fontControls}>
              <button class={styles.btnSm} onClick={() => ui.fontSize = Math.max(12, ui.fontSize - 2)}>A⁻</button>
              <span class={styles.fontLabel}>{ui.fontSize}px</span>
              <button class={styles.btnSm} onClick={() => ui.fontSize = Math.min(32, ui.fontSize + 2)}>A⁺</button>
            </div>
          </div>
        </div>

        {/* ── Section 3: aria-* & data-* ────────────── */}
        <SectionLabel icon="♿" label="Accessibility: aria-* & data-*" code={`aria-label={\`Alert: \${level}\`}  data-alert-level={level}`} />
        <div class={styles.sectionBox}>
          <p class={styles.desc}><code>aria-label</code>, <code>data-*</code>, and <code>role</code> update reactively. Screen readers detect changes instantly. <code>data-testid</code> stays stable for E2E tests.</p>
          <div
            role="alert"
            aria-live="polite"
            aria-label={`Alert level: ${ui.alertLevel}`}
            data-alert-level={ui.alertLevel}
            data-testid="alert-box"
            class={ui.alertLevel === 'error' ? styles.alertError :
                  ui.alertLevel === 'warning' ? styles.alertWarning :
                  styles.alertInfo}
          >
            <span class={styles.alertIcon}>
              {ui.alertLevel === 'error' ? '🚨' : ui.alertLevel === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <div>
              <strong>{ui.alertLevel === 'error' ? 'Critical' : ui.alertLevel === 'warning' ? 'Warning' : 'Info'}</strong>
              <span>{ui.alertLevel === 'error' ? ' — System error detected' : ui.alertLevel === 'warning' ? ' — Resource usage high' : ' — System operating normally'}</span>
            </div>
          </div>
          <div class={styles.controlRow}>
            {(['info', 'warning', 'error'] as const).map(level => (
              <button
                class={ui.alertLevel === level ? styles.filterActive : styles.filterBtn}
                onClick={() => ui.alertLevel = level}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* ── Section 4: Progress ───────────────────── */}
        <SectionLabel icon="📊" label="Progress Bar with aria-valuenow" code={`aria-valuenow={progress}  style={{width:\`\${progress}%\`}}`} />
        <div class={styles.sectionBox}>
          <p class={styles.desc}>A fully accessible progress bar. The visual <code>style.width</code> and semantic <code>aria-valuenow</code> stay in sync — <strong>one store property, two bindings</strong>.</p>
          <div class={styles.progressWrapper}>
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
            <span class={styles.progressPercent}>{ui.progress}%</span>
          </div>
          <div class={styles.controlRow}>
            <button class={styles.btnSm} onClick={() => ui.progress = Math.max(0, ui.progress - 10)}>−10</button>
            <button class={styles.btnSm} onClick={() => ui.progress = Math.min(100, ui.progress + 10)}>+10</button>
            <button class={styles.btnSm} onClick={() => ui.progress = 0}>Reset</button>
          </div>
        </div>

        {/* ── Section 5: disabled & hidden ──────────── */}
        <SectionLabel icon="🔒" label="Boolean Attributes: disabled & hidden" code={`disabled={!enabled}  hidden={!visible}`} />
        <div class={styles.sectionBox}>
          <p class={styles.desc}>Boolean HTML attributes like <code>disabled</code> and <code>hidden</code>. When <code>false</code>, the attribute is <strong>removed from the DOM</strong> — not set to <code>"false"</code>.</p>
          <div class={styles.toggleRow}>
            <label class={styles.toggle}>
              <input type="checkbox" checked={ui.notifications} onChange={() => ui.notifications = !ui.notifications} />
              <span class={styles.toggleLabel}>Enable notifications</span>
            </label>
            <label class={styles.toggle}>
              <input type="checkbox" checked={ui.autoSave} onChange={() => ui.autoSave = !ui.autoSave} />
              <span class={styles.toggleLabel}>Auto-save</span>
            </label>
          </div>
          <div class={styles.controlRow}>
            <button
              class={ui.notifications ? styles.btnPrimary : styles.btnDisabled}
              disabled={!ui.notifications}
            >
              {ui.notifications ? '🔔 Send Alert' : '🔕 Notifications disabled'}
            </button>
            <span hidden={!ui.autoSave} class={styles.savedBadge}>💾 Auto-saving enabled</span>
          </div>
        </div>

        {/* ── Section 6: Conditional disabled ───────── */}
        <SectionLabel icon="✅" label="Conditional disabled with aria-disabled" code={`disabled={!agreed}  aria-disabled={!agreed}`} />
        <div class={styles.sectionBox}>
          <p class={styles.desc}>Classic form pattern: button stays disabled until the user agrees. Both <code>disabled</code> and <code>aria-disabled</code> react to the same store property.</p>
          <label class={styles.agreementLabel}>
            <input type="checkbox" checked={ui.agreed} onChange={() => ui.agreed = !ui.agreed} />
            <span>I agree to the terms of service</span>
          </label>
          <button
            class={ui.agreed ? styles.submitBtn : styles.submitDisabled}
            disabled={!ui.agreed}
            aria-disabled={!ui.agreed}
          >
            {ui.agreed ? '✅ Submit' : '🔒 Agree to continue'}
          </button>
        </div>
      </div>
    </div>
  );
});
