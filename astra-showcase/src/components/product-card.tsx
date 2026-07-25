/**
 * AstraStore — Product Card Component
 *
 * Displays a product in a card format with image, name, price, and rating.
 * Clicking navigates to the product detail page.
 *
 * Type: Component<ProductCardProps>
 */

import type { Component } from '@astrajs/core';
import type { Product } from '../stores/products.js';
import { styles } from '../styles/dashboard.css.js';

export interface ProductCardProps {
  product: Product;
}

/**
 * Product card with gradient image placeholder, name, category,
 * price, and star rating.
 *
 * The `onclick` handler navigates to the product detail using
 * `router.navigate()` — intercepted by the router as SPA navigation,
 * not a full page reload.
 */
export const ProductCard: Component<ProductCardProps> = ({ product }) => {
  return (
    <div
      class={styles['product-card']}
      onclick={() => {
        // Use the global router reference
        const win = window as Record<string, unknown>;
        const router = win.__astra_router as
          | { navigate: (to: string) => void }
          | undefined;
        router?.navigate(`/products/${product.id}`);
      }}
    >
      <div class={styles['product-image']}>{product.image}</div>
      <div class={styles['product-info']}>
        <div class={styles['product-name']}>{product.name}</div>
        <div class={styles['product-category']}>{product.category}</div>
        <div class={styles['product-footer']}>
          <span class={styles['product-price']}>
            ${product.price.toFixed(2)}
          </span>
          <span class={styles['product-rating']}>
            {'★'.repeat(Math.round(product.rating))}{' '}
            {product.rating}
          </span>
        </div>
      </div>
    </div>
  );
};
