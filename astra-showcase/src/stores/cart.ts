import { store } from '@bpjs159/core';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export const cartStore = store({
  items: [] as CartItem[],
});

export function addToCart(product: { id: string; name: string; price: number }): void {
  const existing = cartStore.items.find((i) => i.productId === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cartStore.items = [...cartStore.items, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
  }
}

export function removeFromCart(productId: string): void {
  cartStore.items = cartStore.items.filter((i) => i.productId !== productId);
}

export function clearCart(): void {
  cartStore.items = [];
}

export function cartTotal(): number {
  return cartStore.items.reduce((s, i) => s + i.price * i.quantity, 0);
}

export function cartCount(): number {
  return cartStore.items.reduce((s, i) => s + i.quantity, 0);
}
