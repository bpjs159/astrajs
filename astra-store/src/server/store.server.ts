/**
 * astra-store — server-side RPC surface.
 *
 * Everything the store does flows through these typed server() functions:
 * catalog (ISR + Cache-Tag), cart, checkout (schema re-validated), auth
 * (configureRPC security hook) and an AI assistant (RAG over the catalog).
 */
import { server, configureRPC, revalidate } from 'astrajs.dev/server';
import { createRag } from 'astrajs.dev/ai/rag';
import { CheckoutSchema } from '../schema.js';
import type { FieldErrors } from '../schema.js';
import {
  PRODUCTS,
  CATEGORIES,
  carts,
  sessions,
  orders,
  cartTotals,
  findProduct,
} from '../db.js';
import type { Order, Product } from '../db.js';
import { l10nProductName, l10nProductDesc, l10nCategory } from '../catalog-i18n.js';
import type { LocaleCode } from '../i18n.js';

// ─── Security: RPC authentication hook ──────────────────────────────────────
// Public demo endpoints stay open; account endpoints require a session token
// (cookie `astra_token` set after login). This is the same configureRPC()
// surface any real app uses to gate its RPCs.
const PROTECTED = new Set(['getOrders']);

function sessionToken(request: Request): string | null {
  const cookie = request.headers.get('cookie') ?? '';
  const match = /(?:^|;\s*)astra_token=([a-f0-9-]{36})/.exec(cookie);
  return match ? match[1]! : null;
}

configureRPC({
  auth: (request: Request, id: string): boolean => {
    if (!PROTECTED.has(id)) return true;
    const token = sessionToken(request);
    return token !== null && sessions.has(token);
  },
});

// ─── Catalog (ISR) ───────────────────────────────────────────────────────────

export const getCatalog = server(
  { tags: ['catalog'], maxAge: 60 },
  async (category: string, lang: string) => {
    const locale = (lang || 'en') as LocaleCode;
    const list = category && category !== 'all'
      ? PRODUCTS.filter((p) => p.category === category)
      : PRODUCTS;
    return list.map(({ description, features, name, category: cat, ...rest }) => ({
      ...rest,
      name: l10nProductName(rest.id, locale, name),
      category: l10nCategory(cat, locale),
    }));
  }
);

export const getCategories = server({ tags: ['catalog'], maxAge: 3600 }, async (lang: string) => {
  const locale = (lang || 'en') as LocaleCode;
  return CATEGORIES.map((c) => ({ slug: c.slug, name: l10nCategory(c.slug, locale), emoji: c.emoji }));
});

export const getProduct = server({ tags: ['product'], maxAge: 300 }, async (id: string, lang: string) => {
  const product = findProduct(id);
  if (!product) return null;
  const locale = (lang || 'en') as LocaleCode;
  return {
    ...product,
    name: l10nProductName(product.id, locale, product.name),
    description: l10nProductDesc(product.id, locale, product.description),
    category: l10nCategory(product.category, locale),
  };
});

export const searchProducts = server(async (q: string, lang: string) => {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const locale = (lang || 'en') as LocaleCode;
  return PRODUCTS.filter((p) => {
    const localizedName = l10nProductName(p.id, locale, p.name).toLowerCase();
    const localizedDesc = l10nProductDesc(p.id, locale, p.description).toLowerCase();
    return (
      localizedName.includes(query) ||
      localizedDesc.includes(query) ||
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.includes(query)
    );
  })
    .slice(0, 8)
    .map(({ description, features, name, category: cat, ...rest }) => ({
      ...rest,
      name: l10nProductName(rest.id, locale, name),
      category: l10nCategory(cat, locale),
    }));
});

// ─── Cart ────────────────────────────────────────────────────────────────────

export const getCart = server(async (cartId: string) => cartTotals(cartId));

export const addToCart = server(async (cartId: string, productId: string, qty: number) => {
  const product = findProduct(productId);
  if (!product) return { ok: false, error: 'Unknown product' } as const;
  const items = carts.get(cartId) ?? [];
  const existing = items.find((i) => i.productId === productId);
  if (existing) {
    existing.qty = Math.min(existing.qty + (qty > 0 ? qty : 1), product.stock);
  } else {
    items.push({ productId, qty: Math.min(qty > 0 ? qty : 1, product.stock) });
  }
  carts.set(cartId, items);
  return { ok: true, cart: cartTotals(cartId) } as const;
});

export const removeFromCart = server(async (cartId: string, productId: string) => {
  const items = (carts.get(cartId) ?? []).filter((i) => i.productId !== productId);
  carts.set(cartId, items);
  return { ok: true, cart: cartTotals(cartId) } as const;
});

export const updateCartQty = server(async (cartId: string, productId: string, qty: number) => {
  const items = carts.get(cartId) ?? [];
  const item = items.find((i) => i.productId === productId);
  const product = findProduct(productId);
  if (item && product) {
    item.qty = Math.max(0, Math.min(qty, product.stock));
    if (item.qty === 0) {
      carts.set(cartId, items.filter((i) => i.productId !== productId));
    }
  }
  return { ok: true, cart: cartTotals(cartId) } as const;
});

// ─── Checkout (shared schema, server-side source of truth) ──────────────────

export const checkout = server(async (cartId: string, form: unknown) => {
  const result = CheckoutSchema.validate(form);
  if (!result.success) {
    return { ok: false, errors: (result.errors ?? {}) as FieldErrors } as const;
  }

  const totals = cartTotals(cartId);
  if (totals.items.length === 0) {
    return { ok: false, errors: { _: 'Cart is empty' } } as const;
  }

  // Decrement stock (ISR demo: cached catalog pages go stale → revalidate).
  for (const item of totals.items) {
    const product = findProduct(item.productId);
    if (product) product.stock = Math.max(0, product.stock - item.qty);
  }

  const data = form as { name: string; email: string; address: string; card: string };
  const order: Order = {
    id: `ord-${crypto.randomUUID().slice(0, 8)}`,
    email: data.email,
    items: totals.items.map((i) => ({
      productId: i.productId,
      name: i.product?.name ?? '?',
      qty: i.qty,
      price: i.product?.price ?? 0,
    })),
    total: totals.total,
    status: 'paid',
    date: new Date().toISOString().slice(0, 10),
  };
  orders.unshift(order);
  carts.delete(cartId);

  // ISR invalidation: purge cached catalog/product pages by tag.
  revalidate('catalog');
  revalidate('product');

  return { ok: true, orderId: order.id, total: totals.total } as const;
});

// ─── Auth (demo) ─────────────────────────────────────────────────────────────

export const login = server(async (email: string) => {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, error: 'Invalid email' } as const;
  }
  const token = crypto.randomUUID();
  sessions.set(token, normalized);
  return { ok: true, token } as const;
});

export const getOrders = server(async (token: string) => {
  const email = sessions.get(token) ?? '';
  return orders.filter((o) => o.email === email);
});

// ─── AI shopping assistant (RAG over the catalog) ───────────────────────────

const rag = createRag();
let ragIndexed = false;

function catalogDocs(): string[] {
  return PRODUCTS.map(
    (p) => `${p.name} (${p.category}) — ${p.description}. Price: $${p.price}. In stock: ${p.stock}. Features: ${p.features.join(', ')}.`
  );
}

export const aiAsk = server(async (question: string) => {
  if (!ragIndexed) {
    await rag.index('store', catalogDocs());
    ragIndexed = true;
  }
  return rag.answer('store', question);
});
