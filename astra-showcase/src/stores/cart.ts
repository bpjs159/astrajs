/**
 * AstraStore — Cart Store
 *
 * Reactive shopping cart with computed totals.
 * Mutations are direct property assignments — no actions, no reducers.
 * The Proxy reactivity system tracks exactly which DOM bindings
 * depend on cart items, totals, etc.
 */

import { store } from '@astrajs/core';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const cartStore = store({
  items: [] as CartItem[],
  /** Coupon code (if applied). */
  coupon: null as string | null,
  /** Discount percentage (0–100). */
  discountPercent: 0,
}, { key: 'cart' });

// ─── Mutations (direct property assignment) ──────────────────────────────────

/**
 * Adds a product to the cart. If it already exists, increments quantity.
 */
export function addToCart(productId: string, name: string, price: number, image: string): void {
  const existing = cartStore.items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity++;
  } else {
    cartStore.items.push({
      productId,
      name,
      price,
      image,
      quantity: 1,
    });
  }
}

/**
 * Removes an item from the cart.
 */
export function removeFromCart(productId: string): void {
  const idx = cartStore.items.findIndex((i) => i.productId === productId);
  if (idx !== -1) {
    cartStore.items.splice(idx, 1);
  }
}

/**
 * Updates the quantity of a cart item.
 */
export function updateQuantity(productId: string, quantity: number): void {
  const item = cartStore.items.find((i) => i.productId === productId);
  if (item) {
    item.quantity = Math.max(0, quantity);
    if (item.quantity === 0) {
      removeFromCart(productId);
    }
  }
}

/**
 * Clears the cart.
 */
export function clearCart(): void {
  cartStore.items.length = 0;
  cartStore.coupon = null;
  cartStore.discountPercent = 0;
}

// ─── Computed Values ─────────────────────────────────────────────────────────

/**
 * Returns the total number of items in the cart.
 */
export function getCartCount(): number {
  return cartStore.items.reduce((sum, i) => sum + i.quantity, 0);
}

/**
 * Returns the subtotal (before discount).
 */
export function getSubtotal(): number {
  return cartStore.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

/**
 * Returns the discount amount.
 */
export function getDiscount(): number {
  return getSubtotal() * (cartStore.discountPercent / 100);
}

/**
 * Returns the total after discount.
 */
export function getTotal(): number {
  return getSubtotal() - getDiscount();
}
