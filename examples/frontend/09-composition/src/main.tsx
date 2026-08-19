/**
 * 09 — Component Composition · Fragments, Slots & Layouts
 *
 * AstraJS components return real DOM nodes — no Virtual DOM wrappers.
 * This makes composition trivial: pass nodes as values, render fragments
 * as arrays, and use functions as "slots" for layout components.
 *
 * ## Patterns Demonstrated
 *
 * 1. **Fragment `<>...</>`** — multiple siblings without a wrapper div
 * 2. **Layout Component** — `Card` wraps arbitrary content via `children`
 * 3. **Slot Pattern** — `header` render function for custom headers
 * 4. **Composition** — `UserProfile` = `Card` + `Badge` + `Avatar`
 * 5. **Primitives** — small reusable building blocks
 */
import { component, store } from 'astrajs.dev/core';
import { styles } from './styles.js';

// ─── Primitive: Badge ────────────────────────────────────────────────────

interface BadgeProps {
  text: string;
  variant?: 'info' | 'success' | 'warning' | 'accent';
}

const Badge = component((props: BadgeProps) => {
  const variant = props.variant ?? 'info';
  return <span class={`${styles.badge} ${styles[`badge${capitalize(variant)}` as keyof typeof styles]}`}>{props.text}</span>;
});

// ─── Primitive: Avatar ───────────────────────────────────────────────────

const AVATAR_GRADIENTS = ['avGrad0', 'avGrad1', 'avGrad2', 'avGrad3'] as const;

interface AvatarProps {
  name: string;
  index?: number;
}

const Avatar = component((props: AvatarProps) => {
  const initials = props.name.split(' ').map(w => w[0]).join('').toUpperCase();
  const grad = AVATAR_GRADIENTS[(props.index ?? 0) % 4]!;
  return <span class={`${styles.avatar} ${styles[grad]}`}>{initials}</span>;
});

// ─── Layout Component: Card ──────────────────────────────────────────────

interface CardProps {
  title?: string;
  header?: () => JSX.Element;
  children: JSX.Element;
  accent?: 'purple' | 'green' | 'pink' | 'amber';
}

const Card = component((props: CardProps) => {
  const accentCls = props.accent ? styles[`cardAccent${capitalize(props.accent)}` as keyof typeof styles] : '';
  return (
    <div class={`${styles.innerCard} ${accentCls}`}>
      <div class={styles.innerCardHeader}>
        {props.header ? props.header() : props.title ? <h4>{props.title}</h4> : null}
      </div>
      <div class={styles.innerCardBody}>
        {props.children}
      </div>
    </div>
  );
});

// ─── Composed: UserProfile ───────────────────────────────────────────────

interface UserProfileProps {
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  index: number;
}

const UserProfile = component((props: UserProfileProps) => {
  const statusVariant = props.status === 'online' ? 'success' :
                        props.status === 'busy' ? 'warning' : 'info';
  return (
    <Card
      accent={props.status === 'online' ? 'green' : props.status === 'busy' ? 'amber' : 'purple'}
      header={() => (
        <div class={styles.profileHeader}>
          <Avatar name={props.name} index={props.index} />
          <div class={styles.profileInfo}>
            <span class={styles.profileName}>{props.name}</span>
            <Badge text={props.status} variant={statusVariant} />
          </div>
        </div>
      )}
      children={
        <div class={styles.profileBody}>
          <span class={styles.profileRole}>{props.role}</span>
          <span class={styles.profileId}>#{String(props.index + 1).padStart(2, '0')}</span>
        </div>
      }
    />
  );
});

// ─── Helpers ─────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Demo Data ────────────────────────────────────────────────────────────

const USERS = [
  { name: 'Alice Johnson', role: 'Staff Engineer', status: 'online' as const },
  { name: 'Bob Smith', role: 'Product Designer', status: 'busy' as const },
  { name: 'Carol Williams', role: 'Tech Lead', status: 'offline' as const },
  { name: 'Dave Brown', role: 'Senior Developer', status: 'online' as const },
  { name: 'Eve Martinez', role: 'Engineering Manager', status: 'offline' as const },
  { name: 'Frank Chen', role: 'DevOps Engineer', status: 'busy' as const },
];

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

// ─── Page: Main Demo ─────────────────────────────────────────────────────

