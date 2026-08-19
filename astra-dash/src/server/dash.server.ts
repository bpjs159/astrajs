/**
 * astra-dash — RPC backend.
 *
 * - getSnapshot: autoSync (ETag + 304) → el cliente sondea y solo paga
 *   transferencia cuando algo cambió.
 * - uploadReport: valida tamaño y resume filas/columnas del reporte.
 *
 * El estado vive en este módulo; solo el PROCESO del servidor lo avanza
 * (guard `typeof window === 'undefined'` — el bundle del navegador no
 * corre el timer; sus métricas vienen siempre por RPC).
 */
import { server, configureRPC } from 'astrajs.dev/server';

configureRPC({ maxBodyBytes: 1 << 20 });

export interface Snapshot {
  visits: number;
  orders: number;
  revenue: number;
  cpu: number;
  history: number[];
  lastTick: number;
}

const SEED_HISTORY = [
  42, 45, 41, 52, 55, 49, 60, 58, 66, 61, 70, 68,
  74, 71, 78, 76, 81, 79, 85, 82, 88, 86, 91, 89,
];

let snapshot: Snapshot = {
  visits: 8421,
  orders: 517,
  revenue: 23480,
  cpu: 34,
  history: [...SEED_HISTORY],
  lastTick: Date.now(),
};

if (typeof window === 'undefined') {
  setInterval(() => {
    const jitter = (n: number) => Math.max(1, n + Math.round((Math.random() - 0.45) * 12));
    const visits = jitter(snapshot.visits);
    snapshot = {
      visits,
      orders: snapshot.orders + (Math.random() > 0.55 ? 1 : 0),
      revenue: snapshot.revenue + Math.round(Math.random() * 140),
      cpu: Math.min(96, Math.max(6, snapshot.cpu + Math.round((Math.random() - 0.5) * 14))),
      history: [...snapshot.history.slice(-23), visits],
      lastTick: Date.now(),
    };
  }, 2200);
}

/**
 * autoSync: true → el handler calcula un ETag y honra If-None-Match.
 * El cliente sondea cada 2.5s y recibe 304 cuando nada cambió.
 */
export const getSnapshot = server(
  { autoSync: true, autoSyncInterval: 2500 },
  async (): Promise<Snapshot> => snapshot
);

const MAX_BYTES = 512 * 1024;

export const uploadReport = server(
  async (text: string, name: string) => {
    const bytes = Buffer.from(text, 'utf8').length;
    if (bytes > MAX_BYTES) {
      return { ok: false as const, error: 'up.tooLarge' };
    }
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      return { ok: false as const, error: 'up.empty' };
    }
    const cols = (lines[0] ?? '').split(',').length;
    return {
      ok: true as const,
      summary: {
        name: name.slice(0, 120),
        bytes,
        rows: lines.length,
        cols,
        at: new Date().toISOString(),
      },
    };
  }
);
