/**
 * 04 — Routing
 *
 * Client-side routing with nested layouts.
 * The sidebar navigation persists; only the <Outlet /> content swaps.
 * Uses `window.history` — no full page reloads.
 */

import { store, effect } from '@astrajs/core';

// ─── Simple Router ───────────────────────────────────────────────────────────
// (Using a minimal inline router to avoid dependency issues in the demo.
//  In production, use `@astrajs/router`.)

const router = store({ path: window.location.pathname || '/' });

const routes: Record<string, { emoji: string; title: string; desc: string; badge: string }> = {
  '/': { emoji: '🏠', title: 'Home', desc: 'Welcome to the routing demo. Click the links in the sidebar to navigate between pages.', badge: 'Dashboard' },
  '/products': { emoji: '📦', title: 'Products', desc: 'Browse our product catalog. Each product has its own detail page with URL params.', badge: 'Catalog' },
  '/about': { emoji: 'ℹ️', title: 'About', desc: 'AstraJS router uses pushState/popState for SPA navigation. No full page reloads.', badge: 'Info' },
  '/settings': { emoji: '⚙️', title: 'Settings', desc: 'User preferences and configuration. State persists across navigation.', badge: 'Config' },
};

function navigate(path: string): void {
  window.history.pushState(null, '', path);
  router.path = path;
}

window.addEventListener('popstate', () => {
  router.path = window.location.pathname;
});

// Initial navigation
window.history.replaceState(null, '', router.path);

// ─── Render ──────────────────────────────────────────────────────────────────
const app = document.getElementById('app')!;

function render(): void {
  const navLinks = Object.keys(routes).map((path) => {
    const active = router.path === path ? ' active' : '';
    return `<a href="${path}" class="${active}" data-nav="${path}">${routes[path]!.emoji} ${routes[path]!.title}</a>`;
  }).join('');

  const current = routes[router.path] ?? routes['/']!;

  app.innerHTML = `
    <nav>
      <h2>⚡ AstraRouter</h2>
      ${navLinks}
    </nav>
    <main>
      <div class="page">
        <div class="emoji">${current.emoji}</div>
        <h1>${current.title}</h1>
        <p>${current.desc}</p>
        <span class="badge">${current.badge}</span>
        <p style="margin-top:24px;font-size:.8rem;color:#64748b;">
          Current path: <code style="background:#334155;padding:2px 6px;border-radius:4px;">${router.path}</code>
        </p>
      </div>
    </main>
  `;

  // Wire up navigation
  app.querySelectorAll('a[data-nav]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      navigate((a as HTMLAnchorElement).dataset.nav!);
    });
  });
}

// Reactive re-render on route change
effect(() => { render(); });

// Initial render
render();

(window as any).router = router;
(window as any).navigate = navigate;
