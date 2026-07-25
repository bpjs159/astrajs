/**
 * AstraStore — Home Dashboard Page
 *
 * Shows key business stats, featured products, and recent orders.
 * Data comes from reactive stores — mutations anywhere in the app
 * update these stats in O(1) without re-rendering the component.
 *
 * Type: Component
 */

import type { Component } from '@astrajs/core';
import { getOrderStats, getRecentOrders } from '../stores/orders.js';
import { getFeaturedProducts, getFilteredProducts } from '../stores/products.js';
import { styles } from '../styles/dashboard.css.js';
import { StatCard } from '../components/stat-card.js';
import { ProductCard } from '../components/product-card.js';

export const HomePage: Component = () => {
  const stats = getOrderStats();
  const featured = getFeaturedProducts();
  const recentOrders = getRecentOrders(5);
  const totalProducts = getFilteredProducts().length;
  const inStock = getFilteredProducts().reduce((sum, p) => sum + p.inStock, 0);

  return (
    <div>
      {/* Header */}
      <div class={styles['page-header']}>
        <div>
          <h1 class={styles['page-title']}>Dashboard Overview</h1>
          <p class={styles['page-subtitle']}>
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div class={styles['stats-grid']}>
        <StatCard
          icon="💰"
          value={stats.totalRevenue}
          label="Total Revenue"
          accent="#10b981"
        />
        <StatCard
          icon="📦"
          value={stats.totalOrders}
          label="Total Orders"
          accent="#6366f1"
        />
        <StatCard
          icon="⏳"
          value={stats.pendingOrders}
          label="Pending Orders"
          accent="#f59e0b"
        />
        <StatCard
          icon="📊"
          value={totalProducts}
          label="Products ({inStock} in stock)"
          accent="#8b5cf6"
        />
      </div>

      {/* Featured Products */}
      <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:16px;">
        ⭐ Featured Products
      </h2>
      <div class={styles['product-grid']}>
        {featured.map((product) => (
          <ProductCard product={product} />
        ))}
      </div>

      {/* Recent Orders (compact table) */}
      {recentOrders.length > 0 && (
        <>
          <h2 style="font-size:1.25rem;font-weight:600;margin:32px 0 16px;">
            🕐 Recent Orders
          </h2>
          <div class={styles['table']}>
            <div class={styles['table-header']}>
              <span>Order ID</span>
              <span>Items</span>
              <span>Total</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {recentOrders.map((order) => (
              <div class={styles['table-row']}>
                <span style="font-family:monospace;font-size:0.8rem;">
                  {order.id}
                </span>
                <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                <span style="font-weight:600;">
                  ${order.total.toFixed(2)}
                </span>
                <span>
                  <span class={`${styles['status-badge']} ${styles[`status-${order.status}`]}`}>
                    {order.status}
                  </span>
                </span>
                <span style="color:#64748b;font-size:0.85rem;">
                  {new Date(order.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
