/**
 * astrajs.dev/router — <Link> component
 *
 * A client-side navigation link that uses `navigate()` instead of
 * full-page reloads. Falls back gracefully to standard `<a>` behavior
 * when JavaScript is disabled (progressive enhancement).
 *
 * ```tsx
 * <Link href="/products">Products</Link>
 * <Link href="/dashboard" class="nav-link">Dashboard</Link>
 * ```
 */

import { navigate } from './navigate.js';

export interface LinkProps {
  href: string;
  class?: string;
  className?: string;
  children?: unknown;
  [key: string]: unknown;
}

export function Link(props: LinkProps): JSX.Element {
  const { href, class: cls, className, children, ...rest } = props;

  const a = document.createElement('a');
  a.href = href;
  if (cls) a.className = cls;
  if (className) a.className = className;

  // Set remaining attributes
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== null && key !== 'children') {
      a.setAttribute(key, String(value));
    }
  }

  // Append children
  if (children !== undefined && children !== null) {
    if (Array.isArray(children)) {
      for (const child of children) {
        if (child instanceof Node) a.appendChild(child);
        else a.appendChild(document.createTextNode(String(child)));
      }
    } else if (children instanceof Node) {
      a.appendChild(children);
    } else {
      a.textContent = String(children);
    }
  }

  // Client-side navigation via navigate() — progressive enhancement:
  // the href is set above so the link works without JS.
  a.addEventListener('click', (e) => {
    e.preventDefault();
    navigate(href);
  });

  return a;
}
