import { store } from '@astrajs/core';

export interface Order {
  id: string;
  product: string;
  quantity: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped';
  date: string;
  likes: number;
}

export const orderStore = store({
  items: [] as Order[],
  pending: new Set<string>(),
  lastError: undefined as string | undefined,
});
