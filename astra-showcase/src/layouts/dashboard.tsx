/**
 * AstraStore — Dashboard Layout
 *
 * Persistent layout with sidebar + main content area.
 * The `<Outlet />` renders child route content inside `<main>`.
 *
 * When navigating between pages, the Sidebar stays intact (no re-render),
 * and only the content inside `<Outlet />` is swapped.
 *
 * This is the magic of layout preservation in AstraJS.
 *
 * Type: Component
 */

import type { Component } from '@astrajs/core';
import { Outlet } from '@astrajs/router';
import { Sidebar } from '../components/sidebar.js';
import { styles } from '../styles/dashboard.css.js';

export const DashboardLayout: Component = () => {
  return (
    <div class={styles['app-shell']}>
      {/* Sidebar — rendered once, never re-renders on navigation */}
      <Sidebar />

      {/* Main content — <Outlet /> swaps on route change */}
      <main
        class={styles['main-content']}
        style={{ 'view-transition-name': 'main-content' }}
      >
        <Outlet />
      </main>
    </div>
  );
};
