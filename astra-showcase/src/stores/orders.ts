/**
 * AstraStore — Orders Store
 *
 * Manages order history and active order submissions via server$ mutations.
 */

import { store } from '@astrajs/core';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  date: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  averageOrderValue: number;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const orderStore = store({
  orders: [] as Order[],
  loading: false,
  error: null as string | null,
}, { key: 'orders' });

// ─── Computed ────────────────────────────────────────────────────────────────

export function getOrderStats(): OrderStats {
  const orders = orderStore.orders;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return { totalOrders, totalRevenue, pendingOrders, averageOrderValue };
}

export function getRecentOrders(limit: number = 5): Order[] {
  return [...orderStore.orders]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}
