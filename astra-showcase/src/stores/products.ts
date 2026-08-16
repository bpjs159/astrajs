import { store } from '@bpjs159/core';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export const productStore = store({
  items: [] as Product[],
  loading: false,
  error: undefined as string | undefined,
});

export function loadProducts(data: Product[]): void {
  productStore.items = data;
  productStore.loading = false;
}

export function setProductsLoading(): void {
  productStore.loading = true;
  productStore.error = undefined;
}

export function setProductsError(msg: string): void {
  productStore.error = msg;
  productStore.loading = false;
}
