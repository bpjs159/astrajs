import { server } from '@bpjs159/server';

export interface Order {
  id: string;
  product: string;
  quantity: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped';
  date: string;
  likes: number;
}

const MOCK_ORDERS: Order[] = [
  { id: 'ord-1', product: 'Wireless Headphones', quantity: 1, total: 299, status: 'shipped', date: '2026-08-01', likes: 5 },
  { id: 'ord-2', product: 'Running Shoes', quantity: 2, total: 358, status: 'confirmed', date: '2026-08-03', likes: 12 },
  { id: 'ord-3', product: 'Smart Watch', quantity: 1, total: 449, status: 'pending', date: '2026-08-08', likes: 21 },
  { id: 'ord-4', product: 'Matcha Tea', quantity: 3, total: 102, status: 'shipped', date: '2026-07-28', likes: 3 },
  { id: 'ord-5', product: 'Office Chair', quantity: 1, total: 599, status: 'confirmed', date: '2026-08-05', likes: 8 },
];

export const getOrders = server({ tags: ['orders'], autoSync: true, autoSyncInterval: 5000 }, async (): Promise<Order[]> => {
  return MOCK_ORDERS;
});

export const likeOrder = server(async (id: string): Promise<{ id: string }> => {
  const order = MOCK_ORDERS.find((o) => o.id === id);
  if (!order) throw new Error(`Order "${id}" not found`);
  if (Math.random() < 0.3) throw new Error(`Server rejected the like for "${id}"`);
  order.likes++;
  return { id };
});
