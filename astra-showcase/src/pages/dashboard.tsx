import { component, mounted } from 'astrajs.dev/core';
import { StatCard } from '../components/stat-card.js';
import { productStore, loadProducts, setProductsLoading } from '../stores/products.js';
import { orderStore } from '../stores/orders.js';
import { cartTotal, cartCount } from '../stores/cart.js';
import { getProducts } from '../server/products.server.js';
import { getOrders } from '../server/orders.server.js';

export const DashboardPage = component(() => {
  mounted(() => {
    if (productStore.items.length === 0) {
      setProductsLoading();
      getProducts().then(loadProducts).catch((e) => {
        productStore.error = e instanceof Error ? e.message : 'Error';
      });
    }
    if (orderStore.items.length === 0) {
      getOrders().then((orders) => {
        orderStore.items = orders;
      });
    }
  });

  const totalRevenue = orderStore.items.reduce((s: number, o: { total: number }) => s + o.total, 0);
  const pendingOrders = orderStore.items.filter((o: { status: string }) => o.status === 'pending').length;

  return (
    <div class="page">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to the AstraJS showcase — all concepts in one app</p>
      </div>

      <div class="stats-grid">
        <StatCard label="Products" value={productStore.items.length || '—'} color="#818cf8" />
        <StatCard label="Orders" value={orderStore.items.length || '—'} color="#34d399" />
        <StatCard label="Pending" value={pendingOrders} color="#f59e0b" />
        <StatCard label="Revenue" value={`$${totalRevenue.toLocaleString()}`} color="#f472b6" />
        <StatCard label="Cart Items" value={cartCount()} color="#a78bfa" />
        <StatCard label="Cart Total" value={`$${cartTotal().toLocaleString()}`} color="#38bdf8" />
      </div>

      <div class="concepts-grid">
        {[
          { emoji: '🔁', title: 'server() RPC', desc: 'Type-safe server calls — example 01', href: '/products' },
          { emoji: '🔄', title: 'SWR', desc: 'Stale-While-Revalidate — example 02', href: '/products' },
          { emoji: '📝', title: 'Form + Server', desc: 'Form with validation — examples 03, 05', href: '/form' },
          { emoji: '🚦', title: 'Router', desc: 'Client-side routing — example 04', href: '/orders' },
          { emoji: '⚡', title: 'Optimistic', desc: 'Optimistic mutations — example 06', href: '/orders' },
          { emoji: '📤', title: 'File Upload', desc: 'File handling — example 07', href: '/upload' },
          { emoji: '🔄', title: 'AutoSync', desc: 'Real-time polling — example 08', href: '/orders' },
          { emoji: '📴', title: 'Resumability', desc: 'SSR + astra-data — example 09', href: '/products' },
          { emoji: '🏗️', title: 'SSG Pre-Build', desc: 'Build-time execution — example 10', href: '/products' },
        ].map((c) => (
          <a href={c.href} class="concept-card">
            <div class="concept-emoji">{c.emoji}</div>
            <div class="concept-info">
              <div class="concept-title">{c.title}</div>
              <div class="concept-desc">{c.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
});
