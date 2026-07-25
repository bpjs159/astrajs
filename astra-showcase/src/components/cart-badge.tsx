/**
 * AstraStore — Cart Badge Component
 *
 * Displays the current cart item count with reactive updates.
 * When items are added to the cart, only this badge's text node
 * updates — no component re-render, no VDOM diff.
 *
 * Type: Component (no props needed)
 */

import type { Component } from '@astrajs/core';
import { getCartCount } from '../stores/cart.js';
import { styles } from '../styles/dashboard.css.js';

/**
 * Reactive cart badge. The `getCartCount()` call inside the JSX
 * expression is compiled to a `bindText()` call by the AST transformer.
 *
 * When `cartStore.items` changes, only this text node updates — O(1).
 */
export const CartBadge: Component = () => {
  const count = getCartCount();

  // Only show badge if there are items
  if (count === 0) {
    return document.createTextNode('');
  }

  return (
    <span class={styles['cart-badge']}>
      {count}
    </span>
  );
};
