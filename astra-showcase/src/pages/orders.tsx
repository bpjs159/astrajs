import { component, mounted } from '@bpjs159/core';
import { orderStore } from '../stores/orders.js';
import { getOrders, likeOrder } from '../server/orders.server.js';
import type { Order } from '../stores/orders.js';

async function toggleLike(order: Order): Promise<void> {
  if (orderStore.pending.has(order.id)) return;
  orderStore.lastError = undefined;

  order.likes++;
  orderStore.pending = new Set(orderStore.pending).add(order.id);

  try {
    await likeOrder(order.id);
  } catch (e) {
    order.likes--;
    orderStore.lastError = e instanceof Error ? e.message : 'Unknown error';
  } finally {
    const next = new Set(orderStore.pending);
    next.delete(order.id);
    orderStore.pending = next;
  }
}

const statusColor: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#38bdf8',
  shipped: '#34d399',
};

export const OrdersPage = component(() => {
  mounted(() => {
    if (orderStore.items.length === 0) {
      getOrders().then((orders) => {
        orderStore.items = orders;
      });
    }
  });

  const totalRevenue = orderStore.items.reduce((s: number, o: { total: number }) => s + o.total, 0);

  return (
    <div class="page">
      <div class="page-header">
        <h1>Orders</h1>
        <p>Optimistic mutations (<code>06</code>) + AutoSync polling (<code>08</code>)</p>
      </div>

      {orderStore.lastError && (
        <div class="errorSlot">
          <div class="error-banner">{orderStore.lastError} — rolled back.</div>
        </div>
      )}

      <div class="stats-row">
        <div class="stat-mini">
          <span class="stat-mini-num">{orderStore.items.length}</span>
          <span class="stat-mini-lbl">Total Orders</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-num">${totalRevenue.toLocaleString()}</span>
          <span class="stat-mini-lbl">Revenue</span>
        </div>
      </div>

      <div class="order-list">
        {orderStore.items.map((o) => (
          <div class="order-row">
            <div class="order-info">
              <div class="order-product">{o.product}</div>
              <div class="order-meta">
                <span class="order-status" style={`color:${statusColor[o.status] || '#64748b'}`}>
                  ● {o.status}
                </span>
                <span class="order-date">{o.date}</span>
                <span class="order-qty">×{o.quantity}</span>
                <span class="order-total">${o.total}</span>
              </div>
            </div>
            <button
              class={`like-btn ${orderStore.pending.has(o.id) ? 'pending' : ''}`}
              disabled={orderStore.pending.has(o.id)}
              onClick={() => toggleLike(o)}
            >
              ▲ {o.likes}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});
