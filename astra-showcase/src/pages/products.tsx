/**
 * AstraStore — Products Page
 *
 * Full product catalog with category filters, search, and sorting.
 * All filtering is computed reactively from the store — zero
 * re-renders, only affected DOM nodes update.
 *
 * Type: Component
 */

import type { Component } from '@astrajs/core';
import {
  productStore,
  getFilteredProducts,
  getCategories,
} from '../stores/products.js';
import { styles } from '../styles/dashboard.css.js';
import { ProductCard } from '../components/product-card.js';

/** Creates a DocumentFragment from an array of elements — avoids TSX child type issues */
function ForEach<T>(items: T[], render: (item: T, i: number) => JSX.Element): DocumentFragment {
  const frag = document.createDocumentFragment();
  items.forEach((item, i) => frag.appendChild(render(item, i)));
  return frag;
}

export const ProductsPage: Component = () => {
  const categories = getCategories();
  const products = getFilteredProducts();

  return (
    <div>
      {/* Header */}
      <div class={styles['page-header']}>
        <div>
          <h1 class={styles['page-title']}>Products</h1>
          <p class={styles['page-subtitle']}>
            {`${products.length} product${products.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div class={styles['filters-bar']}>
        <input
          class={styles['search-input']}
          type="text"
          placeholder="Search products..."
          value={productStore.filters.search}
          oninput={(event: Event) => {
            const input = event.target as HTMLInputElement;
            productStore.filters.search = input.value;
          }}
        />

        <select
          class={styles['filter-select']}
          onchange={(event: Event) => {
            const select = event.target as HTMLSelectElement;
            productStore.filters.category = select.value || null;
          }}
        >
          <option value="">All Categories</option>
          {ForEach(categories, (cat) => (
            <option value={cat}>{cat}</option>
          ))}
        </select>

        <select
          class={styles['filter-select']}
          onchange={(event: Event) => {
            const select = event.target as HTMLSelectElement;
            productStore.filters.sortBy = select.value as 'name' | 'price' | 'rating' | 'newest';
          }}
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="rating">Sort by Rating</option>
          <option value="newest">Sort by Newest</option>
        </select>
      </div>

      {/* Product Grid */}
      <div class={styles['product-grid']}>
        {products.length === 0 ? (
          <div style="grid-column:1/-1;text-align:center;padding:48px;color:#64748b;">
            <div style="font-size:3rem;margin-bottom:16px;">🔍</div>
            <p style="font-weight:500;">No products found</p>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          ForEach(products, (product) => (
            <ProductCard product={product} />
          ))
        )}
      </div>
    </div>
  );
};