export const CompositionDemo = component(() => {
  const ui = store({ expanded: false });

  return (
    <div class={styles.card}>
      {/* ── Header ─────────────────────────────────── */}
      <div class={styles.header}>
        <h1>Component Composition</h1>
        <p><code>&lt;&gt;</code> Fragments · <code>children</code> Layouts · <code>header()</code> Slots · Zero-VDOM</p>
      </div>

      <div class={styles.body}>
        {/* ── Section 1: Fragment ──────────────────── */}
        <SectionLabel icon="🧩" label="Fragment Pattern" code="<> … </>" />
        <div class={styles.sectionBox}>
          <p class={styles.desc}>Fragments let you return <strong>multiple siblings</strong> without a wrapper <code>&lt;div&gt;</code>. The DOM stays flat — no extra nodes.</p>
          <div class={styles.demoArea}>
            <div class={styles.fragmentPreview}>
              <div class={styles.fragmentLabel}>DOM output with Fragment</div>
              <div class={styles.fragmentNodes}>
                <div class={styles.fragmentNode}><span class={styles.nodeTag}>p</span> First child</div>
                {ui.expanded && <div class={`${styles.fragmentNode} ${styles.fragmentNodeNew}`}><span class={styles.nodeTag}>p</span> Second child (conditional)</div>}
                <div class={styles.fragmentNode}><span class={styles.nodeTag}>button</span> Toggle</div>
              </div>
              <div class={styles.fragmentNote}>✓ No wrapper <code>&lt;div&gt;</code> — siblings are direct children of the parent</div>
            </div>
            <button class={styles.btnPrimary} onClick={() => ui.expanded = !ui.expanded}>
              {ui.expanded ? '✕ Collapse' : '+ Expand'} <span class={styles.btnHint}>— toggles second child</span>
            </button>
          </div>
        </div>

        {/* ── Section 2: Layout Component ──────────── */}
        <SectionLabel icon="📐" label="Layout Component" code="Card { children }" />
        <div class={styles.sectionBox}>
          <p class={styles.desc}>A <strong>layout component</strong> wraps arbitrary content via <code>children</code>. It owns the chrome (border, padding, header) — the caller owns the content.</p>
          <div class={styles.twoCol}>
            <Card title="Default Header" accent="purple" children={
              <p class={styles.demoText}>When no <code>header</code> slot is given, the <code>title</code> prop renders a simple <code>&lt;h4&gt;</code>.</p>
            } />
            <Card accent="green" header={() => (
              <div class={styles.customHeaderDemo}>
                <span class={styles.customHeaderIcon}>⚡</span>
                <span>Custom Slot Header</span>
              </div>
            )} children={
              <p class={styles.demoText}>The <code>header</code> prop is a <strong>render function</strong>. The Card invokes it — you control the markup.</p>
            } />
          </div>
        </div>

        {/* ── Section 3: Slot Pattern ───────────────── */}
        <SectionLabel icon="🔌" label="Slot Pattern" code="header={() => <Avatar />}" />
        <div class={styles.sectionBox}>
          <p class={styles.desc}>Slots are <strong>render functions passed as props</strong>. The layout component decides <em>where</em> to render — you decide <em>what</em>.</p>
          <div class={styles.slotShowcase}>
            <div class={styles.slotItem}>
              <code class={styles.slotName}>header</code>
              <span class={styles.slotArrow}>→</span>
              <span class={styles.slotDesc}>Renders at the top of the Card</span>
            </div>
            <div class={styles.slotItem}>
              <code class={styles.slotName}>children</code>
              <span class={styles.slotArrow}>→</span>
              <span class={styles.slotDesc}>Renders in the Card body (always required)</span>
            </div>
          </div>
          <div class={styles.badgeRow}>
            <Badge text="Composable" variant="accent" />
            <Badge text="Zero-VDOM" variant="success" />
            <Badge text="No wrappers" variant="warning" />
            <Badge text="Type-safe" variant="info" />
          </div>
        </div>

        {/* ── Section 4: Composition in Action ──────── */}
        <SectionLabel icon="🎯" label="Composition in Action" code="UserProfile = Card + Avatar + Badge" />
        <div class={styles.sectionBox}>
          <p class={styles.desc}>Each <code>UserProfile</code> is <strong>3 primitives composed together</strong>. No inheritance, no HOCs — just functions returning DOM.</p>
          <div class={styles.userGrid}>
            {USERS.map((u, i) => (
              <UserProfile name={u.name} role={u.role} status={u.status} index={i} />
            ))}
          </div>
        </div>

        {/* ── Section 5: Primitives ─────────────────── */}
        <SectionLabel icon="🧱" label="Building Blocks" code="Badge · Avatar · Card" />
        <div class={styles.sectionBox}>
          <p class={styles.desc}>Every piece is a <strong>standalone component</strong> with a single responsibility. Compose them freely — no framework lock-in.</p>
          <div class={styles.primitivesRow}>
            <div class={styles.primitiveCard}>
              <div class={styles.primitivePreview}><Badge text="online" variant="success" /></div>
              <code class={styles.primitiveName}>Badge</code>
              <span class={styles.primitiveDesc}>4 variants: info, success, warning, accent</span>
            </div>
            <div class={styles.primitiveCard}>
              <div class={styles.primitivePreview}><Avatar name="Jane Doe" index={0} /></div>
              <code class={styles.primitiveName}>Avatar</code>
              <span class={styles.primitiveDesc}>Auto-initials · 4 gradient styles</span>
            </div>
            <div class={styles.primitiveCard}>
              <div class={styles.primitivePreview}>
                <div class={styles.miniCard}>
                  <div class={styles.miniCardHdr}>Title</div>
                  <div class={styles.miniCardBody}>content</div>
                </div>
              </div>
              <code class={styles.primitiveName}>Card</code>
              <span class={styles.primitiveDesc}>Layout wrapper · 4 accent colors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
