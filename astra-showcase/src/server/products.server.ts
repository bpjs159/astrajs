import { server } from '@bpjs159/server';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Wireless Headphones', price: 299, stock: 45, category: 'Electronics' },
  { id: 'p2', name: 'Running Shoes', price: 179, stock: 120, category: 'Sports' },
  { id: 'p3', name: 'Smart Watch', price: 449, stock: 32, category: 'Electronics' },
  { id: 'p4', name: 'Matcha Tea', price: 34, stock: 200, category: 'Food' },
  { id: 'p5', name: 'Office Chair', price: 599, stock: 15, category: 'Furniture' },
  { id: 'p6', name: 'Mechanical Keyboard', price: 159, stock: 78, category: 'Electronics' },
  { id: 'p7', name: 'Yoga Mat', price: 49, stock: 300, category: 'Sports' },
  { id: 'p8', name: 'Desk Lamp', price: 89, stock: 55, category: 'Furniture' },
];

export const getProducts = server({ tags: ['products'], maxAge: 60 }, async (): Promise<Product[]> => {
  return MOCK_PRODUCTS;
});

export const getProductById = server(async (id: string): Promise<Product | null> => {
  return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
});
