/**
 * AstraStore — Product Detail Page
 *
 * Shows full product information with add-to-cart functionality.
 * The product ID is extracted from the URL via `useParams()`.
 *
 * Type: Component (no props — uses URL params)
 */

import type { Component } from '@astrajs/core';
import { params } from '@astrajs/router';
import { addToCart } from '../stores/cart.js';
import { productStore } from '../stores/products.js';
import { styles } from '../styles/dashboard.css.js';

export const ProductDetailPage: Component = () => {
  const id = params.id;
  const product = productStore.items.find((p) => p.id === id) ?? null;

  if (!product) {
    return (
      <div style="text-align:center;padding:64px;">
        <div style="font-size:4rem;margin-bottom:16px;">🔍</div>
        <h2>Product not found</h2>
        <p style="color:#64748b;">The product with ID "{id}" doesn't exist.</p>
        <a href="/products" class={`${styles['back-link']}`} style="margin-top:16px;display:inline-block;">
          ← Back to Products
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <a href="/products" class={styles['back-link']}>
        ← Back to Products
      </a>

      {/* Detail Grid */}
      <div class={styles['detail-grid']}>
        {/* Image */}
        <div class={styles['detail-image']}>{product.image}</div>

        {/* Info */}
        <div class={styles['detail-info']}>
          <div class="category">{product.category}</div>
          <h2>{product.name}</h2>
          <p class="description">{product.description}</p>

          {/* Meta */}
          <div class={styles['detail-meta']}>
            <div class={styles['detail-meta-item']}>
              <div class={styles['detail-meta-value']}>
                ${product.price.toFixed(2)}
              </div>
              <div class={styles['detail-meta-label']}>Price</div>
            </div>
            <div class={styles['detail-meta-item']}>
              <div class={styles['detail-meta-value']}>
                {'★'.repeat(Math.round(product.rating))}
              </div>
              <div class={styles['detail-meta-label']}>
                {product.rating} ({product.reviewCount} reviews)
              </div>
            </div>
            <div class={styles['detail-meta-item']}>
              <div class={styles['detail-meta-value']}>
                {product.inStock}
              </div>
              <div class={styles['detail-meta-label']}>
                In Stock
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            class={`${styles['btn']} ${styles['btn-primary']}`}
            style="font-size:1rem;padding:14px 32px;"
            onclick={() => {
              addToCart(product.id, product.name, product.price, product.image);
            }}
            disabled={product.inStock === 0}
          >
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
