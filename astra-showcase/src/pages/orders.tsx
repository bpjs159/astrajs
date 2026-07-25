/**
 * AstraStore — Orders Page
 *
 * Displays order history with status badges and totals.
 * Data flows from the orderStore — reactive, zero re-renders.
 *
 * Type: Component
 */

import type { Component } from '@astrajs/core';
import { orderStore, getOrderStats } from '../stores/orders.js';
import { styles } from '../styles/dashboard.css.js';
import { StatCard } from '../components/stat-card.js';

export const OrdersPage: Component = () => {
  const stats = getOrderStats();
  const orders = orderStore.orders;

  return (
    <div>
      {/* Header */}
      <div class={styles['page-header']}>
        <div>
          <h1 class={styles['page-title']}>Orders</h1>
          <p class={styles['page-subtitle']}>
            {orders.length} total order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div class={styles['stats-grid']}>
        <StatCard
          icon="📦"
          value={stats.totalOrders}
          label="Total Orders"
          accent="#6366f1"
        />
        <StatCard
          icon="💰"
          value={stats.totalRevenue}
          label="Total Revenue"
          accent="#10b981"
        />
        <StatCard
          icon="⏳"
          value={stats.pendingOrders}
          label="Pending"
          accent="#f59e0b"
        />
        <StatCard
          icon="📊"
          value={stats.averageOrderValue}
          label="Avg. Order Value"
          accent="#8b5cf6"
        />
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div style="text-align:center;padding:48px;color:#64748b;">
          <div style="font-size:3rem;margin-bottom:16px;">📭</div>
          <p style="font-weight:500;">No orders yet</p>
          <p>Orders will appear here once customers start purchasing.</p>
        </div>
      ) : (
        <div class={styles['table']}>
          <div class={styles['table-header']}>
            <span>Order ID</span>
            <span>Items</span>
            <span>Total</span>
            <span>Status</span>
            <span>Date</span>
          </div>
          {orders
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((order) => (
              <div class={styles['table-row']}>
                <span style="font-family:monospace;font-size:0.8rem;font-weight:600;">
                  {order.id}
                </span>
                <span>
                  {order.items.map((i) => (
                    <span style="display:block;font-size:0.85rem;">
                      {i.name} × {i.quantity}
                    </span>
                  ))}
                </span>
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
      )}
    </div>
  );
};
