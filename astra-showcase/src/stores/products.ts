/**
 * AstraStore — Products Store
 *
 * Reactive store for the products catalog. Initialized with pre-built
 * data from `server$({ type: 'pre-build' })` — zero JS shipped for
 * the initial product list.
 */

import { store } from '@astrajs/core';
import type { Component } from '@astrajs/core';

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * A product in the catalog. Fully inferred from the store shape.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  category: string;
  inStock: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
}

/**
 * Filter criteria for the product list.
 */
export interface ProductFilters {
  category: string | null;
  search: string;
  sortBy: 'name' | 'price' | 'rating' | 'newest';
  sortDir: 'asc' | 'desc';
}

// ─── Store ───────────────────────────────────────────────────────────────────

/**
 * The products store — initialized with pre-built data.
 *
 * In production, this would be:
 * ```ts
 * const products = store(getProducts({ type: 'pre-build', tags: ['products'] }));
 * ```
 * The `getProducts` call is executed at build time and inlined.
 */
export const productStore = store({
  /** All loaded products. */
  items: [] as Product[],
  /** Currently selected product (for detail view). */
  selected: null as Product | null,
  /** Active filters. */
  filters: {
    category: null,
    search: '',
    sortBy: 'name',
    sortDir: 'asc',
  } as ProductFilters,
  /** Loading state for dynamic queries. */
  loading: false,
  /** Error message if a query fails. */
  error: null as string | null,
}, { key: 'products' });

// ─── Derived Values (computed via memo) ──────────────────────────────────────

/**
 * Returns filtered and sorted products based on current store state.
 */
export function getFilteredProducts(): Product[] {
  const { items, filters } = productStore;
  let result = [...items];

  // Filter by category
  if (filters.category) {
    result = result.filter((p) => p.category === filters.category);
  }

  // Filter by search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  // Sort
  result.sort((a, b) => {
    const dir = filters.sortDir === 'asc' ? 1 : -1;
    switch (filters.sortBy) {
      case 'price':
        return (a.price - b.price) * dir;
      case 'rating':
        return (a.rating - b.rating) * dir;
      case 'newest':
        return a.id.localeCompare(b.id) * dir;
      default:
        return a.name.localeCompare(b.name) * dir;
    }
  });

  return result;
}

/**
 * Returns unique product categories.
 */
export function getCategories(): string[] {
  const categories = new Set(productStore.items.map((p) => p.category));
  return Array.from(categories).sort();
}

/**
 * Returns featured products.
 */
export function getFeaturedProducts(): Product[] {
  return productStore.items.filter((p) => p.featured).slice(0, 4);
}
