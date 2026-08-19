/**
 * astra-tasks — RPC backend del tablero Kanban.
 *
 * - getBoard: autoSync (ETag + 304) → los clientes sondean y reciben el
 *   tablero solo cuando cambió (multi-tab sync).
 * - createCard / moveCard / deleteCard: mutaciones reales del estado.
 * - askAgent: agente AI con tools que opera sobre ESTE mismo estado
 *   (moveCard/createCard/summary) en un tool-loop del lado servidor.
 */
import { server, configureRPC } from 'astrajs.dev/server';
import { aiAgent } from 'astrajs.dev/ai';

configureRPC({ maxBodyBytes: 1 << 20 });

export interface Card {
  id: string;
  title: string;
  desc: string;
  col: 'todo' | 'doing' | 'done';
  order: number;
}

export interface Board {
  columns: { id: 'todo' | 'doing' | 'done'; name: string }[];
  cards: Card[];
}

let board: Board = {
  columns: [
    { id: 'todo', name: 'col.todo' },
    { id: 'doing', name: 'col.doing' },
    { id: 'done', name: 'col.done' },
  ],
  cards: [
    { id: 't1', title: 'Terminar docs de autoSync', desc: 'ETag + 304 explicado con ejemplos.', col: 'doing', order: 1 },
    { id: 't2', title: 'Diseñar el agente AI', desc: 'Tool-loop sobre el tablero.', col: 'doing', order: 2 },
    { id: 't3', title: 'Demo de rollback', desc: 'Toggle para simular fallo del servidor.', col: 'todo', order: 1 },
    { id: 't4', title: 'Prueba multi-pestaña', desc: 'Abre 2 tabs y mira la sincronización.', col: 'todo', order: 2 },
    { id: 't5', title: 'Preparar el vhost', desc: 'nginx + pm2 en producción.', col: 'done', order: 1 },
  ],
};

const nextOrder = (col: Card['col']): number =>
  Math.max(0, ...board.cards.filter((c) => c.col === col).map((c) => c.order)) + 1;

export const getBoard = server(
  { autoSync: true, autoSyncInterval: 2500 },
  async (): Promise<Board> => ({ ...board, cards: [...board.cards] })
);

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const createCard = server(
  async (data: { title: string; desc: string }): Promise<Card> => {
    const clean = String(data?.title ?? '').trim();
    const desc = String(data?.desc ?? '').trim();
    if (clean.length < 2) throw new Error('El título necesita al menos 2 caracteres.');
    if (clean.length > 60) throw new Error('El título es demasiado largo (máx. 60).');
    if (desc.length > 200) throw new Error('La descripción es demasiado larga (máx. 200).');
    await delay(450);
    const card: Card = { id: `t${Date.now()}`, title: clean, desc, col: 'todo', order: nextOrder('todo') };
    board = { ...board, cards: [...board.cards, card] };
    return card;
  }
);

export const moveCard = server(
  async (id: string, col: Card['col']): Promise<Board> => {
    await delay(650);
    const card = board.cards.find((c) => c.id === id);
    if (!card) throw new Error(`Card ${id} not found`);
    board = {
      ...board,
      cards: board.cards.map((c) => (c.id === id ? { ...c, col, order: nextOrder(col) } : c)),
    };
    return { ...board, cards: [...board.cards] };
  }
);

export const deleteCard = server(
  async (id: string): Promise<Board> => {
    await delay(450);
    board = { ...board, cards: board.cards.filter((c) => c.id !== id) };
    return { ...board, cards: [...board.cards] };
  }
);

// ── Agente AI con tools ─────────────────────────────────────────────────────
// El modelo decide qué herramienta llamar; cada tool ejecuta contra el MISMO
// estado del tablero (closure del módulo). El resultado vuelve al modelo y el
// loop produce la respuesta final.
const boardAgent = aiAgent(
  {
    system:
      'You are the AstraTasks assistant. Answer in the same language as the user. Use the tools to inspect and modify the kanban board.',
    model: 'qwen2.5-coder:7b',
    maxSteps: 4,
    tools: [
      {
        schema: {
          name: 'getBoard',
          description: 'List the cards in every column of the board.',
          parameters: { type: 'object', properties: {} },
        },
        fn: async () => ({ ...board, cards: [...board.cards] }),
      },
      {
        schema: {
          name: 'moveCard',
          description: 'Move a card to another column (todo, doing or done).',
          parameters: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Card id' },
              col: { type: 'string', enum: ['todo', 'doing', 'done'] },
            },
            required: ['id', 'col'],
          },
        },
        fn: async (id: unknown, col: unknown) => moveCard(String(id), String(col) as Card['col']),
      },
      {
        schema: {
          name: 'createCard',
          description: 'Create a new card in the todo column.',
          parameters: {
            type: 'object',
            properties: { title: { type: 'string' }, desc: { type: 'string' } },
            required: ['title'],
          },
        },
        fn: async (title: unknown, desc: unknown) =>
          createCard({ title: String(title ?? ''), desc: String(desc ?? '') }),
      },
    ],
  }
);

export const askAgent = server(async (question: string) => boardAgent.run(question));
