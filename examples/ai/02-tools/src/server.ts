/**
 * AI 02 — Tool calling (Phase 5)
 *
 * The model can call YOUR functions. `aiAgent` runs a tool loop on the
 * server: the model requests a tool → the tool executes (with module-scope
 * data) → the result feeds back → final answer.
 *
 * Roadmap: the compiler will derive these JSON Schemas from the TypeScript
 * signatures of your `server()` functions (zero-config tools).
 */
import { server } from 'astrajs.dev/server';
import { aiAgent } from 'astrajs.dev/ai';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

// Module-scope "database" — handlers keep this closure in production.
const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Wireless Headphones', price: 299, stock: 45 },
  { id: 'p2', name: 'Running Shoes', price: 179, stock: 120 },
  { id: 'p3', name: 'Smart Watch', price: 449, stock: 32 },
];

/** Plain RPC endpoint (also callable by the agent below). */
export const getProduct = server(async (id: string) => {
  return PRODUCTS.find((p) => p.id === id) ?? { error: 'Product not found' };
});

/** The agent: model + tools. Runs only on the server. */
const shop = aiAgent(
  {
    system: 'You are a shop assistant. Use the getProduct tool to answer about products. Be concise.',
    model: 'qwen2.5-coder:7b',
    maxSteps: 3,
    tools: [
      {
        schema: {
          name: 'getProduct',
          description: 'Get a product by id. Returns { id, name, price, stock }.',
          parameters: {
            type: 'object',
            properties: { id: { type: 'string' } },
            required: ['id'],
          },
        },
        // On the server, getProduct is the real function (RPC passthrough).
        fn: async (id: unknown) => getProduct(String(id)),
      },
    ],
  }
);

/** Client-callable endpoint wrapping the agent loop. */
export const askShop = server(async (question: string) => shop.run(question));
