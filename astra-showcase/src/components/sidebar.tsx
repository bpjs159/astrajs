/**
 * AstraStore — Sidebar Component
 *
 * Persistent navigation sidebar with route-aware active states.
 * This component is rendered ONCE in the DashboardLayout and never
 * re-renders — only the <Outlet /> inside the main content area
 * changes when navigating between pages.
 *
 * Type: Component (no props needed)
 */

import type { Component } from '@astrajs/core';
import { useLocation } from '@astrajs/router';
import { getCartCount } from '../stores/cart.js';
import { styles } from '../styles/dashboard.css.js';
import { CartBadge } from './cart-badge.js';

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', icon: '📊', label: 'Dashboard' },
  { href: '/products', icon: '🛍️', label: 'Products' },
  { href: '/orders', icon: '📦', label: 'Orders' },
];

/**
 * Sidebar component — uses `useLocation()` to highlight the active link.
 * The active state is reactive: when `router.navigate()` is called,
 * the sidebar's active indicator updates automatically.
 */
export const Sidebar: Component = () => {
  const { path } = useLocation();

  return (
    <aside class={styles.sidebar}>
      {/* Brand */}
      <div class={styles['sidebar-brand']}>
        <span>⚡</span>
        <span>AstraStore</span>
      </div>

      {/* Navigation */}
      <nav class={styles['sidebar-nav']}>
        {NAV_ITEMS.map((item) => (
          <a
            href={item.href}
            class={`${styles['sidebar-link']} ${isActive(path, item.href) ? styles['sidebar-link active'] : ''}`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {item.label === 'Orders' && (
              <span style="margin-left: auto;">
                <CartBadge />
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* Footer */}
      <div class={styles['sidebar-footer']}>
        Built with AstraJS ⚡
        <br />
        Zero-VDOM · Proxy‑Reactive
      </div>
    </aside>
  );
};

/**
 * Checks if the current path matches a nav item.
 */
function isActive(current: string, href: string): boolean {
  if (href === '/') return current === '/';
  return current.startsWith(href);
}
