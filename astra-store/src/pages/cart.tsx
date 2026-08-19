/**
 * Cart — item management against the server cart RPC, with live totals
 * and a checkout CTA.
 */
import { dynamic, store } from 'astrajs.dev/core';
import { t, currentLocale } from '../i18n.js';
import { navigate, clientState, syncCartBadge } from '../client-state.js';
import { getCart, removeFromCart, updateCartQty } from '../server/store.server.js';
import { l10nProductName } from '../catalog-i18n.js';
import type { CartItem, Product } from '../db.js';

type Line = CartItem & { product: Product | undefined };

export function CartPage(): JSX.Element {
  const ui = store({
    items: [] as Line[],
    count: 0,
    total: 0,
    loaded: false,
  });

  function refresh(): void {
    getCart(clientState.cartId).then((r) => {
      ui.items = r.items as Line[];
      ui.count = r.count;
      ui.total = r.total;
      ui.loaded = true;
      syncCartBadge(r.count, r.total);
    });
  }
  refresh();

  return (
    <div>
      <h2 class="section-title">{t('cart.title')}</h2>
      {dynamic(() =>
        !ui.loaded
          ? <p class="notice">{t('common.loading')}</p>
          : ui.items.length === 0
            ? <p class="notice">{t('cart.empty')}</p>
            : <span></span>
      )}

      <div class="cart-lines">
        {dynamic(() =>
          ui.items.map((line) => (
            <div class="cart-line">
              <div class="emoji" style={{ fontSize: '28px' }}>{line.product?.emoji ?? '📦'}</div>
              <div style={{ flex: '1' }}>
                <div class="name">
                  {l10nProductName(line.productId, currentLocale(), line.product?.name ?? t('cart.unknown'))}
                </div>
                <div class="meta">${line.product?.price ?? 0}</div>
              </div>
              <div class="qty">
                <button
                  onclick={async () => {
                    const res = await updateCartQty(clientState.cartId, line.productId, line.qty - 1);
                    if (res.ok) syncCartBadge(res.cart.count, res.cart.total);
                    refresh();
                  }}
                >−</button>
                <span>{line.qty}</span>
                <button
                  onclick={async () => {
                    const res = await updateCartQty(clientState.cartId, line.productId, line.qty + 1);
                    if (res.ok) syncCartBadge(res.cart.count, res.cart.total);
                    refresh();
                  }}
                >+</button>
              </div>
              <button
                class="btn ghost"
                onclick={async () => {
                  const res = await removeFromCart(clientState.cartId, line.productId);
                  if (res.ok) syncCartBadge(res.cart.count, res.cart.total);
                  refresh();
                }}
              >
                {t('cart.remove')}
              </button>
            </div>
          ))
        )}
      </div>

      {dynamic(() =>
        ui.count > 0
          ? <div class="totals">
              <div class="row" style={{ justifyContent: 'space-between' }}>
                <strong>{t('cart.total')}: ${ui.total}</strong>
                <button class="btn" onclick={() => navigate('/checkout')}>{t('cart.checkout')}</button>
              </div>
            </div>
          : <span></span>
      )}
    </div>
  );
}
