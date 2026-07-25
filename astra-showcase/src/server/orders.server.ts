/**
 * AstraStore — Orders Server Functions
 *
 * Server-side order management with dynamic RPC.
 */

import { server$, revalidate } from '@astrajs/server';
import type { Order } from '../stores/orders.js';

// ─── Mock Database ───────────────────────────────────────────────────────────

const MOCK_ORDERS: Order[] = [
  {
    id: 'ord_001', date: '2026-07-24T10:30:00Z',
    items: [
      { name: 'Wireless Headphones Pro', quantity: 1, price: 299.99 },
      { name: 'Mechanical Keyboard RGB', quantity: 1, price: 159.99 },
    ],
    total: 459.98, status: 'shipped', trackingNumber: 'TRK-92837465',
  },
  {
    id: 'ord_002', date: '2026-07-23T14:15:00Z',
    items: [
      { name: 'Artisan Coffee Beans', quantity: 2, price: 24.99 },
      { name: 'Organic Matcha Green Tea', quantity: 1, price: 34.99 },
    ],
    total: 84.97, status: 'delivered',
  },
  {
    id: 'ord_003', date: '2026-07-25T09:00:00Z',
    items: [
      { name: 'Smart Watch Series X', quantity: 1, price: 449.99 },
    ],
    total: 449.99, status: 'processing',
  },
  {
    id: 'ord_004', date: '2026-07-22T16:45:00Z',
    items: [
      { name: 'Yoga Mat Premium', quantity: 1, price: 79.99 },
      { name: 'Resistance Bands Set', quantity: 1, price: 39.99 },
      { name: 'Ultralight Running Shoes', quantity: 1, price: 179.99 },
    ],
    total: 299.97, status: 'delivered',
  },
  {
    id: 'ord_005', date: '2026-07-25T11:20:00Z',
    items: [
      { name: 'Standing Desk Converter', quantity: 1, price: 349.99 },
    ],
    total: 349.99, status: 'pending',
  },
];

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Fetches all orders (with optional status filter).
 */
export const getOrders = server$(
  { type: 'dynamic', tags: ['orders'], maxAge: 60 },
  async (status?: string): Promise<Order[]> => {
    if (status) {
      return MOCK_ORDERS.filter((o) => o.status === status);
    }
    return MOCK_ORDERS;
  }
);

/**
 * Creates a new order from cart items.
 * Calls revalidate('orders') to purge the cached order list.
 */
export const createOrder = server$(
  { type: 'dynamic', tags: ['orders'] },
  async (items: Array<{ name: string; price: number; quantity: number }>): Promise<Order> => {
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order: Order = {
      id: `ord_${String(MOCK_ORDERS.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString(),
      items,
      total,
      status: 'pending',
    };

    MOCK_ORDERS.push(order);

    // Invalidate cached order data
    revalidate('orders');

    return order;
  }
);
