/**
 * Checkout — the SAME CheckoutSchema validates on the client (instant
 * feedback) and on the server inside the checkout() RPC (source of truth).
 * A successful order decrements stock and revalidates the ISR cache.
 */
import { dynamic, store } from 'astrajs.dev/core';
import { t } from '../i18n.js';
import { navigate, clientState, syncCartBadge } from '../client-state.js';
import { CheckoutSchema } from '../schema.js';
import type { FieldErrors } from '../schema.js';
import { checkout } from '../server/store.server.js';

export function CheckoutPage(): JSX.Element {
  const ui = store({
    name: '',
    email: '',
    address: '',
    card: '',
    clientErrors: {} as FieldErrors,
    serverErrors: {} as FieldErrors,
    submitting: false,
    orderId: '',
    total: 0,
  });

  async function pay(): Promise<void> {
    ui.serverErrors = {};
    const form = { name: ui.name, email: ui.email, address: ui.address, card: ui.card };
    const client = CheckoutSchema.validate(form);
    ui.clientErrors = (client.errors ?? {}) as FieldErrors;
    if (!client.success) return;

    ui.submitting = true;
    const res = await checkout(clientState.cartId, form);
    ui.submitting = false;

    if (!res.ok) {
      ui.serverErrors = (res.errors ?? {}) as FieldErrors;
      return;
    }
    syncCartBadge(0, 0);
    ui.orderId = res.orderId;
    ui.total = res.total;
  }

  return (
    <div>
      <h2 class="section-title">{t('checkout.title')}</h2>
      {dynamic(() =>
        ui.orderId
          ? <div>
              <div class="notice ok">
                {t('checkout.placed').replace('{id}', ui.orderId).replace('{total}', String(ui.total))}
              </div>
              <button class="btn" onclick={() => navigate('/orders')}>{t('nav.orders')}</button>
            </div>
          : <span></span>
      )}
      <div class="form-grid">
        <div class="form-field">
          <label>{t('checkout.name')}</label>
          <input type="text" value={ui.name} oninput={(e) => { ui.name = (e.currentTarget as HTMLInputElement).value; }} />
          <span class="err">{ui.clientErrors.name ?? ui.serverErrors.name ?? ''}</span>
        </div>
        <div class="form-field">
          <label>{t('checkout.email')}</label>
          <input type="email" value={ui.email} oninput={(e) => { ui.email = (e.currentTarget as HTMLInputElement).value; }} />
          <span class="err">{ui.clientErrors.email ?? ui.serverErrors.email ?? ''}</span>
        </div>
        <div class="form-field">
          <label>{t('checkout.address')}</label>
          <input type="text" value={ui.address} oninput={(e) => { ui.address = (e.currentTarget as HTMLInputElement).value; }} />
          <span class="err">{ui.clientErrors.address ?? ui.serverErrors.address ?? ''}</span>
        </div>
        <div class="form-field">
          <label>{t('checkout.card')}</label>
          <input type="text" value={ui.card} oninput={(e) => { ui.card = (e.currentTarget as HTMLInputElement).value; }} />
          <span class="err">{ui.clientErrors.card ?? ui.serverErrors.card ?? ''}</span>
        </div>
      </div>
      <div class="block">
        <button class="btn" disabled={ui.submitting} onclick={pay}>{t('checkout.pay')}</button>
        <button class="btn ghost" onclick={() => navigate('/cart')} style={{ marginLeft: '10px' }}>{t('nav.cart')}</button>
      </div>
    </div>
  );
}
