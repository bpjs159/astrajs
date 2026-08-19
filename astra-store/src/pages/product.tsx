/**
 * Product detail — SSR-prerendered per product + ISR (maxAge 300, tag
 * 'product'), revalidated when a purchase decrements stock.
 */
import { dynamic, store } from 'astrajs.dev/core';
import { t, currentLocale } from '../i18n.js';
import { navigate, clientState, syncCartBadge } from '../client-state.js';
import { getProduct, addToCart } from '../server/store.server.js';
import type { Product } from '../db.js';

export function ProductView(product: Product): JSX.Element {
  return (
    <div class="product-page">
      <div class="big-emoji">{product.emoji}</div>
      <div>
        <p class="breadcrumb">
          <a onclick={() => navigate('/products')}>{t('product.back')}</a>
        </p>
        <h1>{product.name}</h1>
        <p class="meta">
          <span class="price">${product.price}</span>
          <span> ★ {product.rating} ({product.reviews} {t('product.reviews')})</span>
        </p>
        <p class="desc">{product.description}</p>
        <ul class="features">
          {product.features.map((f) => <li>{f}</li>)}
        </ul>
        <p class={product.stock <= 20 ? 'stock low' : 'stock'}>
          {product.stock} {t('product.inStock')}
          {product.stock <= 20 ? ` — ${t('product.low')}` : ''}
        </p>
      </div>
    </div>
  );
}

export function ProductPage(id: string): JSX.Element {
  const ui = store({ product: null as Product | null, notice: '' });

  getProduct(id, currentLocale()).then((p) => { ui.product = p; });

  return (
    <div>
      {dynamic(() =>
        ui.product
          ? <div>
              {ProductView(ui.product)}
              <div class="row">
                <button
                  class="btn"
                  onclick={async () => {
                    const res = await addToCart(clientState.cartId, ui.product!.id, 1);
                    if (res.ok) syncCartBadge(res.cart.count, res.cart.total);
                    ui.notice = t('product.added');
                    setTimeout(() => { ui.notice = ''; }, 2000);
                  }}
                >
                  {t('product.add')}
                </button>
              </div>
              {ui.notice ? <div class="notice ok">{ui.notice}</div> : <span></span>}
            </div>
          : <p class="notice">{t('product.loading')}</p>
      )}
    </div>
  );
}
