/**
 * astra-store — in-memory catalog + order/session state.
 *
 * The "database" is a module-scope in-memory store living inside the
 * server bundle (dev: the Vite SSR module graph; prod: dist/server/server.mjs).
 * The client only ever receives data through typed RPC responses.
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  emoji: string;
  description: string;
  features: string[];
  rating: number;
  reviews: number;
  featured?: boolean;
}

export interface Category {
  slug: string;
  name: string;
  emoji: string;
}

export interface CartItem {
  productId: string;
  qty: number;
}

export interface Order {
  id: string;
  email: string;
  items: Array<{ productId: string; name: string; qty: number; price: number }>;
  total: number;
  status: 'paid' | 'shipped';
  date: string;
}

export const CATEGORIES: Category[] = [
  { slug: 'audio', name: 'Audio', emoji: '🎧' },
  { slug: 'wearables', name: 'Wearables', emoji: '⌚' },
  { slug: 'home', name: 'Home', emoji: '🏠' },
  { slug: 'sports', name: 'Sports', emoji: '⚽' },
  { slug: 'accessories', name: 'Accessories', emoji: '🎒' },
  { slug: 'gaming', name: 'Gaming', emoji: '🎮' },
];

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Aurora Wireless Headphones', price: 299, stock: 45, category: 'audio', emoji: '🎧', rating: 4.8, reviews: 231, featured: true, description: 'Over-ear headphones with adaptive noise cancellation and 40h battery. Zero-latency mode for gaming.', features: ['Adaptive ANC', '40h battery', 'Multipoint Bluetooth 5.4', 'USB-C fast charge'] },
  { id: 'p2', name: 'Pulse Smart Watch', price: 449, stock: 32, category: 'wearables', emoji: '⌚', rating: 4.6, reviews: 188, featured: true, description: 'AMOLED smart watch with health sensors, GPS and 7-day battery.', features: ['AMOLED 1.4"', 'SpO2 + HR + sleep tracking', 'Dual-band GPS', '7-day battery'] },
  { id: 'p3', name: 'Echo Smart Speaker', price: 129, stock: 78, category: 'home', emoji: '🔊', rating: 4.5, reviews: 412, description: 'Room-filling smart speaker with voice assistant and multi-room sync.', features: ['360° audio', 'Voice assistant', 'Multi-room pairing', 'Aux input'] },
  { id: 'p4', name: 'Velocity Running Shoes', price: 179, stock: 120, category: 'sports', emoji: '👟', rating: 4.7, reviews: 356, featured: true, description: 'Carbon-plated daily trainers with energy-return foam.', features: ['Carbon plate', 'Energy-return foam', 'Engineered mesh', '238 g (US 9)'] },
  { id: 'p5', name: 'Zen Desk Lamp', price: 89, stock: 54, category: 'home', emoji: '💡', rating: 4.4, reviews: 97, description: 'Dimmable LED desk lamp with circadian presets and wireless charging base.', features: ['5 light temperatures', 'Qi charging base', 'Auto-dimming sensor', 'Aluminium body'] },
  { id: 'p6', name: 'Trail Pro Backpack 28L', price: 139, stock: 66, category: 'accessories', emoji: '🎒', rating: 4.6, reviews: 203, description: 'Weatherproof 28L backpack with suspended laptop bay and load lifters.', features: ['IPX4 weatherproof', '28L capacity', '16" laptop bay', 'YKK zippers'] },
  { id: 'p7', name: 'Nova Mechanical Keyboard', price: 159, stock: 41, category: 'gaming', emoji: '⌨️', rating: 4.9, reviews: 512, featured: true, description: 'Hot-swappable 75% mechanical keyboard with gasket mount and RGB.', features: ['Hot-swap switches', 'Gasket mount', 'PBT keycaps', '2.4G + BT + wired'] },
  { id: 'p8', name: 'Orbit Gaming Mouse', price: 79, stock: 88, category: 'gaming', emoji: '🖱️', rating: 4.7, reviews: 301, description: '26K DPI wireless gaming mouse at 58 g with optical switches.', features: ['26K DPI sensor', '58 g weight', 'Optical switches', '90h battery'] },
  { id: 'p9', name: 'Breeze Smart Fan', price: 119, stock: 25, category: 'home', emoji: '🌀', rating: 4.3, reviews: 64, description: 'Bladeless smart fan with app control, night mode and HEPA filter.', features: ['Bladeless design', 'HEPA filter', 'App + voice control', '28 dB night mode'] },
  { id: 'p10', name: 'Summit Yoga Mat Pro', price: 69, stock: 140, category: 'sports', emoji: '🧘', rating: 4.8, reviews: 278, description: '6mm natural-rubber yoga mat with alignment guides and carry strap.', features: ['Natural rubber', 'Alignment guides', 'Anti-slip both sides', 'Carry strap included'] },
  { id: 'p11', name: 'Lumen E-Reader', price: 199, stock: 37, category: 'accessories', emoji: '📖', rating: 4.6, reviews: 154, description: '7" e-ink reader with warm light, audiobooks and 8-week battery.', features: ['7" e-ink Carta', 'Warm front light', 'Bluetooth audiobooks', '32 GB storage'] },
  { id: 'p12', name: 'Titan Portable Charger', price: 59, stock: 210, category: 'accessories', emoji: '🔋', rating: 4.5, reviews: 431, description: '20,000 mAh 65W power bank that charges a laptop and two phones at once.', features: ['65W USB-C PD', '20,000 mAh', 'Charges 3 devices', 'Airline-safe'] },
  { id: 'p13', name: 'Frost Mini Fridge', price: 249, stock: 18, category: 'home', emoji: '🧊', rating: 4.2, reviews: 73, description: '4L thermo-electric mini fridge for desk or dorm, near-silent.', features: ['4L capacity', 'Warm + cool modes', '22 dB quiet', '12V car adapter'] },
  { id: 'p14', name: 'Stride Fitness Band', price: 49, stock: 95, category: 'wearables', emoji: '📿', rating: 4.4, reviews: 266, description: 'Slim fitness band with 14-day battery and 5ATM water resistance.', features: ['14-day battery', '5ATM waterproof', '100+ sport modes', 'Sleep + stress tracking'] },
  { id: 'p15', name: 'Echo Buds ANC', price: 149, stock: 60, category: 'audio', emoji: '🎵', rating: 4.5, reviews: 344, description: 'True-wireless earbuds with hybrid ANC and spatial audio.', features: ['Hybrid ANC', 'Spatial audio', 'IPX5 sweat proof', '30h with case'] },
  { id: 'p16', name: 'Apex Game Controller', price: 89, stock: 47, category: 'gaming', emoji: '🎮', rating: 4.8, reviews: 389, description: 'Hall-effect wireless controller with back paddles and trigger locks.', features: ['Hall-effect sticks', 'Back paddles', 'Trigger locks', '40h battery'] },
];

// ─── Server-side runtime state (dev: Vite SSR module graph · prod: server.mjs)

export const carts = new Map<string, CartItem[]>();
export const sessions = new Map<string, string>(); // token → email
export const orders: Order[] = [];

export function getCart(cartId: string): CartItem[] {
  return carts.get(cartId) ?? [];
}

export function cartTotals(cartId: string): { count: number; total: number; items: Array<CartItem & { product: Product | undefined }> } {
  const items = getCart(cartId);
  let count = 0;
  let total = 0;
  const detailed = items.map((item) => {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    count += item.qty;
    total += (product?.price ?? 0) * item.qty;
    return { ...item, product };
  });
  return { count, total: Math.round(total * 100) / 100, items: detailed };
}

export function findProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
