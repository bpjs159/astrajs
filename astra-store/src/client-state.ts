/**
 * Client-side shared UI state (cart badge, session, route).
 * All of it is reactive — dynamic blocks re-render on change.
 */
import { store } from 'astrajs.dev/core';

function cartId(): string {
  let id = localStorage.getItem('astra_cart');
  if (!id) {
    id = `cart-${crypto.randomUUID()}`;
    localStorage.setItem('astra_cart', id);
  }
  return id;
}

export const clientState = store({
  path: window.location.pathname || '/',
  cartId: cartId(),
  cartCount: 0,
  cartTotal: 0,
  token: localStorage.getItem('astra_token') ?? '',
});

export function navigate(path: string): void {
  if (clientState.path !== path) {
    history.pushState(null, '', path);
    clientState.path = path;
  }
  window.scrollTo(0, 0);
}

export function setToken(token: string): void {
  clientState.token = token;
  localStorage.setItem('astra_token', token);
  document.cookie = `astra_token=${token}; path=/; SameSite=Lax; max-age=86400`;
}

export function syncCartBadge(count: number, total: number): void {
  clientState.cartCount = count;
  clientState.cartTotal = total;
}
