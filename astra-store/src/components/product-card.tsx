/**
 * Product card — pure presentational component. Receives PLAIN data props
 * so the same code renders in the SPA and in the SSR prerender.
 */
import { navigate } from '../client-state.js';
import { t } from '../i18n.js';

export interface ProductCardData {
  id: string;
  name: string;
  price: number;
  stock?: number;
  emoji: string;
  category?: string;
  rating?: number;
  reviews?: number;
}

export function ProductCard(p: ProductCardData): JSX.Element {
  return (
    <div class="card" onclick={() => navigate(`/products/${p.id}`)}>
      <div class="emoji">{p.emoji}</div>
      <div class="name">{p.name}</div>
      {p.category ? <div class="meta">{p.category}</div> : null}
      <div class="meta">
        <span class="price">${p.price}</span>
        {typeof p.rating === 'number'
          ? <span>★ {p.rating} ({p.reviews ?? 0})</span>
          : null}
      </div>
      {typeof p.stock === 'number'
        ? <div class={p.stock <= 20 ? 'stock low' : 'stock'}>
            {p.stock} {p.stock <= 20 ? t('product.lowStock') : t('product.inStock')}
          </div>
        : null}
    </div>
  );
}
