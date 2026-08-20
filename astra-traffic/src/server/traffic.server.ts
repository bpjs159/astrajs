/**
 * astra-traffic — RPC backend.
 *
 * Lee el access log de nginx (combinado) y calcula métricas de tráfico.
 * La ruta del log se configura con la env `NGINX_LOG` (default
 * /var/log/nginx/access.log). autoSync: true → el cliente sondea con
 * ETag y solo recibe datos cuando el log cambió.
 */
import { server } from 'astrajs.dev/server';

export interface SiteTraffic {
  site: string;
  total: number;
  uniqueIps: number;
}

export interface TrafficSnapshot {
  total: number;
  uniqueIps: number;
  statusCodes: Record<string, number>;
  topIps: { key: string; count: number }[];
  topPaths: { key: string; count: number }[];
  byHour: number[];
  byDay: { day: string; count: number }[];
  bySite: SiteTraffic[];
  logDir: string;
  lastLog: string;
}

// Formato combinado de nginx (combined log format).
// NOTA: se usan escapes \x22 (comilla doble) para que el parser de
// server() (stripCommentsAndStrings) no confunda las comillas del regex
// con delimitadores de string y rompa la detección de la llamada RPC.
const LINE_RE = /^(\S+) \S+ \S+ \[([^\]]+)\] \x22(\S+) ([^\x22]*)\x22 (\d{3}) (\S+) \x22([^\x22]*)\x22 \x22([^\x22]*)\x22$/;

async function parseLogs(): Promise<TrafficSnapshot> {
  // node:fs se importa dinámicamente para que el bundle del cliente (que
  // reemplaza server() por un fetch wrapper) no intente resolver node:fs.
  const { readdirSync, readFileSync, existsSync } = await import('node:fs');
  const { join } = await import('node:path');
  const LOG_DIR =
    (globalThis as { process?: { env?: Record<string, string> } }).process?.env?.NGINX_LOG_DIR ??
    '/var/log/nginx';

  const empty = (): TrafficSnapshot => ({
    total: 0,
    uniqueIps: 0,
    statusCodes: {},
    topIps: [],
    topPaths: [],
    byHour: Array(24).fill(0),
    byDay: [],
    bySite: [],
    logDir: LOG_DIR,
    lastLog: '',
  });

  if (!existsSync(LOG_DIR)) return empty();

  let files: string[] = [];
  try {
    // Todos los access logs del directorio (excluye error.log y rotados .gz).
    files = readdirSync(LOG_DIR).filter(
      (f) => f.endsWith('.log') && !f.includes('error') && !f.includes('access.log.'),
    );
  } catch {
    return empty();
  }

  const ipCount: Record<string, number> = {};
  const pathCount: Record<string, number> = {};
  const statusCount: Record<string, number> = {};
  const hourCount = Array(24).fill(0) as number[];
  const dayCount: Record<string, number> = {};
  const siteCount: Record<string, { total: number; ips: Set<string> }> = {};
  let lastLog = '';

  for (const file of files) {
    const site = file.replace(/\.log$/, '');
    const full = join(LOG_DIR, file);
    let raw = '';
    try {
      raw = readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    const lines = raw.split('\n').filter(Boolean);
    const siteIps = new Set<string>();

    for (const line of lines) {
      const m = LINE_RE.exec(line);
      if (!m) continue;
      const ip = m[1];
      const time = m[2]; // [19/Aug/2026:14:23:45 +0000]
      const path = m[4];
      const status = m[5];

      ipCount[ip] = (ipCount[ip] ?? 0) + 1;
      pathCount[path] = (pathCount[path] ?? 0) + 1;
      statusCount[status] = (statusCount[status] ?? 0) + 1;
      siteIps.add(ip);

      const hm = /:(\d{2}):/.exec(time);
      if (hm) hourCount[parseInt(hm[1], 10)]++;

      const day = time.slice(0, 11); // "19/Aug/2026"
      dayCount[day] = (dayCount[day] ?? 0) + 1;
      lastLog = line;
    }

    siteCount[site] = { total: lines.length, ips: siteIps };
  }

  const top = (obj: Record<string, number>, n: number) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k, v]) => ({ key: k, count: v }));

  const bySite: SiteTraffic[] = Object.entries(siteCount)
    .map(([site, v]) => ({ site, total: v.total, uniqueIps: v.ips.size }))
    .sort((a, b) => b.total - a.total);

  return {
    total: bySite.reduce((a, s) => a + s.total, 0),
    uniqueIps: Object.keys(ipCount).length,
    statusCodes: statusCount,
    topIps: top(ipCount, 10),
    topPaths: top(pathCount, 10),
    byHour: hourCount,
    byDay: Object.entries(dayCount)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, count]) => ({ day, count })),
    bySite,
    logDir: LOG_DIR,
    lastLog,
  };
}

export const getTraffic = server(
  { autoSync: true, autoSyncInterval: 5000 },
  async (): Promise<TrafficSnapshot> => parseLogs(),
);
