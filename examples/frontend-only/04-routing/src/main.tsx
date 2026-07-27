/**
 * 04 — Declarative Routing with @astrajs/router
 *
 * - route(path, { exact? })  → returns boolean
 * - fallbackRoute()           → 404 handler
 * - params                    → global reactive proxy
 * - navigate(path)            → programmatic navigation
 */
import { component } from '@astrajs/core';
import { route, fallbackRoute, navigate } from '@astrajs/router';
import { Home } from './pages/Home.js';
import { Products } from './pages/Products.js';
import { About } from './pages/About.js';
import { UserProfile } from './pages/UserProfile.js';
import { NotFound } from './pages/NotFound.js';

export const RouterDemo = component(() => (
  <div class="shell">
      <nav>
        <h2>AstraRouter</h2>
        <a href="/" class={route('/', { exact: true }) ? 'active' : ''} onClick={(e: Event) => { e.preventDefault(); navigate('/'); }}>🏠 Home</a>
        <a href="/products" class={route('/products') ? 'active' : ''} onClick={(e: Event) => { e.preventDefault(); navigate('/products'); }}>📦 Products</a>
        <a href="/about" class={route('/about') ? 'active' : ''} onClick={(e: Event) => { e.preventDefault(); navigate('/about'); }}>ℹ️ About</a>
        <a href="/users" class={route('/users') ? 'active' : ''} onClick={(e: Event) => { e.preventDefault(); navigate('/users'); }}>👤 Users</a>
      </nav>
      <main>
        {route('/', { exact: true }) && <Home />}
        {route('/products') && <Products />}
        {route('/about') && <About />}
        {route('/users') && <UserProfile />}
        {fallbackRoute() && <NotFound />}
      </main>
  </div>
));