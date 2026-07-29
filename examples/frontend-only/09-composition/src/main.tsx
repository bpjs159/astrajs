/**
 * 09 — Component Composition · Fragments, Slots & Layouts
 *
 * AstraJS components return real DOM nodes — no Virtual DOM wrappers.
 * This makes composition trivial: pass nodes as values, render fragments
 * as arrays, and use functions as "slots" for layout components.
 *
 * ## Patterns Demonstrated
 *
 * 1. **Fragment `<>...</>`** — return multiple siblings without a wrapper div
 * 2. **Layout Component** — `Card` wraps arbitrary content via a `children` prop
 * 3. **Slot Pattern** — `Card` accepts a `header` render function for custom headers
 * 4. **Composition** — `UserProfile` composes `Card` + `Badge` + `Avatar`
 * 5. **List Composition** — `UserList` renders multiple `UserProfile` components
 *
 * Key insight: Since components produce real DOM, you can `appendChild()`
 * or pass them as props without any special reconciliation logic.
 */
import { component, store } from '@astrajs/core';
import { styles } from './styles.js';

// ─── Layout Component: Card ──────────────────────────────────────────────

interface CardProps {
  title: string;
  header?: () => JSX.Element;  // Slot: custom header renderer
  children: JSX.Element;        // Content to wrap
}

const Card = component((props: CardProps) => {
  return (
    <div class={styles.card}>
      <div class={styles.cardHeader}>
        {props.header ? props.header() : <h3>{props.title}</h3>}
      </div>
      <div class={styles.cardBody}>
        {props.children}
      </div>
    </div>
  );
});

// ─── Primitive: Badge ────────────────────────────────────────────────────

interface BadgeProps {
  text: string;
  variant?: 'info' | 'success' | 'warning';
}

const Badge = component((props: BadgeProps) => {
  const v = props.variant ?? 'info';
  const cls = v === 'success' ? styles.badgeSuccess :
             v === 'warning' ? styles.badgeWarning :
             styles.badgeInfo;
  return <span class={cls}>{props.text}</span>;
});

// ─── Primitive: Avatar ───────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md';
}

const Avatar = component((props: AvatarProps) => {
  const initials = props.name.split(' ').map(w => w[0]).join('').toUpperCase();
  const cls = props.size === 'sm' ? styles.avatarSm : styles.avatarMd;
  return <span class={cls}>{initials}</span>;
});

// ─── Composed: UserProfile (Card + Badge + Avatar) ───────────────────────

interface UserProfileProps {
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
}

const UserProfile = component((props: UserProfileProps) => {
  const statusVariant = props.status === 'online' ? 'success' :
                        props.status === 'busy' ? 'warning' : 'info';
  return (
    <Card
      title={props.name}
      header={() => (
        <>
          <Avatar name={props.name} size="md" />
          <div>
            <strong>{props.name}</strong>
            <Badge text={props.status} variant={statusVariant as 'success' | 'warning' | 'info'} />
          </div>
        </>
      )}
      children={
        <p class={styles.role}>{props.role}</p>
      }
    />
  );
});

// ─── Page: Main Demo ─────────────────────────────────────────────────────

export const CompositionDemo = component(() => {
  const ui = store({ expanded: false });

  return (
    <div class={styles.page}>
      <h1>Component Composition</h1>
      <p class={styles.subtitle}>
        Fragments · Layout Slots · Real DOM composition — no VDOM wrappers
      </p>

      {/* ── Two Cards side-by-side ────────────────────────── */}
      <div class={styles.grid}>
        <Card title="Fragment Example" children={
          <>
            <p class={styles.note}>Fragments <code>&lt;&gt;...&lt;/&gt;</code> return multiple siblings without a wrapper div.</p>
            {ui.expanded && <p class={styles.expanded}>This appeared without an extra DOM node!</p>}
            <button class={styles.btn} onClick={() => ui.expanded = !ui.expanded}>
              {ui.expanded ? 'Collapse' : 'Expand'}
            </button>
          </>
        } />

        <Card title="Slot Pattern" children={
          <div class={styles.slotDemo}>
            <p class={styles.note}>The <code>header</code> prop is a render function — a "slot" that the Card invokes.</p>
            <Badge text="Pattern" variant="info" />
            <Badge text="Composable" variant="success" />
            <Badge text="Zero-VDOM" variant="warning" />
          </div>
        } />
      </div>

      {/* ── User Profiles (composition in action) ──────────── */}
      <h2 style="margin-top:24px;">Users</h2>
      <div class={styles.userGrid}>
        <UserProfile name="Alice Johnson" role="Staff Engineer" status="online" />
        <UserProfile name="Bob Smith" role="Designer" status="busy" />
        <UserProfile name="Carol Williams" role="PM" status="offline" />
      </div>
    </div>
  );
});
