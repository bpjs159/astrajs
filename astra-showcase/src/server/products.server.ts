/**
 * AstraStore — Products Server Functions
 *
 * `server$()` functions for the products catalog.
 *
 * - `getProducts`: Pre-built at SSG time (type: 'pre-build')
 *   → 0 KB of JS shipped for the initial product list.
 * - `getProductById`: Dynamic RPC for product detail pages.
 * - `searchProducts`: Dynamic RPC for search queries.
 *
 * These functions are processed by the AstraJS Vite compiler:
 * - Server side: registered as API endpoints at `/api/rpc/*`
 * - Client side: replaced with type-safe `fetch()` wrappers
 * - Pre-build: executed at SSG time, result inlined in HTML
 */

import { server$, revalidate } from '@astrajs/server';
import type { Product } from '../stores/products.js';

// ─── Mock Database (in production: real DB) ──────────────────────────────────

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_001', name: 'Wireless Headphones Pro',
    description: 'Premium noise-cancelling wireless headphones with 40h battery life. Immersive sound with spatial audio support.',
    price: 299.99, currency: 'USD', image: '🎧',
    category: 'Electronics', inStock: 45, rating: 4.8, reviewCount: 2341, featured: true,
  },
  {
    id: 'prod_002', name: 'Ultralight Running Shoes',
    description: 'Carbon-fiber plate running shoes. Engineered mesh upper for maximum breathability.',
    price: 179.99, currency: 'USD', image: '👟',
    category: 'Sports', inStock: 120, rating: 4.6, reviewCount: 892, featured: true,
  },
  {
    id: 'prod_003', name: 'Smart Watch Series X',
    description: 'Advanced health monitoring with ECG, blood oxygen, and sleep tracking. Always-on Retina display.',
    price: 449.99, currency: 'USD', image: '⌚',
    category: 'Electronics', inStock: 32, rating: 4.9, reviewCount: 5678, featured: true,
  },
  {
    id: 'prod_004', name: 'Organic Matcha Green Tea',
    description: 'Ceremonial grade Japanese matcha. Stone-ground for a smooth, creamy texture.',
    price: 34.99, currency: 'USD', image: '🍵',
    category: 'Food & Drink', inStock: 200, rating: 4.5, reviewCount: 456, featured: false,
  },
  {
    id: 'prod_005', name: 'Ergonomic Office Chair',
    description: 'Lumbar support, adjustable armrests, breathable mesh back. Rated for 8+ hours of comfort.',
    price: 599.99, currency: 'USD', image: '🪑',
    category: 'Furniture', inStock: 15, rating: 4.7, reviewCount: 1234, featured: true,
  },
  {
    id: 'prod_006', name: 'Mechanical Keyboard RGB',
    description: 'Cherry MX Brown switches with per-key RGB lighting. Aircraft-grade aluminum frame.',
    price: 159.99, currency: 'USD', image: '⌨️',
    category: 'Electronics', inStock: 78, rating: 4.4, reviewCount: 2100, featured: false,
  },
  {
    id: 'prod_007', name: 'Yoga Mat Premium',
    description: '6mm thick natural rubber mat with microfiber suede top. Non-slip in all conditions.',
    price: 79.99, currency: 'USD', image: '🧘',
    category: 'Sports', inStock: 55, rating: 4.3, reviewCount: 321, featured: false,
  },
  {
    id: 'prod_008', name: 'Portable Bluetooth Speaker',
    description: '360° sound, IP67 waterproof, 20h battery. Built-in microphone for calls.',
    price: 129.99, currency: 'USD', image: '🔊',
    category: 'Electronics', inStock: 90, rating: 4.6, reviewCount: 1876, featured: false,
  },
  {
    id: 'prod_009', name: 'Artisan Coffee Beans',
    description: 'Single-origin Ethiopian Yirgacheffe. Light roast with floral and citrus notes.',
    price: 24.99, currency: 'USD', image: '☕',
    category: 'Food & Drink', inStock: 300, rating: 4.8, reviewCount: 678, featured: false,
  },
  {
    id: 'prod_010', name: 'Standing Desk Converter',
    description: 'Height-adjustable sit-stand desk converter. Fits dual monitors. Gas spring lift.',
    price: 349.99, currency: 'USD', image: '📐',
    category: 'Furniture', inStock: 25, rating: 4.5, reviewCount: 543, featured: false,
  },
  {
    id: 'prod_011', name: 'Wireless Earbuds Pro',
    description: 'Active noise cancellation, transparency mode, 8h battery + 24h with case.',
    price: 199.99, currency: 'USD', image: '🎵',
    category: 'Electronics', inStock: 150, rating: 4.7, reviewCount: 3456, featured: false,
  },
  {
    id: 'prod_012', name: 'Resistance Bands Set',
    description: '5 levels of resistance (10-50 lbs). Includes door anchor, ankle straps, and carry bag.',
    price: 39.99, currency: 'USD', image: '💪',
    category: 'Sports', inStock: 180, rating: 4.2, reviewCount: 234, featured: false,
  },
];

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Pre-built query: fetches ALL products at SSG time.
 *
 * The result is inlined into the HTML as `astra-data`.
 * 0 KB of JS shipped to the client for this data.
 *
 * Cache tag: 'products' — call `revalidate('products')` to purge.
 */
export const getProducts = server$(
  { type: 'pre-build', tags: ['products'], maxAge: 3600 },
  async (): Promise<Product[]> => {
    // In production: await db.products.findMany()
    return MOCK_PRODUCTS;
  }
);

/**
 * Dynamic query: fetches a single product by ID.
 *
 * Called at runtime (CSR/SSR) via fetch to `/api/rpc/getProductById`.
 */
export const getProductById = server$(
  { type: 'dynamic', tags: ['products'], maxAge: 300 },
  async (id: string): Promise<Product | null> => {
    const product = MOCK_PRODUCTS.find((p) => p.id === id);
    return product ?? null;
  }
);

/**
 * Dynamic query: searches products by keyword.
 */
export const searchProducts = server$(
  async (query: string): Promise<Product[]> => {
    const q = query.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }
);

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Dynamic mutation: updates product stock after a purchase.
 * Calls `revalidate('products')` to purge cached data.
 */
export const updateProductStock = server$(
  { type: 'dynamic', tags: ['products'] },
  async (productId: string, quantityChange: number): Promise<{ success: boolean; newStock: number }> => {
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    product.inStock += quantityChange;

    // Invalidate cache so clients get fresh data
    revalidate('products');

    return { success: true, newStock: product.inStock };
  }
);
