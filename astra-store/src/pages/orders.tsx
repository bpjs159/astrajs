/**
 * Orders — protected RPC. `login()` issues a session token (stored as a
 * cookie); the server's configureRPC({ auth }) hook guards getOrders and
 * answers 401 without a valid session.
 */
import { dynamic, store } from 'astrajs.dev/core';
import { t, currentLocale } from '../i18n.js';
import { clientState, setToken, syncCartBadge } from '../client-state.js';
import { login, getOrders } from '../server/store.server.js';
import { l10nProductName } from '../catalog-i18n.js';
import type { Order } from '../db.js';

export function OrdersPage(): JSX.Element {
  const ui = store({
    email: '',
    error: '',
    orders: [] as Order[],
    loading: false,
  });

  function loadOrders(): void {
    if (!clientState.token) return;
    ui.loading = true;
    getOrders(clientState.token).then((r) => { ui.orders = r; ui.loading = false; });
  }
  loadOrders();

  return (
    <div>
      <h2 class="section-title">{t('orders.title')}</h2>

      {dynamic(() =>
        clientState.token
          ? <div>
                <div class="meta">{t('orders.signedIn')} · {clientState.token.slice(0, 8)}…</div>
                {ui.loading ? <p class="notice">{t('common.loading')}</p> : <span></span>}
              {ui.orders.length === 0 && !ui.loading ? <p class="notice">{t('orders.empty')}</p> : <span></span>}
              {ui.orders.map((o) => (
                <div class="order-card">
                  <div class="row" style={{ justifyContent: 'space-between' }}>
                    <strong>{o.id}</strong>
                    <span class={`chip ${o.status}`}>{o.status}</span>
                  </div>
                  <div class="meta">{o.date} · {o.email}</div>
                  <div class="meta">
                    {o.items.map((i) => `${i.qty}× ${i.name}`).join(' · ')}
                  </div>
                  <div class="price">${o.total}</div>
                </div>
              ))}
            </div>
          : <div class="assistant" style={{ maxWidth: '460px' }}>
              <p>{t('orders.login')}</p>
              <p>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={ui.email}
                  oninput={(e) => { ui.email = (e.currentTarget as HTMLInputElement).value; }}
                />
              </p>
              {ui.error ? <p class="err">{ui.error}</p> : <span></span>}
              <button
                class="btn"
                onclick={async () => {
                  const res = await login(ui.email);
                  if (!res.ok) { ui.error = res.error; return; }
                  setToken(res.token);
                  loadOrders();
                }}
              >
                {t('orders.loginBtn')}
              </button>
            </div>
      )}
    </div>
  );
}
